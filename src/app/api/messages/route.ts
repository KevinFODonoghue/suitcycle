import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromUserId = session.user.id as string;
    const body = await req.json();
    const toUserId: string = body.toUserId?.trim();
    const messageBody: string = body.body?.trim();
    const orderId: string | undefined = body.orderId?.trim() || undefined;

    if (!toUserId || !messageBody) {
      return NextResponse.json({ error: "toUserId and body are required." }, { status: 400 });
    }

    if (messageBody.length > 2000) {
      return NextResponse.json({ error: "Message cannot exceed 2000 characters." }, { status: 400 });
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot message yourself." }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, status: true },
    });
    if (!recipient || recipient.status === "banned") {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    // If orderId provided, verify it belongs to the conversation participants
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { buyerId: true, sellerId: true },
      });
      if (!order || (order.buyerId !== fromUserId && order.sellerId !== fromUserId)) {
        return NextResponse.json({ error: "Invalid order reference." }, { status: 403 });
      }
    }

    const message = await prisma.message.create({
      data: { fromUserId, toUserId, body: messageBody, orderId: orderId ?? null },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ id: message.id, createdAt: message.createdAt }, { status: 201 });
  } catch (error) {
    captureError(error, { route: "POST /api/messages" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
