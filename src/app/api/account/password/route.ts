import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logging";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req);
    enforceRateLimit({
      identifier: generateRateLimitKey("api:changePassword", session.user.id ?? ip),
      limit: 5,
      windowMs: 60_000,
    });

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // OAuth-only accounts have no password hash
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Your account uses Google sign-in. There is no password to change." },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureError(error, { route: "POST /api/account/password" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
