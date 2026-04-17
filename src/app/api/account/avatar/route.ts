// src/app/api/account/avatar/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serverEnvOnly } from "@/env.mjs";
import { uploadPublicImage } from "@/lib/storage/upload";
import { parseWithZod } from "@/lib/validation/utils";
import { captureError } from "@/lib/logging";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AvatarUploadSchema = z.object({
  file: z.instanceof(File, { message: "A valid image is required." }),
});

/**
 * POST /api/account/avatar
 * - Requires auth (401 if not signed in)
 * - Expects multipart/form-data with "file"
 * - Max size 2 MB
 * - Uploads to Supabase Storage and stores public URL on user.image
 */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    enforceRateLimit({
      identifier: generateRateLimitKey("api:accountAvatar", userId ?? getRequestIp(req)),
      limit: 4,
      windowMs: 120_000,
    });

    const bucket = serverEnvOnly.SUPABASE_AVATAR_BUCKET ?? "avatars";

    // Validate content type
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    // Parse form and validate file
    const form = await req.formData();
    const validation = parseWithZod(AvatarUploadSchema, {
      file: form.get("file"),
    });
    if (!validation.success) {
      return NextResponse.json(validation.details, { status: 400 });
    }
    const file = validation.data.file;
    let publicUrl: string;
    try {
      ({ url: publicUrl } = await uploadPublicImage({
        file,
        bucket,
        prefix: userId,
        maxMB: 2,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      const status = /file exceeds|unsupported file type|valid file must be provided/i.test(
        message
      )
        ? 400
        : 500;

      return NextResponse.json({ error: message }, { status });
    }

    // Persist on user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl, image: publicUrl },
      select: { id: true, avatarUrl: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    captureError(error, { route: "POST /api/account/avatar" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
