import AgencyDetails from "@/components/forms/agency-details";
import {
  getAuthUserDetailsAction,
  verifyAndAcceptInvitationAction,
} from "@/actions/queries";
import { PAGE_ROUTES } from "@/utils/routes";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: {
    plan: Plan;
    state: string;
    code: string;
  };
};

async function AgencyPage({ searchParams }: Props) {
  // step 1: verify and accept the invitation to join the agency.
  // this function will navigate to the agency sign in page if we don't have a logged in user
  const agencyId = await verifyAndAcceptInvitationAction();

  // get auth user details
  const user = await getAuthUserDetailsAction();

  // check if agencyId valid
  if (agencyId) {
    // if the user belongs to subaccount by anymeans, redirect them to the subaccount page
    if (
      user?.data?.role === "SUBACCOUNT_GUEST" ||
      user?.data?.role === "SUBACCOUNT_USER"
    ) {
      return redirect(PAGE_ROUTES.SUBACCOUNT_ROOT_PAGE);
    } else if (
      user?.data?.role === "AGENCY_OWNER" ||
      user?.data?.role === "AGENCY_ADMIN"
    ) {
      // else user belongs to the agency.
      // check if any of the search param is present
      if (searchParams.plan) {
        // redirect to the billing page with the plan selected
        return redirect(
          `${PAGE_ROUTES.AGENCY_ROOT_PAGE}/${agencyId}/billing?plan=${searchParams.plan}`
        );
      }

      if (searchParams.state) {
        // state comes from stripe connect (to connect their stripe account to our app). this state is an id
        // code confirms the successful connection of the stripe account, this also comes from stripe connect
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];

        if (!stateAgencyId) return <div>Not authorized</div>;

        return redirect(
          `${PAGE_ROUTES.AGENCY_ROOT_PAGE}/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      } else {
        // redirect to the agency's dashboard
        return redirect(`${PAGE_ROUTES.AGENCY_ROOT_PAGE}/${agencyId}`);
      }
    } else {
      // if agencyId is not valid
      return <div>Not authorized</div>;
    }
  }

  // if not a valid agencyId, allow user to create an agency
  const authUser = await currentUser();
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Agency</h1>
        <AgencyDetails
          agencyProps={{
            companyEmail: authUser?.emailAddresses[0].emailAddress,
          }}
        />
      </div>
    </div>
  );
}

export default AgencyPage;
