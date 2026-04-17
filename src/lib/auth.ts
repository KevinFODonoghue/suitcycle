import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole, UserStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { ensureUniqueHandle } from "@/lib/users";

// Note: typing mismatch between next-auth v4 and @auth/* adapters; cast to any.
const baseAdapter = PrismaAdapter(prisma) as any;
const adapter: any = {
  ...baseAdapter,
  // Ensure required columns exist when creating a user
  createUser: async (data: any) => {
    const name = data.name ?? null;
    const email = data.email!.toLowerCase();
    const image = (data as any).image ?? null;
    const base = name ?? email?.split("@")[0] ?? "user";
    const handle = await ensureUniqueHandle(base);

    return prisma.user.create({
      data: {
        email,
        name,
        fullName: name,
        image,
        avatarUrl: image,
        handle,
        emailVerified: (data as any).emailVerified ?? null,
      },
    });
  },
};

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            fullName: true,
            handle: true,
            avatarUrl: true,
            image: true,
            status: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          throw new Error("Invalid credentials.");
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          throw new Error("Invalid credentials.");
        }

        if (user.status === UserStatus.banned) {
          throw new Error("BANNED");
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          name: user.fullName ?? user.email,
          handle: user.handle,
          avatarUrl: user.avatarUrl ?? user.image ?? null,
          role: user.role,
          status: user.status,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { status: true },
      });

      if (dbUser?.status === UserStatus.banned) {
        return "/login?error=BANNED";
      }

      return true;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub) {
        return session;
      }

      session.user.id = token.sub;
      session.user.status =
        token.status === "banned" ? "banned" : "active";
      session.user.role =
        (typeof token.role === "string" ? token.role : "user") === "admin" ? "admin" : "user";

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            fullName: true,
            handle: true,
            bio: true,
            avatarUrl: true,
            image: true,
            stripeAccountId: true,
            status: true,
            role: true,
          },
        });

        if (dbUser) {
          session.user.name = dbUser.fullName ?? session.user.name ?? null;
          session.user.email = dbUser.email;
          session.user.fullName = dbUser.fullName ?? null;
          session.user.handle = dbUser.handle;
          session.user.bio = dbUser.bio ?? null;
          const avatar = dbUser.avatarUrl ?? dbUser.image ?? null;
          session.user.avatarUrl = avatar;
          session.user.image = avatar;
          session.user.stripeAccountId = dbUser.stripeAccountId ?? null;
          session.user.status = dbUser.status;
          session.user.role = dbUser.role;
          return session;
        }
      } catch (error) {
        console.error("[auth:session]", error);
      }

      session.user.fullName =
        (typeof token.fullName === "string" || token.fullName === null
          ? token.fullName
          : null) ?? null;
      session.user.handle =
        (typeof token.handle === "string" ? token.handle : session.user.handle) ??
        session.user.handle ??
        "";
      session.user.bio =
        (typeof token.bio === "string" || token.bio === null ? token.bio : null) ??
        null;
      session.user.avatarUrl =
        (typeof token.avatarUrl === "string" || token.avatarUrl === null
          ? token.avatarUrl
          : null) ?? null;
      session.user.image = session.user.avatarUrl;
      session.user.stripeAccountId =
        (typeof token.stripeAccountId === "string" || token.stripeAccountId === null
          ? token.stripeAccountId
          : null) ?? null;
      session.user.status =
        (typeof token.status === "string" ? token.status : "active") === "banned"
          ? "banned"
          : "active";
      session.user.role =
        (typeof token.role === "string" ? token.role : "user") === "admin" ? "admin" : "user";

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              email: true,
              fullName: true,
              handle: true,
              bio: true,
              avatarUrl: true,
              image: true,
              stripeAccountId: true,
              status: true,
              role: true,
            },
          });

          if (dbUser) {
            let role = dbUser.role ?? UserRole.user;
            if (dbUser.email && isAdminEmail(dbUser.email) && dbUser.role !== UserRole.admin) {
              await prisma.user.update({
                where: { id: user.id },
                data: { role: UserRole.admin },
              });
              role = UserRole.admin;
            }

            token.fullName = dbUser.fullName ?? user.name ?? null;
            token.handle = dbUser.handle ?? token.handle;
            token.bio = dbUser.bio ?? null;
            token.avatarUrl = dbUser.avatarUrl ?? dbUser.image ?? token.avatarUrl ?? null;
            token.stripeAccountId = dbUser.stripeAccountId ?? null;
            token.status = dbUser.status;
            token.role = role;
            return token;
          }
        } catch (error) {
          console.error("[auth:jwt]", error);
        }

        token.fullName = (user as any).fullName ?? user.name ?? null;
        token.handle = (user as any).handle ?? token.handle;
        token.bio = (user as any).bio ?? null;
        token.avatarUrl =
          (user as any).avatarUrl ?? (user as any).image ?? token.avatarUrl ?? null;
        token.stripeAccountId = (user as any).stripeAccountId ?? null;
        token.status = (user as any).status ?? "active";
        token.role = (user as any).role ?? token.role ?? "user";
      }

      token.role =
        (typeof token.role === "string" ? token.role : "user") === "admin" ? "admin" : "user";
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) {
          return url;
        }
      } catch {
        // ignore parse errors
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return null;
  }

  if (session.user.status === "banned") {
    return null;
  }

  return session;
}

export async function getSessionUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.id as string | undefined;
}
