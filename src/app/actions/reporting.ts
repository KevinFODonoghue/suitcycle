"use server";

import { revalidatePath } from "next/cache";
import { FlagStatus } from "@prisma/client";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseWithZod } from "@/lib/validation/utils";
import { captureError } from "@/lib/logging";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-context";

type ActionState = {
  success?: boolean;
  error?: string;
};

const ReportSchema = z.object({
  targetId: z.string().min(1, "Invalid target."),
  reason: z
    .string()
    .trim()
    .min(10, "Please share at least 10 characters.")
    .max(2000, "Keep reports under 2000 characters."),
});

async function applyReportRateLimit(userId?: string | null) {
  const clientIp = await getClientIp();
  enforceRateLimit({
    identifier: generateRateLimitKey("reports:submit", userId ?? clientIp),
    limit: 5,
    windowMs: 120_000,
  });
}

export async function reportListing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to report listings." };
  }

  await applyReportRateLimit(session.user.id);

  const validation = parseWithZod(ReportSchema, {
    targetId: formData.get("listingId"),
    reason: formData.get("reason"),
  });

  if (!validation.success) {
    const firstError =
      validation.details.fieldErrors?.reason?.[0] ??
      validation.details.formErrors?.[0] ??
      validation.details.error;
    return { success: false, error: firstError ?? "Unable to submit report." };
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: validation.data.targetId },
      select: { id: true },
    });

    if (!listing) {
      return { success: false, error: "Listing not found." };
    }

    await prisma.flag.create({
      data: {
        userId: session.user.id,
        listingId: listing.id,
        reason: validation.data.reason,
        status: FlagStatus.open,
      },
    });

    revalidatePath(`/listings/${listing.id}`);
    return { success: true };
  } catch (error) {
    captureError(error, { action: "reporting:listing", userId: session.user.id });
    return { success: false, error: "Unable to submit report right now." };
  }
}

export async function reportReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to report reviews." };
  }

  applyReportRateLimit(session.user.id);

  const validation = parseWithZod(ReportSchema, {
    targetId: formData.get("reviewId"),
    reason: formData.get("reason"),
  });

  if (!validation.success) {
    const firstError =
      validation.details.fieldErrors?.reason?.[0] ??
      validation.details.formErrors?.[0] ??
      validation.details.error;
    return { success: false, error: firstError ?? "Unable to submit report." };
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: validation.data.targetId },
      select: {
        id: true,
        orderId: true,
        order: {
          select: { listingId: true },
        },
      },
    });

    if (!review) {
      return { success: false, error: "Review not found." };
    }

    await prisma.flag.create({
      data: {
        userId: session.user.id,
        reviewId: review.id,
        reason: validation.data.reason,
        status: FlagStatus.open,
      },
    });

    if (review.orderId) {
      revalidatePath(`/orders/${review.orderId}`);
    }
    if (review.order?.listingId) {
      revalidatePath(`/listings/${review.order.listingId}`);
    }

    return { success: true };
  } catch (error) {
    captureError(error, { action: "reporting:review", userId: session.user.id });
    return { success: false, error: "Unable to submit report right now." };
  }
}
