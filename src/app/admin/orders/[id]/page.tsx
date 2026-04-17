import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatPrice,
  PLATFORM_FEE_BPS,
  SELLER_PERK_PRIORITY_PERCENT,
  SELLER_PERK_AUTHENTICATION_PERCENT,
  SELLER_PERK_VERIFIED_SUITSCORE_PERCENT,
  BUYER_PERK_AUTHENTICATION_FEE,
  BUYER_PERK_VERIFIED_SUITSCORE_FEE,
} from "@/lib/price";
import { orderStatusLabel, orderStatusBadgeClass } from "@/lib/orders";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Shield, Package, Truck, CheckCircle2,
  XCircle, RotateCcw, Clock, ExternalLink,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin, Order Detail" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const TIER_STYLES: Record<string, { bg: string; textColor: string; emoji: string }> = {
  gold:     { bg: "#FEF9C3", textColor: "#854D0E", emoji: "🥇" },
  podium:   { bg: "#EEF2FF", textColor: "#3730A3", emoji: "🏅" },
  prelim:   { bg: "#DCFCE7", textColor: "#166534", emoji: "🎽" },
  backup:   { bg: "#FFF7ED", textColor: "#9A3412", emoji: "🔄" },
  practice: { bg: "#FEF2F2", textColor: "#991B1B", emoji: "💦" },
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending:   Clock,
  paid:      Package,
  shipped:   Truck,
  delivered: CheckCircle2,
  canceled:  XCircle,
  refunded:  RotateCcw,
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

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
          price: true,
          sellerPerkPriority: true,
          sellerPerkAuthentication: true,
          sellerPerkVerifiedSuitscore: true,
          sellerPerkPriorityVoucherCovered: true,
          sellerPerkAuthVoucherCovered: true,
          sellerPerkSuitscoreVoucherCovered: true,
        },
      },
      buyer: { select: { id: true, fullName: true, handle: true, email: true } },
      seller: { select: { id: true, fullName: true, handle: true, email: true } },
    },
  });

  if (!order) notFound();

  const tierStyle = TIER_STYLES[order.listing.condition] ?? TIER_STYLES.practice!;
  const photo = order.listing.photos[0] ?? null;

  // ── Revenue breakdown ──────────────────────────────────────────────────────
  const basePrice = order.listing.price;
  const platformFee = order.appFee;

  // Seller perk fees (computed from listing flags + sellerPerksFeePercent stored on order)
  const sellerPerkPriorityFee =
    order.listing.sellerPerkPriority && !order.listing.sellerPerkPriorityVoucherCovered
      ? Math.round((basePrice * 300) / 10000)
      : 0;
  const sellerPerkAuthFee =
    order.listing.sellerPerkAuthentication && !order.listing.sellerPerkAuthVoucherCovered
      ? Math.round((basePrice * 500) / 10000)
      : 0;
  const sellerPerkSuitscoreFee =
    order.listing.sellerPerkVerifiedSuitscore && !order.listing.sellerPerkSuitscoreVoucherCovered
      ? Math.round((basePrice * 500) / 10000)
      : 0;
  const totalSellerPerkFee = sellerPerkPriorityFee + sellerPerkAuthFee + sellerPerkSuitscoreFee;

  // Buyer perk fees (stored on order)
  const buyerAuthFee = order.buyerPerkAuthentication ? BUYER_PERK_AUTHENTICATION_FEE : 0;
  const buyerSuitscoreFee = order.buyerPerkVerifiedSuitscore ? BUYER_PERK_VERIFIED_SUITSCORE_FEE : 0;
  // Note: buyerPerksFee on the order is the amount actually charged (0 if voucher covered).
  const buyerPerksFee = order.buyerPerksFee;

  const sellerPayout = Math.max(0, basePrice - platformFee - totalSellerPerkFee);
  const suitCycleRevenue = platformFee + totalSellerPerkFee + buyerPerksFee;

  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Order Detail</h1>
              <p className="text-xs text-slate-400 font-mono">#{order.id.slice(-12).toUpperCase()}</p>
            </div>
          </div>
          <Link href="/admin/orders" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Orders
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: order info */}
          <div className="lg:col-span-3 space-y-5">

            {/* Status + listing */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl ${orderStatusBadgeClass(order.status)}`}>
                  <StatusIcon size={14} />
                  {orderStatusLabel(order.status)}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {photo ? (
                    <Image src={photo} alt="Listing" width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E] leading-tight">
                    {order.listing.brand} {order.listing.model}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
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

            {/* Parties */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">Parties</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Buyer</p>
                  <p className="font-semibold text-[#1A1A2E]">{order.buyer.fullName ?? "—"}</p>
                  <p className="text-xs text-slate-400">@{order.buyer.handle}</p>
                  <p className="text-xs text-slate-400">{order.buyer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Seller</p>
                  <p className="font-semibold text-[#1A1A2E]">{order.seller.fullName ?? "—"}</p>
                  <p className="text-xs text-slate-400">@{order.seller.handle}</p>
                  <p className="text-xs text-slate-400">{order.seller.email}</p>
                </div>
              </div>
            </div>

            {/* Seller perks on listing */}
            {(order.listing.sellerPerkPriority || order.listing.sellerPerkAuthentication || order.listing.sellerPerkVerifiedSuitscore) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">Seller perks (opted in)</p>
                <div className="space-y-1.5 text-sm">
                  {order.listing.sellerPerkPriority && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A2E]">Priority Listing</span>
                      <span className="text-xs text-slate-500">
                        {order.listing.sellerPerkPriorityVoucherCovered
                          ? "Voucher covered"
                          : `${SELLER_PERK_PRIORITY_PERCENT}% — ${formatPrice(sellerPerkPriorityFee)}`}
                      </span>
                    </div>
                  )}
                  {order.listing.sellerPerkAuthentication && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A2E]">Brand Authentication</span>
                      <span className="text-xs text-slate-500">
                        {order.listing.sellerPerkAuthVoucherCovered
                          ? "Voucher covered"
                          : `${SELLER_PERK_AUTHENTICATION_PERCENT}% — ${formatPrice(sellerPerkAuthFee)}`}
                      </span>
                    </div>
                  )}
                  {order.listing.sellerPerkVerifiedSuitscore && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A2E]">Verified SuitScore™</span>
                      <span className="text-xs text-slate-500">
                        {order.listing.sellerPerkSuitscoreVoucherCovered
                          ? "Voucher covered"
                          : `${SELLER_PERK_VERIFIED_SUITSCORE_PERCENT}% — ${formatPrice(sellerPerkSuitscoreFee)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buyer perks */}
            {(order.buyerPerkAuthentication || order.buyerPerkVerifiedSuitscore) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">Buyer add-ons</p>
                <div className="space-y-1.5 text-sm">
                  {order.buyerPerkAuthentication && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A2E]">Brand Authentication</span>
                      <span className="text-xs text-slate-500">
                        {buyerAuthFee > 0 ? formatPrice(BUYER_PERK_AUTHENTICATION_FEE) : "Free (voucher)"}
                      </span>
                    </div>
                  )}
                  {order.buyerPerkVerifiedSuitscore && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A2E]">Verified SuitScore™</span>
                      <span className="text-xs text-slate-500">
                        {buyerSuitscoreFee > 0 ? formatPrice(BUYER_PERK_VERIFIED_SUITSCORE_FEE) : "Free (voucher)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: revenue breakdown */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-4">Revenue breakdown</p>
              <div className="space-y-2 text-sm">
                {/* Base price */}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Base price</span>
                  <span className="font-medium text-[#1A1A2E]">{formatPrice(basePrice)}</span>
                </div>

                {/* Shipping */}
                {order.shippingFee > 0 && (
                  <div className="flex justify-between text-[#64748B]">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                  </div>
                )}

                {/* Buyer perks */}
                {buyerPerksFee > 0 && (
                  <div className="flex justify-between text-[#64748B]">
                    <span>Buyer add-ons</span>
                    <span>+{formatPrice(buyerPerksFee)}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold text-[#1A1A2E]">
                  <span>Buyer paid</span>
                  <span>{formatPrice(order.price)}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">SuitCycle revenue</p>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Platform fee ({PLATFORM_FEE_BPS / 100}%)</span>
                    <span>{formatPrice(platformFee)}</span>
                  </div>
                  {totalSellerPerkFee > 0 && (
                    <div className="flex justify-between text-[#64748B]">
                      <span>Seller perk fees</span>
                      <span>{formatPrice(totalSellerPerkFee)}</span>
                    </div>
                  )}
                  {buyerPerksFee > 0 && (
                    <div className="flex justify-between text-[#64748B]">
                      <span>Buyer perk fees</span>
                      <span>{formatPrice(buyerPerksFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#00B4FF]">
                    <span>Total SuitCycle revenue</span>
                    <span>{formatPrice(suitCycleRevenue)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-[#1A1A2E]">
                  <span>Seller payout</span>
                  <span>{formatPrice(sellerPayout)}</span>
                </div>
              </div>
            </div>

            {/* Order meta */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 text-xs space-y-1.5 text-slate-500">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-mono text-[#1A1A2E]">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="capitalize">{order.shippingMode}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span>Paid at</span>
                  <span>{new Date(order.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {order.trackingUrl && (
                <div className="flex justify-between">
                  <span>Tracking</span>
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#00B4FF] hover:underline flex items-center gap-0.5">
                    View <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
