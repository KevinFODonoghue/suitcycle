import { serverEnvOnly } from "@/env.mjs";

const adminEmailSet = new Set(
  (serverEnvOnly.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0),
);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailSet.has(email.trim().toLowerCase());
}

type AdminCandidate = { email?: string | null; role?: "user" | "admin" | null | undefined };

export function hasAdminPrivileges(user?: AdminCandidate | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return isAdminEmail(user.email);
}

export function assertAdminSession(session: { user?: AdminCandidate } | null) {
  if (!hasAdminPrivileges(session?.user)) {
    const error = new Error("Unauthorized");
    (error as Error & { code?: string }).code = "UNAUTHORIZED";
    throw error;
  }
}
