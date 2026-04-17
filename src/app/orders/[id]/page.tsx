import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import { orderStatusLabel, orderStatusBadgeClass, ensureOrderEvents, parseOrderSnapshot } from "@/lib/orders";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowLeft, Package, Truck, CheckCircle2, XCircle,
  RotateCcw, Clock, Shield, ExternalLink, AlertCircle,
} from "lucide-react";
import { TrackingForm } from "./TrackingForm";
import { DeliverButton } from "./DeliverButton";

export const metadata: Metadata = { title: "Order Details" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending:   Clock,
  paid:      Package,
  shipped:   Truck,
  delivered: CheckCircle2,
  canceled:  XCircle,
  refunded:  RotateCcw,
};

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const justPaid = resolvedSearch.success === "1";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/login?next=/orders/${id}`);

  const userId = session.user.id as string;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          id: true,
          brand: true,
          model: true,
          size: true,
          condition: true,
          photos: true,
          status: true,
        },
      },
      buyer: { select: { id: true, fullName: true, email: true } },
      seller: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!order) notFound();

  const isBuyer = order.buyerId === userId;
  const isSeller = order.sellerId === userId;
  if (!isBuyer && !isSeller) notFound();

  const events = ensureOrderEvents(order.events);
  const snapshot = parseOrderSnapshot(order.snapshot);

  const photo = order.listing.photos[0] ?? null;
  const counterpartyName = isBuyer
    ? (order.seller.fullName ?? "Seller")
    : (order.buyer.fullName ?? "Buyer");

  const canAddTracking = isSeller && order.status === "paid";
  const canConfirmDelivery = isBuyer && order.status === "shipped";

  const TIER_STYLES: Record<string, { bg: string; textColor: string; emoji: string }> = {
    gold:     { bg: "#FEF9C3", textColor: "#854D0E", emoji: "🥇" },
    podium:   { bg: "#EEF2FF", textColor: "#3730A3", emoji: "🏅" },
    prelim:   { bg: "#DCFCE7", textColor: "#166534", emoji: "🎽" },
    backup:   { bg: "#FFF7ED", textColor: "#9A3412", emoji: "🔄" },
    practice: { bg: "#FEF2F2", textColor: "#991B1B", emoji: "💦" },
  };
  const tierStyle = TIER_STYLES[order.listing.condition] ?? TIER_STYLES.practice!;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A1A2E] transition-colors"
          >
            <ArrowLeft size={15} />
            My account
          </Link>
          <span className="text-xs text-slate-400 font-mono hidden sm:block">#{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Success banner */}
        {justPaid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Payment received!</p>
              <p className="text-green-700 text-xs mt-0.5">
                Your order is confirmed. The seller will ship your suit soon.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Order status card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Order status</p>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl ${orderStatusBadgeClass(order.status)}`}>
                    {(() => { const Icon = STATUS_ICONS[order.status] ?? Clock; return <Icon size={14} />; })()}
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>

              {/* Listing summary */}
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`${order.listing.brand} ${order.listing.model}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#00B4FF] uppercase tracking-wide">
                    {order.listing.brand}
                  </p>
                  <p className="text-sm font-bold text-[#1A1A2E] leading-tight">
                    {order.listing.model}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                      Size {order.listing.size}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tierStyle.bg, color: tierStyle.textColor }}
                    >
                      {tierStyle.emoji} {order.listing.condition.charAt(0).toUpperCase() + order.listing.condition.slice(1)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/listings/${order.listing.id}`}
                  className="shrink-0 text-xs text-[#00B4FF] hover:underline flex items-center gap-1"
                >
                  View <ExternalLink size={11} />
                </Link>
              </div>
            </div>

            {/* Tracking info */}
            {order.trackingUrl && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={16} className="text-[#00B4FF]" />
                  <p className="font-semibold text-[#1A1A2E] text-sm">Tracking</p>
                </div>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#00B4FF] hover:underline"
                >
                  Track shipment
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Seller: add tracking */}
            {canAddTracking && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={16} className="text-[#00B4FF]" />
                  <p className="font-semibold text-[#1A1A2E] text-sm">Add tracking</p>
                </div>
                <p className="text-xs text-[#64748B] mb-4">
                  Once you ship the suit, enter the tracking URL so the buyer can follow the package.
                </p>
                <TrackingForm orderId={order.id} />
              </div>
            )}

            {/* Buyer: confirm delivery */}
            {canConfirmDelivery && (
              <div className="bg-[#F0FDF4] rounded-2xl border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="font-semibold text-[#1A1A2E] text-sm">Did your suit arrive?</p>
                </div>
                <p className="text-xs text-[#64748B] mb-4">
                  Confirm delivery to release payment to the seller and leave a review.
                </p>
                <DeliverButton orderId={order.id} />
              </div>
            )}

            {/* Event timeline */}
            {events.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-4">
                  Order timeline
                </p>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-100" />
                  <div className="space-y-5">
                    {[...events].reverse().map((event, i) => {
                      const Icon = STATUS_ICONS[event.status] ?? Clock;
                      return (
                        <div key={i} className="relative flex gap-3">
                          <div className="absolute -left-5 w-3 h-3 rounded-full bg-white border-2 border-[#00B4FF] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Icon size={13} className="text-[#00B4FF] shrink-0" />
                              <p className="text-sm font-semibold text-[#1A1A2E]">{event.message}</p>
                            </div>
                            <p className="text-xs text-slate-400">
                              {new Date(event.at).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "numeric", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">
                Pricing
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Listing price</span>
                  <span className="font-medium">{formatPrice(snapshot?.pricing.buyerTotal ?? order.price)}</span>
                </div>
                {(snapshot?.pricing.shippingFee ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Shipping</span>
                    <span className="font-medium">{formatPrice(snapshot!.pricing.shippingFee)}</span>
                  </div>
                )}
                {isSeller && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Platform fee (10%)</span>
                    <span>-{formatPrice(order.appFee)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
                  <span>{isSeller ? "You receive" : "Total paid"}</span>
                  <span className="text-[#1A1A2E]">
                    {isSeller
                      ? formatPrice(Math.max(order.price - order.appFee, 0))
                      : formatPrice(order.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Counterparty */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                {isBuyer ? "Seller" : "Buyer"}
              </p>
              <p className="text-sm font-semibold text-[#1A1A2E]">{counterpartyName}</p>
            </div>

            {/* Buyer protection */}
            {isBuyer && (
              <div className="bg-[#F0F9FF] rounded-2xl border border-[#00B4FF]/20 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield size={14} className="text-[#22C55E]" />
                  <p className="text-xs font-bold text-[#1A1A2E]">Buyer Protection</p>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                  If the suit doesn&apos;t arrive or isn&apos;t as described, you can open a dispute within 48 hours of confirming delivery.
                </p>
                {["paid", "shipped", "delivered"].includes(order.status) && (
                  <Link
                    href={`/help?reason=dispute&orderId=${order.id}#contact`}
                    className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl bg-white border border-[#00B4FF]/30 text-xs font-semibold text-[#00B4FF] hover:bg-[#E0F4FF] transition-colors"
                  >
                    <AlertCircle size={13} />
                    Report an Issue
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
