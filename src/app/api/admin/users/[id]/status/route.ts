import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["active", "banned"]),
});

async function requireAdmin() {
  const session = await requireSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") return null;
  return session;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    // Prevent self-ban
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own status" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    captureError(error, { route: "PATCH /api/admin/users/:id/status" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
