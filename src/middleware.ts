import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Authentication only — onboarding redirect handled client-side
  },
  {
    callbacks: {
      authorized: ({ token }) => {
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
    "/equipment",
    "/item-log",
    "/profile",
    "/onboarding",
    "/members",
    "/attendance",
    "/abilities",
    "/mounts",
  ],
};
