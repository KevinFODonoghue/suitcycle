// app/api/account/addresses/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressSchema } from "@/lib/validators/account";
import { parseWithZod } from "@/lib/validation/utils";
import { captureError } from "@/lib/logging";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";

export const dynamic = "force-dynamic";

const addressSelect = {
  id: true,
  type: true,
  recipientName: true,
  phone: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * GET /api/account/addresses
 * List current user's addresses grouped by type with defaults first.
 */
export async function GET() {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { type: "asc" },
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
      select: addressSelect,
    });

    return NextResponse.json(items);
  } catch (error) {
    captureError(error, { route: "GET /api/account/addresses" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/account/addresses
 * Create an address; ensure only one default per type.
 */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req);
    enforceRateLimit({
      identifier: generateRateLimitKey("api:accountAddress:create", session.user.id ?? ip),
      limit: 10,
      windowMs: 60_000,
    });

    const body = await req.json();
    const validation = parseWithZod(AddressSchema, body);
    if (!validation.success) {
      return NextResponse.json(validation.details, { status: 400 });
    }

    const { isDefault = false, ...address } = validation.data;
    const { phone, line2, ...rest } = address;
    const userId = session.user.id;

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, type: address.type, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          ...rest,
          phone: phone ?? null,
          line2: line2 ?? null,
          isDefault,
        },
        select: addressSelect,
      });
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    captureError(error, { route: "POST /api/account/addresses" });
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Duplicate address detected" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
