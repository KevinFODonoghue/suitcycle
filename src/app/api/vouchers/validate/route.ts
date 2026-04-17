import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { VoucherType } from "@prisma/client";

export const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  priority_listing: "Priority Listing",
  authentication: "Brand Authentication",
  verified_suitscore: "Verified SuitScore™",
  membership_trial: "Membership Trial",
};

const VALID_TYPES = Object.keys(VOUCHER_TYPE_LABELS) as VoucherType[];

/** POST /api/vouchers/validate
 *
 * Body: { code: string, type?: VoucherType }
 *
 * When `type` is provided:  validates the code AND checks it matches that perk type.
 * When `type` is omitted:   validates the code exists, isn't used, and returns its type
 *                           (used by the account page "Redeem Code" flow).
 *
 * Success:  { valid: true, type: VoucherType, typeLabel: string }
 * Failure:  { valid: false, reason: string, errorCode: string }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { valid: false, reason: "Unauthorized", errorCode: "unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Invalid request body", errorCode: "bad_request" },
      { status: 400 },
    );
  }

  const { code, type } = body as { code?: unknown; type?: unknown };

  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({
      valid: false,
      reason: "A voucher code is required.",
      errorCode: "missing_code",
    });
  }

  // `type` is optional. When provided it must be a known VoucherType.
  const expectType =
    typeof type === "string" && VALID_TYPES.includes(type as VoucherType)
      ? (type as VoucherType)
      : null;

  const voucher = await prisma.voucher.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!voucher) {
    return NextResponse.json({
      valid: false,
      reason: "Invalid code.",
      errorCode: "invalid",
    });
  }

  if (voucher.redeemedAt) {
    return NextResponse.json({
      valid: false,
      reason: "This code has already been used.",
      errorCode: "already_used",
    });
  }

  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    return NextResponse.json({
      valid: false,
      reason: "This code has expired.",
      errorCode: "expired",
    });
  }

  // When a specific type is required, check it matches.
  if (expectType && voucher.type !== expectType) {
    return NextResponse.json({
      valid: false,
      reason: `This code is for ${VOUCHER_TYPE_LABELS[voucher.type]} and cannot be used here.`,
      errorCode: "type_mismatch",
      actualType: voucher.type,
      actualTypeLabel: VOUCHER_TYPE_LABELS[voucher.type],
    });
  }

  return NextResponse.json({
    valid: true,
    type: voucher.type,
    typeLabel: VOUCHER_TYPE_LABELS[voucher.type],
  });
}
