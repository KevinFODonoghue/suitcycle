// app/api/account/profile/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ProfileUpdateSchema } from "@/lib/validators/account";
import { requireSession } from "@/lib/auth";
import { parseWithZod } from "@/lib/validation/utils";
import { captureError } from "@/lib/logging";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/profile
 * Returns the current user's profile (401 if not signed in).
 */
export async function GET() {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        stripeAccountId: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: "GET /api/account/profile" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/account/profile
 * Body: { fullName: string; handle: string; bio?: string }
 * Validates with Zod and updates the current user.
 */
import { Prisma } from "@prisma/client";

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req);
    enforceRateLimit({
      identifier: generateRateLimitKey("api:accountProfile", session.user.id ?? ip),
      limit: 5,
      windowMs: 60_000,
    });

    const body = await req.json();
    const validation = parseWithZod(ProfileUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(validation.details, { status: 400 });
    }

    const { fullName, handle, bio } = validation.data;

    // Reserved handles
    const reserved = new Set(["admin", "support", "help", "team", "suitcycle"]);
    if (reserved.has(handle)) {
      return NextResponse.json({ error: "Handle not available" }, { status: 400 });
    }

    const userId = session.user.id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        name: fullName,
        handle,
        bio: bio ?? null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        stripeAccountId: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    // Unique constraint on handle
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      (error.meta?.target as string[]).includes("handle")
    ) {
      return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
    }
    captureError(error, { route: "PUT /api/account/profile" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
