import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Users, Tag, ShoppingBag, Flag, Shield,
  TrendingUp, AlertTriangle, Activity, Download, Ticket,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin, SuitCycle" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const [userCount, listingCount, orderCount, openFlagCount, openDisputeCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: "active" } }),
      prisma.order.count(),
      prisma.flag.count({ where: { status: "open" } }),
      prisma.dispute.count({ where: { status: "open" } }),
    ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      status: true,
      price: true,
      createdAt: true,
      listing: { select: { brand: true, model: true } },
      buyer: { select: { fullName: true } },
    },
  });

  const stats = [
    { label: "Total users",     value: userCount,       icon: Users,      color: "#00B4FF" },
    { label: "Active listings", value: listingCount,    icon: Tag,        color: "#22C55E" },
    { label: "Total orders",    value: orderCount,      icon: ShoppingBag,color: "#6366F1" },
    { label: "Open flags",      value: openFlagCount,   icon: Flag,       color: "#F97316", alert: openFlagCount > 0 },
    { label: "Open disputes",   value: openDisputeCount,icon: AlertTriangle, color: "#EF4444", alert: openDisputeCount > 0 },
  ];

  const STATUS_BADGE: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-800",
    paid:      "bg-emerald-100 text-emerald-800",
    shipped:   "bg-sky-100 text-sky-800",
    delivered: "bg-indigo-100 text-indigo-800",
    canceled:  "bg-red-100 text-red-800",
    refunded:  "bg-purple-100 text-purple-800",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={16} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Console</h1>
              <p className="text-xs text-slate-400">SuitCycle internal dashboard</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map(({ label, value, icon: Icon, color, alert }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border p-4 ${alert ? "border-red-200 bg-red-50" : "border-slate-100"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={15} style={{ color }} />
                </div>
                {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E]">{value.toLocaleString()}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Users",    href: "/admin/users",    icon: Users },
            { label: "Listings", href: "/admin/listings", icon: Tag },
            { label: "Orders",   href: "/admin/orders",   icon: ShoppingBag },
            { label: "Flags",    href: "/admin/flags",    icon: Flag },
            { label: "Vouchers", href: "/admin/vouchers", icon: Ticket },
            { label: "Audit log", href: "/admin/audit",   icon: Activity },
            { label: "Export CSV", href: "/admin/export?type=orders", icon: Download },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:border-slate-200 hover:shadow-sm transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#00B4FF]" />
              </div>
              <span className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#00B4FF] transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <TrendingUp size={16} className="text-[#64748B]" />
            <h2 className="font-bold text-[#1A1A2E]">Recent orders</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.length === 0 && (
              <p className="text-sm text-[#64748B] text-center py-8">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                    {order.listing.brand} {order.listing.model}
                  </p>
                  <p className="text-xs text-[#64748B] truncate mt-0.5">
                    {order.buyer.fullName ?? "Unknown buyer"}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="shrink-0 text-sm font-bold text-[#1A1A2E]">
                  ${(order.price / 100).toFixed(0)}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
