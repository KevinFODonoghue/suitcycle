import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import { getSuitConditionMetadata } from "@/lib/suitscore";
import { getSellerReviewSummary } from "@/lib/reviews";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { SuitScoreBadge } from "@/components/listings/SuitScoreBadge";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import {
  ShoppingCart, MessageCircle, Shield, Star, Calendar,
  Ruler, User as UserIcon, Waves, Tag, Users,
} from "lucide-react";

const GENDER_LABELS: Record<string, string> = {
  male: "Men's",
  female: "Women's",
  unisex: "Unisex",
};

const STROKE_LABELS: Record<string, string> = {
  fly: "Butterfly",
  free: "Freestyle",
  breast: "Breaststroke",
  back: "Backstroke",
  im: "Individual Medley",
};

const SUIT_TYPE_LABELS: Record<string, string> = {
  jammer: "Jammer",
  kneeskin: "Kneeskin",
  fullBody: "Full Body",
  openBack: "Open Back",
};

const AGE_CATEGORY_LABELS: Record<string, string> = {
  twelve_and_under: "12 & Under",
  thirteen_and_over: "13 & Over (FINA-approved)",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, brand: true, model: true, photos: true, price: true },
  });
  if (!listing) return { title: "Listing not found" };

  return {
    title: `${listing.brand} ${listing.model}, ${formatPrice(listing.price)}`,
    description: `Buy a pre-owned ${listing.brand} ${listing.model} tech suit. Graded with SuitScore™.`,
    openGraph: {
      images: listing.photos[0] ? [listing.photos[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [listing, session] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
            createdAt: true,
          },
        },
        favorites: { select: { userId: true } },
      },
    }),
    getServerSession(authOptions),
  ]);

  if (!listing || listing.status !== "active") notFound();

  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isSeller = userId === listing.sellerId;
  const isFavorited = listing.favorites.some((f) => f.userId === userId);

  const [sellerReviews, relatedListings] = await Promise.all([
    getSellerReviewSummary(listing.sellerId),
    prisma.listing.findMany({
      where: {
        status: "active",
        id: { not: listing.id },
        OR: [{ brand: listing.brand }, { size: listing.size }],
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, brand: true, model: true, size: true,
        condition: true, ageCategory: true, price: true, photos: true, isPriority: true,
        seller: { select: { name: true } },
        favorites: userId
          ? { where: { userId }, select: { userId: true } }
          : { select: { userId: true }, take: 0 },
      },
    }),
  ]);

  const tierMeta = getSuitConditionMetadata(listing.condition);
  const sellerAvatar = listing.seller.avatarUrl ?? listing.seller.image;
  const memberSince = new Date(listing.seller.createdAt).getFullYear();

  const relatedCards: ListingCardData[] = relatedListings.map((l) => ({
    ...l,
    isFavorited: l.favorites.length > 0,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-[#64748B]">
            <Link href="/" className="hover:text-[#00B4FF] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-[#00B4FF] transition-colors">Browse</Link>
            <span>/</span>
            <span className="text-[#1A1A2E] truncate max-w-xs">{listing.brand} {listing.model}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Left, gallery */}
          <div>
            <ListingGallery photos={listing.photos} alt={`${listing.brand} ${listing.model}`} />
          </div>

          {/* Right, details */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-[#00B4FF] uppercase tracking-wide mb-1">
                    {listing.brand}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] leading-tight">
                    {listing.model}
                  </h1>
                </div>
                <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />
              </div>

              {/* Price */}
              <p className="text-4xl font-extrabold text-[#1A1A2E] mt-3">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* SuitScore card */}
            <div
              className="rounded-2xl border-2 p-4"
              style={{ borderColor: TIER_BORDER_COLORS[listing.condition] }}
            >
              <div className="flex items-center gap-3 mb-3">
                <SuitScoreBadge condition={listing.condition} size="lg" showRaces />
                <span className="text-sm text-[#64748B]">{tierMeta.performance}</span>
              </div>
              <p className="text-sm text-[#1A1A2E] font-medium mb-3">{tierMeta.summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tierMeta.metrics.map((metric) => (
                  <div key={metric.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-[#1A1A2E] mb-1">{metric.label}</p>
                    <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/suitscore"
                className="inline-block mt-3 text-xs text-[#00B4FF] hover:underline"
              >
                Learn about SuitScore™ grading →
              </Link>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Ruler, label: "Size", value: listing.size },
                { icon: UserIcon, label: "Gender Fit", value: GENDER_LABELS[listing.genderFit] ?? listing.genderFit },
                { icon: Tag, label: "Suit Type", value: SUIT_TYPE_LABELS[listing.suitType] ?? listing.suitType },
                { icon: Users, label: "Age Category", value: AGE_CATEGORY_LABELS[listing.ageCategory] ?? listing.ageCategory },
                { icon: Waves, label: "Stroke", value: STROKE_LABELS[listing.strokeSuitability] ?? listing.strokeSuitability },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#00B4FF]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">{label}</p>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h2 className="text-sm font-semibold text-[#1A1A2E] mb-2">Seller&apos;s notes</h2>
                <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            {!isSeller ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/checkout/${listing.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors shadow-lg shadow-[#00B4FF]/20 text-base"
                >
                  <ShoppingCart size={18} />
                  Buy Now
                </Link>
                <Link
                  href={`/messages/${listing.seller.id}?listing=${listing.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#00B4FF] text-[#00B4FF] font-semibold hover:bg-[#F0F7FF] transition-colors text-base"
                >
                  <MessageCircle size={18} />
                  Message Seller
                </Link>
              </div>
            ) : (
              <div className="bg-[#F0F7FF] rounded-xl p-4 text-sm text-[#64748B] text-center">
                This is your listing.{" "}
                <Link href="/account/listings" className="text-[#00B4FF] font-semibold hover:underline">
                  Manage listings →
                </Link>
              </div>
            )}

            {/* Trust signal */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] justify-center">
              <Shield size={13} className="text-[#22C55E]" />
              Protected by SuitCycle Buyer Protection · Secure Stripe checkout
            </div>
          </div>
        </div>

        {/* Seller card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-16 max-w-md">
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-4">
            About the seller
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F0F7FF] shrink-0">
              {sellerAvatar ? (
                <Image
                  src={sellerAvatar}
                  alt={listing.seller.name ?? "Seller"}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#00B4FF] font-bold text-xl">
                  {(listing.seller.name ?? "?")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1A1A2E] truncate">
                {listing.seller.name ?? "Swimmer"}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-[#EAB308]" fill="#EAB308" />
                  {sellerReviews.average !== null
                    ? `${sellerReviews.average.toFixed(1)} (${sellerReviews.count})`
                    : "New seller"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related listings */}
        {relatedCards.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#1A1A2E]">Similar listings</h2>
              <Link
                href={`/listings?brand=${encodeURIComponent(listing.brand)}`}
                className="text-sm text-[#00B4FF] hover:underline"
              >
                See all {listing.brand} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedCards.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const TIER_BORDER_COLORS: Record<string, string> = {
  gold: "#EAB308",
  podium: "#6366F1",
  prelim: "#22C55E",
  backup: "#F97316",
  practice: "#EF4444",
};
