import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["active", "archived", "draft"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify ownership and that it's not a sold listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (listing.status === "sold") {
      return NextResponse.json({ error: "Sold listings cannot be changed" }, { status: 400 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    captureError(error, { route: "PATCH /api/listings/:id/status", listingId: id });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
