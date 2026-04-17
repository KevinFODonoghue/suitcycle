import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureUniqueHandle } from "@/lib/users";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name is too long.")
    .optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const data = registerSchema.parse(raw);

    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(data.password, 12);

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "An account with that email already exists." },
          { status: 409 },
        );
      }

      await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName ?? existing.fullName ?? existing.name,
          passwordHash,
        },
      });

      return NextResponse.json({ success: true });
    }

    const baseHandle = data.fullName ?? email.split("@")[0];
    const handle = await ensureUniqueHandle(baseHandle);

    await prisma.user.create({
      data: {
        email,
        fullName: data.fullName ?? null,
        handle,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    console.error("[auth:register]", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
