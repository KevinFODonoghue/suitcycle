import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

type ExportType = "orders" | "users" | "listings";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const type = (searchParams.get("type") ?? "orders") as ExportType;

  let csv = "";
  let filename = "";

  if (type === "orders") {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        price: true,
        appFee: true,
        currency: true,
        paymentIntentId: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
        listing: { select: { brand: true, model: true, size: true } },
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
      },
    });

    csv = toCsv(
      ["id", "status", "price_cents", "app_fee_cents", "currency", "payment_intent_id", "brand", "model", "size", "buyer_email", "seller_email", "shipped_at", "delivered_at", "created_at"],
      orders.map((o) => [
        o.id,
        o.status,
        o.price,
        o.appFee,
        o.currency,
        o.paymentIntentId,
        o.listing.brand,
        o.listing.model,
        o.listing.size,
        o.buyer.email,
        o.seller.email,
        o.shippedAt?.toISOString() ?? "",
        o.deliveredAt?.toISOString() ?? "",
        o.createdAt.toISOString(),
      ]),
    );
    filename = `suitcycle-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "users") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        handle: true,
        status: true,
        role: true,
        stripeAccountId: true,
        createdAt: true,
        _count: { select: { listings: true, purchases: true } },
      },
    });

    csv = toCsv(
      ["id", "email", "full_name", "handle", "status", "role", "stripe_account_id", "listing_count", "order_count", "created_at"],
      users.map((u) => [
        u.id,
        u.email,
        u.fullName ?? "",
        u.handle,
        u.status,
        u.role,
        u.stripeAccountId ?? "",
        u._count.listings,
        u._count.purchases,
        u.createdAt.toISOString(),
      ]),
    );
    filename = `suitcycle-users-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "listings") {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        size: true,
        genderFit: true,
        suitType: true,
        condition: true,
        suitScore: true,
        price: true,
        status: true,
        isPriority: true,
        isAuthenticated: true,
        createdAt: true,
        seller: { select: { email: true } },
      },
    });

    csv = toCsv(
      ["id", "brand", "model", "size", "gender_fit", "suit_type", "condition", "suit_score", "price_cents", "status", "is_priority", "is_authenticated", "seller_email", "created_at"],
      listings.map((l) => [
        l.id,
        l.brand,
        l.model,
        l.size,
        l.genderFit,
        l.suitType,
        l.condition,
        l.suitScore,
        l.price,
        l.status,
        l.isPriority ? "true" : "false",
        l.isAuthenticated ? "true" : "false",
        l.seller.email,
        l.createdAt.toISOString(),
      ]),
    );
    filename = `suitcycle-listings-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return new NextResponse("Invalid export type. Use ?type=orders|users|listings", { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
