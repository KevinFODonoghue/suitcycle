// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) {
        return false;
      }

      if (token.status === "banned") {
        return false;
      }

      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token.role === "admin";
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/account/:path*", "/api/account/:path*", "/api/admin/:path*", "/sell/:path*", "/admin/:path*", "/messages/:path*", "/orders/:path*", "/checkout/:path*"],
};
