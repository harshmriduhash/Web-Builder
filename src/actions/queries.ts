"use server";

import { redirect } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { Agency, InvitationStatus, Role, User } from "@prisma/client";

import { MESSAGES, NOTIFICATION_MSGS } from "@/utils/messages";
import { db } from "../lib/db";
import { PAGE_ROUTES } from "@/utils/routes";

export const getAuthUserDetailsAction = async () => {
  try {
    // STEP 1: check if we have logged in user.
    const user = await currentUser();
    if (!user) throw new Error(MESSAGES.USER_NOT_AUTHENTICATED);

    // STEP2:  get user data along with permissions, agency sidebar options and sub accounts sidebar options
    const userData = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      include: {
        Agency: {
          include: {
            SidebarOptions: true,
            SubAccounts: {
              include: {
                SidebarOptions: true,
              },
            },
          },
        },
        Permissions: true,
      },
    });

    if (!userData) throw new Error(MESSAGES.USER_NOT_FOUND);

    return { success: true, data: userData };
  } catch (_) {
    const error = _ as Error;
    console.log("🚀 ~ getAuthUserDetailsAction ~ error:", error);
    return { success: false, message: `${error.message}` };
  }
};

export const verifyAndAcceptInvitationAction = async () => {
  // STEP 1: check if we have logged in user.
  const user = await currentUser();
  if (!user) {
    return redirect(PAGE_ROUTES.AGENCY_SIGN_IN);
  }
  try {
    // STEP 2: check if the user has an invitation with Pending status
    const invitationExists = await db.invitation.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        status: InvitationStatus.PENDING,
      },
    });

    // STEP 3: check if we have pending invitation exists for the user.
    if (invitationExists) {
      // STEP 4: create a new user in db with the invited role and add him to the team belonging to the agency
      const userDetails = await createTeamUserAction(
        invitationExists.agencyId,
        // user data
        {
          email: invitationExists.email,
          role: invitationExists.role,
          agencyId: invitationExists.agencyId,
          avatarUrl: user.imageUrl,
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      //   STEP 5: save the activity log for the user to accept the invitation
      await saveActivityLogsNotificationAction({
        agencyId: invitationExists.agencyId,
        description: NOTIFICATION_MSGS.JOINED_AGENCY,
        subAccountId: undefined,
      });

      //   STEP 6: set the role of user to clerk
      if (userDetails && "role" in userDetails) {
        await clerkClient.users.updateUserMetadata(user.id, {
          privateMetadata: {
            role: userDetails.role || Role.SUBACCOUNT_USER,
          },
        });

        // STEP 7: delete the invitation
        await db.invitation.delete({ where: { id: invitationExists.id } });

        return invitationExists.agencyId;
      }

      return null;
    } else {
      // fetch user data and return it's agencyId or null
      const fetchedUser = await db.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
      });

      return fetchedUser ? fetchedUser.agencyId : null;
    }
  } catch (_) {
    const error = _ as Error;
    console.log("🚀 ~ verifyAndAcceptInvitationAction ~ error:", error);
    return { success: false, message: `${error.message}` };
  }
};

// to add a user to an existing agency
export const createTeamUserAction = async (agencyId: string, user: User) => {
  try {
    // STEP1: Agency admin has already a team user
    if (user.role === "AGENCY_ADMIN") return null;

    // STEP2: create the team user if not agency admin
    const response = await db.user.create({ data: { ...user } });

    return response;
  } catch (_) {
    const error = _ as Error;
    console.log("🚀 ~ createTeamUserAction ~ error:", error);

    return { success: false, message: `${error.message}` };
  }
};

// to save logs for every action in the database,
// we can use these logs to show for the notifications.
export const saveActivityLogsNotificationAction = async ({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string;
  description: string;
  subAccountId?: string;
}) => {
  try {
    // step 1: check if agencyId or subAccountId is provided
    if (!agencyId && !subAccountId) {
      throw new Error(MESSAGES.EITHER_AGENCY_ID_OR_SUBACCOUNT_ID_REQUIRED);
    }

    // Step2 : find user (authuser or userdata)
    // if action is not performed by the auth user, (e.g: contact us form), then find the user by subAccountId, whose form is filled to save the log by their name and send them notification.
    const authUser = await currentUser();
    let userData: User | null = null;

    if (!authUser) {
      const response = await db.user.findFirst({
        where: { Agency: { SubAccounts: { some: { id: subAccountId } } } },
      });

      if (response) {
        userData = response;
      }
    } else {
      userData = await db.user.findUnique({
        where: { email: authUser.emailAddresses[0].emailAddress },
      });
    }

    // STEP 3: if user data is not found, return
    if (!userData) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    let foundAgencyId: string | undefined = agencyId;

    // STEP 4: if agencyid directly not provided, check with subaccount's assosiated agencyid
    if (!foundAgencyId) {
      const subAccount = await db.subAccount.findUnique({
        where: { id: subAccountId },
      });

      if (subAccount) {
        foundAgencyId = subAccount.agencyId;
      }
    }

    // STEP 5: save the notification log & connect the log to User,Agency and SubAccount
    if (foundAgencyId) {
      await db.notification.create({
        data: {
          notification: `${userData.name} | ${description}`,
          User: { connect: { id: userData.id } },
          Agency: { connect: { id: foundAgencyId } },
          SubAccount: { connect: { id: subAccountId } },
        },
      });
    }
  } catch (_) {
    const error = _ as Error;
    console.log("🚀 ~ error:", error);
    return { success: false, message: `${error.message}` };
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  // STEP 1: check if we have logged in user.
  const user = await currentUser();
  if (!user) {
    return redirect(PAGE_ROUTES.AGENCY_SIGN_IN);
  }
  try {
    // STEP 2: check if the user is this agency admin
    const userDetails = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
    });

    if (
      userDetails?.role !== "AGENCY_ADMIN" ||
      userDetails?.agencyId !== agencyId
    ) {
      throw new Error(MESSAGES.UNAUTHORIZED_FOR_ACTION);
    }

    // STEP 3: update the agency details
    const response = await db.agency.update({
      where: { id: agencyId },
      data: { ...agencyDetails },
    });

    return { success: true, data: response };
  } catch (_) {
    const error = _ as Error;
    console.log("🚀 ~ updateAgencyDetails ~ error:", error);
    return { success: false, message: `${error.message}` };
  }
};
