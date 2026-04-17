import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      fullName: string | null;
      handle: string;
      bio: string | null;
      avatarUrl: string | null;
      stripeAccountId: string | null;
      status: "active" | "banned";
      role: "user" | "admin";
    };
  }

  interface User {
    id: string;
    fullName: string | null;
    handle: string;
    bio: string | null;
    avatarUrl: string | null;
    stripeAccountId: string | null;
    status: "active" | "banned";
    role: "user" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    fullName?: string | null;
    handle?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    stripeAccountId?: string | null;
    status?: "active" | "banned";
     role?: "user" | "admin";
  }
}
