import { randomUUID } from "node:crypto";
import { getSupabaseServerClient, publicUrl } from "@/lib/supabase/server";

const DEFAULT_ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

type ValidateImageOptions = {
  maxMB?: number;
  accept?: string[];
};

export function validateImage(
  file: File,
  { maxMB = 8, accept = DEFAULT_ACCEPT }: ValidateImageOptions = {}
): void {
  if (!(file instanceof File)) {
    throw new Error("A valid file must be provided");
  }

  if (!accept.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File exceeds ${maxMB}MB`);
  }
}

type UploadPublicImageArgs = ValidateImageOptions & {
  file: File;
  bucket: string;
  prefix?: string;
};

export async function uploadPublicImage({
  file,
  bucket,
  prefix = "",
  maxMB,
  accept,
}: UploadPublicImageArgs): Promise<{ url: string; key: string }> {
  validateImage(file, { maxMB, accept });

  const supabase = getSupabaseServerClient();

  const extension = (file.type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const sanitizedPrefix = prefix
    ?.trim()
    .replace(/^\/+|\/+$/gu, "");
  const segments = [sanitizedPrefix, `${randomUUID()}.${extension}`]
    .filter(Boolean)
    .join("/");

  const { data, error } = await supabase.storage.from(bucket).upload(segments, await file.arrayBuffer(), {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error || !data) {
    throw new Error(error?.message || "Failed to upload image to Supabase");
  }

  return {
    url: publicUrl({ bucket, path: data.path }),
    key: data.path,
  };
}
