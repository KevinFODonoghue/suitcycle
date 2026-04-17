import type { MetadataRoute } from "next";
import { ListingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  let listings: { id: string; updatedAt: Date }[] = [];
  try {
    listings = await prisma.listing.findMany({
      where: { status: ListingStatus.active },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.warn("[sitemap] Database unavailable, returning static routes only.");
    } else {
      throw error;
    }
  }

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now },
    { url: `${baseUrl}/listings`, lastModified: now },
    { url: `${baseUrl}/suitscore`, lastModified: now },
    { url: `${baseUrl}/grading`, lastModified: now },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
  }));

  return [...staticRoutes, ...listingRoutes];
}
