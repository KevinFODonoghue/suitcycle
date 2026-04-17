import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import { orderStatusLabel, orderStatusBadgeClass } from "@/lib/orders";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, ShoppingBag, ChevronRight } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Admin, Orders" };

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { status: filterStatus, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 30;
  const skip = (page - 1) * take;

  const validStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "canceled", "refunded"];
  const where =
    filterStatus && (validStatuses as string[]).includes(filterStatus)
      ? { status: filterStatus as OrderStatus }
      : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        status: true,
        price: true,
        appFee: true,
        createdAt: true,
        listing: { select: { brand: true, model: true, size: true } },
        buyer: { select: { fullName: true, handle: true } },
        seller: { select: { fullName: true, handle: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));
  const statusOptions = ["", ...validStatuses];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Orders</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} total</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Status filter */}
        <form method="GET" className="flex gap-3">
          <select
            name="status"
            defaultValue={filterStatus ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors">
            Filter
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#64748B]">
              <ShoppingBag size={28} className="mx-auto mb-3 text-slate-300" />
              No orders found.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                      {order.listing.brand} {order.listing.model}, Size {order.listing.size}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      Buyer: @{order.buyer.handle} · Seller: @{order.seller.handle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusBadgeClass(order.status as any)}`}>
                    {orderStatusLabel(order.status as any)}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[#1A1A2E]">
                    {formatPrice(order.price)}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
