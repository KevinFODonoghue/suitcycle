import { PackageSearch } from "lucide-react";
import { ListingCard, type ListingCardData } from "./ListingCard";
import { StaggerGrid, StaggerItem } from "@/components/ui/FadeIn";

interface ListingGridProps {
  listings: ListingCardData[];
  total: number;
}

export function ListingGrid({ listings, total }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mb-4">
          <PackageSearch size={28} className="text-[#00B4FF]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">No listings found</h3>
        <p className="text-sm text-[#64748B] max-w-xs">
          Try adjusting your filters or check back soon, new suits are listed every day.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#64748B] mb-4">
        {total} {total === 1 ? "listing" : "listings"} found
      </p>
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <StaggerItem key={listing.id}>
            <ListingCard listing={listing} />
          </StaggerItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
