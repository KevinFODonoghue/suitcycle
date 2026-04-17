import { prisma } from "@/lib/prisma";

function slugify(base: string) {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export async function ensureUniqueHandle(base: string) {
  let candidate = slugify(base || "user");
  if (!candidate || candidate.length < 3) candidate = "user";
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.user.findUnique({ where: { handle: candidate } });
    if (!exists) return candidate;
    const suffix = Math.random().toString(36).slice(2, 7);
    candidate = `${candidate}_${suffix}`;
  }
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}
