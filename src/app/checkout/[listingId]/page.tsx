import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import { getManualShippingFlatFeeCents } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Shield, ArrowLeft } from "lucide-react";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

interface PageProps {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ voucher?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { listingId } = await params;
  const { voucher } = await searchParams;
  const initialVoucherCode = typeof voucher === "string" && voucher.trim() ? voucher.trim().toUpperCase() : undefined;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/login?next=/checkout/${listingId}`);

  const userId = session.user.id as string;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      brand: true,
      model: true,
      size: true,
      condition: true,
      photos: true,
      price: true,
      status: true,
      sellerId: true,
      isAuthenticated: true,
      suitScoreVerified: true,
      seller: {
        select: { id: true, stripeAccountId: true, fullName: true },
      },
    },
  });

  if (!listing || listing.status !== "active") notFound();
  if (listing.sellerId === userId) redirect(`/listings/${listingId}`);

  const shippingFee = getManualShippingFlatFeeCents();
  const photo = listing.photos[0] ?? null;

  const TIER_STYLES: Record<string, { bg: string; textColor: string; emoji: string }> = {
    gold:     { bg: "#FEF9C3", textColor: "#854D0E", emoji: "🥇" },
    podium:   { bg: "#EEF2FF", textColor: "#3730A3", emoji: "🏅" },
    prelim:   { bg: "#DCFCE7", textColor: "#166534", emoji: "🎽" },
    backup:   { bg: "#FFF7ED", textColor: "#9A3412", emoji: "🔄" },
    practice: { bg: "#FEF2F2", textColor: "#991B1B", emoji: "💦" },
  };
  const tierStyle = TIER_STYLES[listing.condition] ?? TIER_STYLES.practice!;

  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link
            href={`/listings/${listingId}`}
            className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A1A2E] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to listing
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: order summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Listing card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">
                Order summary
              </p>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`${listing.brand} ${listing.model}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#00B4FF] uppercase tracking-wide">
                    {listing.brand}
                  </p>
                  <p className="text-sm font-bold text-[#1A1A2E] leading-tight mt-0.5">
                    {listing.model}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">Size {listing.size}</p>
                  <span
                    className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tierStyle.bg, color: tierStyle.textColor }}
                  >
                    {tierStyle.emoji} {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">
                Price breakdown
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Listing price</span>
                  <span className="font-medium text-[#1A1A2E]">{formatPrice(listing.price)}</span>
                </div>
                {shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Shipping</span>
                    <span className="font-medium text-[#1A1A2E]">{formatPrice(shippingFee)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
                  <span className="text-[#1A1A2E]">Subtotal</span>
                  <span className="text-[#1A1A2E] text-base">{formatPrice(listing.price + shippingFee)}</span>
                </div>
              </div>
            </div>

            {/* Trust signal */}
            <div className="bg-[#F0F9FF] rounded-2xl border border-[#00B4FF]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={15} className="text-[#22C55E] shrink-0" />
                <p className="text-xs font-bold text-[#1A1A2E]">SuitCycle Buyer Protection</p>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                If the item doesn&apos;t arrive or doesn&apos;t match the listing, you&apos;re covered.
                Payments are held securely and released to the seller after delivery confirmation.
              </p>
            </div>
          </div>

          {/* Right: payment form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-sm font-bold text-[#1A1A2E] mb-5">Payment details</p>
              <CheckoutForm
                listingId={listing.id}
                listingPrice={listing.price}
                shippingFee={shippingFee}
                listingIsAuthenticated={listing.isAuthenticated}
                listingSuitScoreVerified={listing.suitScoreVerified}
                stripePublishableKey={stripePublishableKey}
                initialVoucherCode={initialVoucherCode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
