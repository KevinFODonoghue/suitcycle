import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Plus, ChevronRight, Tag, Package } from "lucide-react";
import { ListingActions } from "./ListingActions";

export const metadata: Metadata = { title: "My Listings" };

export default async function AccountListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/account/listings");

  const userId = session.user.id as string;

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      brand: true,
      model: true,
      size: true,
      price: true,
      status: true,
      photos: true,
      condition: true,
      createdAt: true,
      _count: { select: { favorites: true } },
    },
  });

  const counts = {
    active: listings.filter((l) => l.status === "active").length,
    draft: listings.filter((l) => l.status === "draft").length,
    sold: listings.filter((l) => l.status === "sold").length,
    archived: listings.filter((l) => l.status === "archived").length,
  };

  const STATUS_BADGE: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    sold: "bg-blue-100 text-blue-700",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A1A2E] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to account
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">My Listings</h1>
              <p className="text-sm text-[#64748B] mt-1">{listings.length} total listings</p>
            </div>
            <Link
              href="/sell"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors shrink-0"
            >
              <Plus size={16} />
              New listing
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active", value: counts.active, color: "text-green-600", bg: "bg-green-50 border-green-100" },
            { label: "Draft", value: counts.draft, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
            { label: "Sold", value: counts.sold, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { label: "Archived", value: counts.archived, color: "text-slate-500", bg: "bg-white border-slate-100" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-4">
              <Tag size={22} className="text-[#00B4FF]" />
            </div>
            <p className="font-semibold text-[#1A1A2E] mb-1">No listings yet</p>
            <p className="text-sm text-[#64748B] mb-5">Create your first listing in just a few minutes.</p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors"
            >
              <Plus size={15} />
              List a suit
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
            {listings.map((listing) => {
              const photo = listing.photos[0] ?? null;
              return (
                <div key={listing.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Photo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={`${listing.brand} ${listing.model}`}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                        {listing.brand} {listing.model}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[listing.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Size {listing.size} · {formatPrice(listing.price)}
                      {listing._count.favorites > 0 && ` · ♥ ${listing._count.favorites}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Listed {new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="text-xs text-[#00B4FF] hover:underline font-medium"
                    >
                      View
                    </Link>
                    <ListingActions listingId={listing.id} currentStatus={listing.status as any} />
                  </div>

                  <ChevronRight size={15} className="text-slate-300 shrink-0 hidden sm:block" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
