import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { UserActions } from "./UserActions";

export const metadata: Metadata = { title: "Admin, Users" };

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 25;
  const skip = (page - 1) * take;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { fullName: { contains: q, mode: "insensitive" as const } },
          { handle: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        email: true,
        fullName: true,
        handle: true,
        avatarUrl: true,
        image: true,
        status: true,
        role: true,
        createdAt: true,
        _count: { select: { listings: true, purchases: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Users</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} total</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Search */}
        <form method="GET">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by email, name, or handle…"
            className="w-full sm:max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          />
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#64748B]">
              <Users size={28} className="mx-auto mb-3 text-slate-300" />
              No users found.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {users.map((user) => {
                const avatar = user.avatarUrl ?? user.image ?? null;
                const name = user.fullName ?? user.email;
                return (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F0F7FF] shrink-0">
                      {avatar ? (
                        <Image src={avatar} alt={name} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#00B4FF] font-bold text-sm">
                          {name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#1A1A2E] truncate">{name}</p>
                        {user.role === "admin" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00B4FF]/10 text-[#00B4FF]">ADMIN</span>
                        )}
                        {user.status === "banned" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">BANNED</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] truncate">
                        @{user.handle} · {user.email}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {user._count.listings} listings · {user._count.purchases} orders ·{" "}
                        Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <UserActions userId={user.id} currentStatus={user.status as "active" | "banned"} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 transition-colors text-xs font-medium"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 transition-colors text-xs font-medium"
                >
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
