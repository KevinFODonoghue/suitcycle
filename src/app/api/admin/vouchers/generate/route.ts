import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { VoucherType } from "@prisma/client";

// Alphanumeric, excluding confusing characters: 0/O, 1/I
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateCode(): string {
  const chars = Array.from(
    { length: 8 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  );
  return `SC-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

const VALID_TYPES: VoucherType[] = [
  "priority_listing",
  "authentication",
  "verified_suitscore",
  "membership_trial",
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, quantity, expiresAt } = body as {
    type?: unknown;
    quantity?: unknown;
    expiresAt?: unknown;
  };

  if (typeof type !== "string" || !VALID_TYPES.includes(type as VoucherType)) {
    return NextResponse.json({ error: "Invalid voucher type" }, { status: 400 });
  }

  const qty = typeof quantity === "number" ? Math.round(quantity) : parseInt(String(quantity), 10);
  if (isNaN(qty) || qty < 1 || qty > 50) {
    return NextResponse.json({ error: "Quantity must be between 1 and 50" }, { status: 400 });
  }

  let parsedExpiry: Date | null = null;
  if (expiresAt && typeof expiresAt === "string" && expiresAt.trim()) {
    parsedExpiry = new Date(expiresAt);
    if (isNaN(parsedExpiry.getTime()) || parsedExpiry <= new Date()) {
      return NextResponse.json({ error: "Expiration date must be in the future" }, { status: 400 });
    }
  }

  // Generate unique codes — retry on collision (extremely unlikely).
  const codes: string[] = [];
  let attempts = 0;

  while (codes.length < qty && attempts < qty * 10) {
    attempts++;
    const code = generateCode();
    if (codes.includes(code)) continue;

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (!existing) codes.push(code);
  }

  if (codes.length < qty) {
    return NextResponse.json({ error: "Failed to generate unique codes" }, { status: 500 });
  }

  const vouchers = await prisma.$transaction(
    codes.map((code) =>
      prisma.voucher.create({
        data: {
          code,
          type: type as VoucherType,
          expiresAt: parsedExpiry ?? undefined,
        },
      }),
    ),
  );

  return NextResponse.json({ codes: vouchers.map((v) => v.code) }, { status: 201 });
}
