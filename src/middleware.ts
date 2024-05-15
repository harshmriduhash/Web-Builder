import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PAGE_ROUTES } from "./utils/routes";

const isPublicRoute = createRouteMatcher([
  PAGE_ROUTES.LANDING_PAGE,
  "/api/uploadthing",
  PAGE_ROUTES.AGENCY_SIGN_IN,
  PAGE_ROUTES.AGENCY_SIGN_UP,
]);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers;
  const searchParams = url.searchParams.toString();
  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // BEFORE USER IS AUTHENTICATED

  // check and rewrite for subdomains (logic is written in Readme.md)
  const customSubDomain = hostname
    .get("host")
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  // if user is accessing the landing page, rewrite to the /site
  if (url.pathname === "/" || url.pathname === PAGE_ROUTES.LANDING_PAGE) {
    return NextResponse.rewrite(new URL(PAGE_ROUTES.LANDING_PAGE, req.url));
  }

  // if user is accessing signin or signup page, redirect to agency signin page
  if (
    url.pathname === PAGE_ROUTES.SIGN_IN ||
    url.pathname === PAGE_ROUTES.SIGN_UP
  ) {
    return NextResponse.redirect(new URL(PAGE_ROUTES.AGENCY_SIGN_IN, req.url));
  }

  // if user is accessing agency or subaccount, rewrite to their dashboard with the search params
  if (
    url.pathname.startsWith(PAGE_ROUTES.AGENCY_ROOT_PAGE) ||
    url.pathname.startsWith(PAGE_ROUTES.SUBACCOUNT_ROOT_PAGE)
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }

  //  CHECK FOR USER AUTHENTICATION
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // AFTER USER IS AUTHENTICATED
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
