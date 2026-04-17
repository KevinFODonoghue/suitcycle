import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import { orderStatusLabel, orderStatusBadgeClass } from "@/lib/orders";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ShoppingBag, Tag, ChevronRight, PackageSearch } from "lucide-react";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/orders");
  const userId = session.user.id as string;

  const [purchases, sales] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, status: true, price: true, createdAt: true,
        listing: { select: { brand: true, model: true, size: true, photos: true } },
        seller: { select: { fullName: true } },
      },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, status: true, price: true, appFee: true, createdAt: true,
        listing: { select: { brand: true, model: true, size: true, photos: true } },
        buyer: { select: { fullName: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">My Orders</h1>
          <p className="text-sm text-[#64748B] mt-1">Your buying and selling history</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Purchases */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={16} className="text-[#00B4FF]" />
            <h2 className="font-bold text-[#1A1A2E]">Purchases</h2>
            <span className="text-xs text-slate-400 ml-1">({purchases.length})</span>
          </div>
          {purchases.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              message="No purchases yet"
              cta={{ label: "Browse tech suits", href: "/listings" }}
            />
          ) : (
            <OrderList
              orders={purchases.map((o) => ({
                id: o.id,
                status: o.status,
                price: o.price,
                createdAt: o.createdAt,
                listing: o.listing,
                counterpartyLabel: "Seller",
                counterpartyName: o.seller.fullName,
                showPayout: false,
                appFee: 0,
              }))}
            />
          )}
        </section>

        {/* Sales */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-[#00B4FF]" />
            <h2 className="font-bold text-[#1A1A2E]">Sales</h2>
            <span className="text-xs text-slate-400 ml-1">({sales.length})</span>
          </div>
          {sales.length === 0 ? (
            <EmptyState
              icon={Tag}
              message="No sales yet"
              cta={{ label: "List a suit", href: "/sell" }}
            />
          ) : (
            <OrderList
              orders={sales.map((o) => ({
                id: o.id,
                status: o.status,
                price: o.price,
                createdAt: o.createdAt,
                listing: o.listing,
                counterpartyLabel: "Buyer",
                counterpartyName: o.buyer.fullName,
                showPayout: true,
                appFee: o.appFee,
              }))}
            />
          )}
        </section>

      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  status: string;
  price: number;
  appFee: number;
  createdAt: Date;
  listing: { brand: string; model: string; size: string; photos: string[] };
  counterpartyLabel: string;
  counterpartyName: string | null;
  showPayout: boolean;
}

function OrderList({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
      {orders.map((order) => {
        const photo = order.listing.photos[0] ?? null;
        const payout = Math.max(order.price - order.appFee, 0);

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${order.listing.brand} ${order.listing.model}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-slate-100" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                {order.listing.brand} {order.listing.model}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">
                Size {order.listing.size} · {order.counterpartyLabel}: {order.counterpartyName ?? ","}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-[#1A1A2E]">
                {order.showPayout ? formatPrice(payout) : formatPrice(order.price)}
              </p>
              {order.showPayout && (
                <p className="text-[10px] text-slate-400">after fees</p>
              )}
            </div>

            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusBadgeClass(order.status as any)}`}>
              {orderStatusLabel(order.status as any)}
            </span>

            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  cta,
}: {
  icon: React.ElementType;
  message: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} className="text-[#00B4FF]" />
      </div>
      <p className="font-semibold text-[#1A1A2E] mb-1">{message}</p>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}
