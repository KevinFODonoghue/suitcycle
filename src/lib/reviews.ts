import { ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type SellerReviewSummary = {
  average: number | null;
  count: number;
};

export async function getSellerReviewSummary(
  sellerId: string,
): Promise<SellerReviewSummary> {
  const result = await prisma.review.aggregate({
    where: {
      sellerId,
      status: ReviewStatus.published,
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const count = result._count.rating ?? 0;
  const average = count > 0 && result._avg.rating ? Number(result._avg.rating) : null;

  return { average, count };
}

export function formatAverageRating(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "New";
  }

  return value.toFixed(1);
}
