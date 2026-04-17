"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import {
  appendStatusEvent,
  ensureOrderEvents,
  serializeOrderEvents,
} from "@/lib/orders";

export async function saveTracking(orderId: string, trackingUrl: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { error: "Unauthorized" };

  const url = trackingUrl.trim();
  if (!url) return { error: "Tracking URL is required." };

  try { new URL(url); } catch {
    return { error: "Enter a valid URL (must start with https://)." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.sellerId !== userId) return { error: "Not authorized." };
  if (order.status !== OrderStatus.paid) return { error: "Order must be in 'paid' status to add tracking." };

  const now = new Date();
  const events = appendStatusEvent(
    ensureOrderEvents(order.events),
    OrderStatus.shipped,
    "Seller added tracking, suit is on its way",
    now,
    { source: "seller-tracking", trackingUrl: url },
  );

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingUrl: url,
      status: OrderStatus.shipped,
      shippedAt: now,
      events: serializeOrderEvents(events),
    },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function confirmDelivery(orderId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== userId) return { error: "Not authorized." };
  if (order.status !== OrderStatus.shipped) return { error: "Order must be in 'shipped' status." };

  const now = new Date();
  const events = appendStatusEvent(
    ensureOrderEvents(order.events),
    OrderStatus.delivered,
    "Buyer confirmed delivery",
    now,
    { source: "buyer-confirm" },
  );

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.delivered,
      deliveredAt: now,
      events: serializeOrderEvents(events),
    },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}
