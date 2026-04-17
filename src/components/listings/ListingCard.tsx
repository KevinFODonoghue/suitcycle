import Link from "next/link";
import Image from "next/image";
import type { AgeCategory, SuitCondition } from "@prisma/client";
import { SuitScoreBadge } from "./SuitScoreBadge";
import { FavoriteButton } from "./FavoriteButton";

export interface ListingCardData {
  id: string;
  title: string;
  brand: string;
  model: string;
  size: string;
  condition: SuitCondition;
  ageCategory: AgeCategory;
  price: number; // cents
  photos: string[];
  isPriority: boolean;
  seller: {
    name: string | null;
  };
  isFavorited: boolean;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const photo = listing.photos[0] ?? null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${listing.brand} ${listing.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Priority badge */}
        {listing.isPriority && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#00B4FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Featured
            </span>
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-2 right-2">
          <FavoriteButton listingId={listing.id} initialFavorited={listing.isFavorited} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        {/* Brand + model */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#00B4FF] uppercase tracking-wide truncate">
              {listing.brand}
            </p>
            <p className="text-sm font-medium text-[#1A1A2E] truncate leading-tight mt-0.5">
              {listing.model}
            </p>
          </div>
          <p className="text-base font-bold text-[#1A1A2E] shrink-0 mt-0.5">
            {formatPrice(listing.price)}
          </p>
        </div>

        {/* Size + age badge + SuitScore */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5 font-medium shrink-0">
              Size {listing.size}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                listing.ageCategory === "twelve_and_under"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {listing.ageCategory === "twelve_and_under" ? "12U" : "13+"}
            </span>
          </div>
          <SuitScoreBadge condition={listing.condition} size="sm" />
        </div>
      </div>
    </Link>
  );
}
