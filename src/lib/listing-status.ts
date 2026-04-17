import { ListingStatus } from "@prisma/client";

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  [ListingStatus.draft]: "Draft",
  [ListingStatus.active]: "Active",
  [ListingStatus.sold]: "Sold",
  [ListingStatus.archived]: "Archived",
};

export const LISTING_STATUS_BADGE_CLASSES: Record<ListingStatus, string> = {
  [ListingStatus.draft]:
    "bg-amber-100 text-amber-800 border-transparent",
  [ListingStatus.active]:
    "bg-emerald-100 text-emerald-800 border-transparent",
  [ListingStatus.sold]:
    "bg-slate-200 text-slate-800 border-transparent",
  [ListingStatus.archived]:
    "bg-slate-800 text-white border-transparent",
};

export const LISTING_STATUS_ORDER: ListingStatus[] = [
  ListingStatus.draft,
  ListingStatus.active,
  ListingStatus.sold,
  ListingStatus.archived,
];

export function listingStatusLabel(status: ListingStatus): string {
  return LISTING_STATUS_LABEL[status];
}

export function listingStatusBadgeClass(status: ListingStatus): string {
  return LISTING_STATUS_BADGE_CLASSES[status];
}
