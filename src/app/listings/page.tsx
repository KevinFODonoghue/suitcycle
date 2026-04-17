import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { buildListingQuery, LISTINGS_PAGE_SIZE } from "@/lib/search/listings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { ListingPagination } from "@/components/listings/ListingPagination";
import { SearchBar } from "@/components/listings/SearchBar";
import type { ListingCardData } from "@/components/listings/ListingCard";

export const metadata: Metadata = {
  title: "Browse Tech Suits",
  description:
    "Shop pre-owned technical racing swimsuits from Arena, Speedo, TYR and more. Every listing graded with SuitScore™.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  // Build URLSearchParams from Next.js searchParams
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => urlParams.append(key, v));
    } else {
      urlParams.set(key, value);
    }
  }

  const query = buildListingQuery(urlParams);
  const page = parseInt(urlParams.get("page") ?? "1", 10) || 1;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      ...query,
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        size: true,
        condition: true,
        ageCategory: true,
        price: true,
        photos: true,
        isPriority: true,
        seller: { select: { name: true } },
        favorites: userId
          ? { where: { userId }, select: { userId: true } }
          : { select: { userId: true }, take: 0 },
      },
    }),
    prisma.listing.count({ where: query.where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE));

  const cardData: ListingCardData[] = listings.map((l) => ({
    ...l,
    isFavorited: l.favorites.length > 0,
  }));

  const searchQuery = urlParams.get("q");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-1">
            {searchQuery ? `Results for "${searchQuery}"` : "Browse Tech Suits"}
          </h1>
          <p className="text-[#64748B]">
            {searchQuery
              ? `${total} listing${total !== 1 ? "s" : ""} matching your search`
              : "Pre-owned technical racing suits, graded with SuitScore™"}
          </p>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar / mobile filter button */}
          <Suspense fallback={null}>
            <ListingFilters />
          </Suspense>

          {/* Grid + pagination */}
          <div className="flex-1 min-w-0">
            <ListingGrid listings={cardData} total={total} />

            <Suspense fallback={null}>
              <ListingPagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
