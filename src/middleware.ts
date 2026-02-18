import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Authentication only — onboarding redirect handled client-side
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Authorized callback - token exists:", !!token);
        // Only allow if token exists (user is authenticated)
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/item-log",
    "/profile",
    "/onboarding",
    "/members",
  ],
};
