import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/price";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AccountProfileForm } from "./AccountProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AddressManager } from "./AddressManager";
import { SignOutButton } from "./SignOutButton";
import { RedeemCodeForm } from "./RedeemCodeForm";
import { orderStatusLabel, orderStatusBadgeClass } from "@/lib/orders";
import {
  Tag, ShoppingBag, User as UserIcon, Settings,
  ChevronRight, Plus, Star, MessageCircle, Package, Heart, MapPin, Lock, Ticket,
} from "lucide-react";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/account");

  const userId = session.user.id as string;

  const [user, listings, purchaseCount, recentPurchases, favorites, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        image: true,
        stripeAccountId: true,
        createdAt: true,
        _count: { select: { sellerReviews: true } },
      },
    }),
    prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        price: true,
        status: true,
        photos: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where: { buyerId: userId } }),
    prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        status: true,
        price: true,
        createdAt: true,
        listing: { select: { brand: true, model: true, size: true, photos: true } },
        seller: { select: { fullName: true } },
      },
    }),
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        listing: {
          select: {
            id: true, brand: true, model: true, size: true,
            price: true, photos: true, status: true, condition: true,
          },
        },
      },
    }),
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, type: true, recipientName: true, phone: true,
        line1: true, line2: true, city: true, state: true,
        postalCode: true, country: true, isDefault: true,
      },
    }),
  ]);

  if (!user) redirect("/login");

  const avatar = user.avatarUrl ?? user.image ?? null;
  const displayName = user.fullName ?? user.email;
  const memberSince = new Date(user.createdAt).getFullYear();
  const activeListings = listings.filter((l) => l.status === "active").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F0F7FF] shrink-0">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName ?? ""}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    placeholder="empty"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#00B4FF] font-bold text-2xl">
                    {(displayName ?? "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A2E]">{displayName}</h1>
                <p className="text-sm text-[#64748B]">
                  @{user.handle} · Member since {memberSince}
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active listings", value: activeListings, icon: Tag },
            { label: "Total purchases", value: purchaseCount, icon: ShoppingBag },
            { label: "Reviews received", value: user._count.sellerReviews, icon: Star },
            { label: "Total listings", value: listings.length, icon: Tag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-[#00B4FF]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/sell"
            className="flex items-center gap-3 bg-[#00B4FF] text-white rounded-2xl px-5 py-4 hover:bg-[#0066AA] transition-colors sm:col-span-2"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Plus size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm">List a suit</p>
              <p className="text-xs text-white/70">Sell in minutes</p>
            </div>
            <ChevronRight size={16} className="ml-auto opacity-70" />
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
              <Package size={18} className="text-[#00B4FF]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">My orders</p>
              <p className="text-xs text-[#64748B]">Purchases & sales</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300" />
          </Link>
          <Link
            href="/messages"
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-[#00B4FF]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">Messages</p>
              <p className="text-xs text-[#64748B]">Inbox</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300" />
          </Link>
          <Link
            href="/listings"
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
              <ShoppingBag size={18} className="text-[#00B4FF]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">Browse suits</p>
              <p className="text-xs text-[#64748B]">Find your next race suit</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300" />
          </Link>
          <Link
            href="/suitscore"
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
              <Star size={18} className="text-[#00B4FF]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">SuitScore™ guide</p>
              <p className="text-xs text-[#64748B]">Grading explained</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300" />
          </Link>
        </div>

        {/* Recent listings */}
        {listings.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h2 className="font-bold text-[#1A1A2E]">Your listings</h2>
              <Link href="/sell" className="text-sm text-[#00B4FF] hover:underline flex items-center gap-1">
                <Plus size={14} />
                New listing
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {listing.photos[0] ? (
                      <Image
                        src={listing.photos[0]}
                        alt={listing.title}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                      {listing.brand} {listing.model}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {formatPrice(listing.price)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      listing.status === "active"
                        ? "bg-green-100 text-green-700"
                        : listing.status === "sold"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-4">
              <Tag size={22} className="text-[#00B4FF]" />
            </div>
            <p className="font-semibold text-[#1A1A2E] mb-1">No listings yet</p>
            <p className="text-sm text-[#64748B] mb-5">List your first tech suit, it only takes a few minutes.</p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors"
            >
              <Plus size={15} />
              List a suit
            </Link>
          </div>
        )}

        {/* Recent purchases */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#64748B]" />
              <h2 className="font-bold text-[#1A1A2E]">Recent purchases</h2>
            </div>
            <Link href="/orders" className="text-sm text-[#00B4FF] hover:underline">
              View all
            </Link>
          </div>
          {recentPurchases.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#64748B]">No purchases yet.</p>
              <Link href="/listings" className="mt-3 inline-block text-sm font-semibold text-[#00B4FF] hover:underline">
                Browse suits →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPurchases.map((order) => {
                const photo = order.listing.photos[0] ?? null;
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${order.listing.brand} ${order.listing.model}`}
                          width={48}
                          height={48}
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
                        Size {order.listing.size} · {formatPrice(order.price)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusBadgeClass(order.status as any)}`}>
                      {orderStatusLabel(order.status as any)}
                    </span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-[#64748B]" />
              <h2 className="font-bold text-[#1A1A2E]">Saved suits</h2>
            </div>
            {favorites.length > 0 && (
              <Link href="/listings" className="text-sm text-[#00B4FF] hover:underline">Browse more</Link>
            )}
          </div>
          {favorites.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#64748B]">No saved suits yet. Tap the heart on any listing to save it.</p>
              <Link href="/listings" className="mt-3 inline-block text-sm font-semibold text-[#00B4FF] hover:underline">
                Browse listings →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
              {favorites.map(({ listing }) => {
                const photo = listing.photos[0] ?? null;
                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group block rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${listing.brand} ${listing.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                      {listing.status !== "active" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold uppercase tracking-wide">Sold</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-[#1A1A2E] truncate">{listing.brand} {listing.model}</p>
                      <p className="text-xs text-[#64748B]">Size {listing.size} · {formatPrice(listing.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Redeem code */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <Ticket size={16} className="text-[#64748B]" />
            <h2 className="font-bold text-[#1A1A2E]">Redeem a code</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-[#64748B] mb-4">
              Have a voucher code? Check what it grants and where to use it.
            </p>
            <RedeemCodeForm />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <Settings size={16} className="text-[#64748B]" />
            <h2 className="font-bold text-[#1A1A2E]">Settings</h2>
          </div>

          {/* Profile */}
          <div className="px-6 py-5 border-b border-slate-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-4">Profile</p>
            <AccountProfileForm
              initialData={{
                fullName: user.fullName ?? "",
                handle: user.handle,
                bio: user.bio ?? "",
              }}
            />
          </div>

          {/* Addresses */}
          <div className="px-6 py-5 border-b border-slate-50">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-[#64748B]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Addresses</p>
            </div>
            <AddressManager initialAddresses={addresses as any} />
          </div>

          {/* Change password */}
          <div className="px-6 py-5 border-b border-slate-50">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-[#64748B]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Password</p>
            </div>
            <ChangePasswordForm />
          </div>

          {/* Stripe payouts */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center shrink-0">
                  <UserIcon size={16} className="text-[#00B4FF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Seller payouts</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {user.stripeAccountId
                      ? "Stripe connected, you can receive payments"
                      : "Connect Stripe to receive payments when your suits sell"}
                  </p>
                </div>
              </div>
              {!user.stripeAccountId ? (
                <Link
                  href="/api/stripe/account-link"
                  className="shrink-0 px-4 py-2 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
                >
                  Connect
                </Link>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-xs font-semibold">
                  Connected
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
