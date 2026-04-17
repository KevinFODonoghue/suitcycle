// app/api/account/addresses/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

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
 * PUT /api/account/addresses/:id
 * Update an address (only if it belongs to the user).
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let addressId = id;

  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req);
    enforceRateLimit({
      identifier: generateRateLimitKey("api:accountAddress:update", session.user.id ?? ip),
      limit: 10,
      windowMs: 60_000,
    });

    const body = await req.json();
    const input = { ...(body as Record<string, unknown>), id } as z.input<typeof AddressSchema>;
    const validation = parseWithZod(AddressSchema, input);
    if (!validation.success) {
      return NextResponse.json(validation.details, { status: 400 });
    }

    const { id: parsedId, isDefault = false, ...address } = validation.data;
    addressId = parsedId ?? id;
    const { phone, line2, ...rest } = address;
    const userId = session.user.id;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findUnique({
        where: { id: addressId },
        select: { id: true, userId: true, type: true },
      });

      if (!existing || existing.userId !== userId) {
        throw new Error("Address not found");
      }

      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, type: address.type, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...rest,
          phone: phone ?? null,
          line2: line2 ?? null,
          isDefault,
        },
        select: addressSelect,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    captureError(error, {
      route: "PUT /api/account/addresses/:id",
      addressId,
    });
    const message =
      error instanceof Error && error.message === "Address not found"
        ? error.message
        : "Server error";
    const status = message === "Address not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/account/addresses/:id
 * Delete an address (only if it belongs to the user).
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    enforceRateLimit({
      identifier: generateRateLimitKey("api:accountAddress:delete", userId ?? getRequestIp(req)),
      limit: 12,
      windowMs: 60_000,
    });

    // Ownership check
    const exists = await prisma.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    captureError(error, {
      route: "DELETE /api/account/addresses/:id",
      addressId: id,
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
