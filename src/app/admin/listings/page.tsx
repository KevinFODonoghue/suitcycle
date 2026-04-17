import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Tag, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Admin, Listings" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  draft:    "bg-amber-100 text-amber-700",
  sold:     "bg-blue-100 text-blue-700",
  archived: "bg-slate-100 text-slate-500",
};

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { q, status: filterStatus, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 25;
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = {};
  if (filterStatus && ["active", "draft", "sold", "archived"].includes(filterStatus)) {
    where.status = filterStatus;
  }
  if (q) {
    where.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        brand: true,
        model: true,
        size: true,
        price: true,
        status: true,
        condition: true,
        photos: true,
        createdAt: true,
        seller: { select: { fullName: true, handle: true } },
        _count: { select: { favorites: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  const statusOptions = ["", "active", "draft", "sold", "archived"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Listings</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} total</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search brand or model…"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] w-full sm:w-auto sm:flex-1 sm:max-w-xs"
          />
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
          {listings.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#64748B]">
              <Tag size={28} className="mx-auto mb-3 text-slate-300" />
              No listings found.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {listings.map((listing) => {
                const photo = listing.photos[0] ?? null;
                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {photo ? (
                        <Image src={photo} alt={`${listing.brand} ${listing.model}`} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                        {listing.brand} {listing.model}, Size {listing.size}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {formatPrice(listing.price)} · @{listing.seller.handle} · ♥ {listing._count.favorites}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[listing.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(filterStatus ? { status: filterStatus } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(filterStatus ? { status: filterStatus } : {}), page: String(page + 1) })}`}
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
