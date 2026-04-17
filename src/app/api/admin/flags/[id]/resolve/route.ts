import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logging";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await requireSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") return null;
  return session;
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.flag.update({
      where: { id },
      data: { status: "resolved" },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    captureError(error, { route: "PATCH /api/admin/flags/:id/resolve" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
