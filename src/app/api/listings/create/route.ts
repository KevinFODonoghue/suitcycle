import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/storage/upload";
import type { AgeCategory, GenderFit, StrokeSuitability, SuitCondition, SuitType, VoucherType } from "@prisma/client";

const VALID_GENDER: GenderFit[] = ["male", "female", "unisex"];
const VALID_STROKE: StrokeSuitability[] = ["fly", "free", "breast", "back", "im"];
const VALID_CONDITION: SuitCondition[] = ["gold", "podium", "prelim", "backup", "practice"];
const VALID_SUIT_TYPE: SuitType[] = ["jammer", "kneeskin", "fullBody", "openBack"];
const VALID_AGE_CATEGORY: AgeCategory[] = ["twelve_and_under", "thirteen_and_over"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const brand = (formData.get("brand") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const size = (formData.get("size") as string)?.trim();
  const genderFit = formData.get("genderFit") as string;
  const suitType = formData.get("suitType") as string;
  const strokeSuitability = formData.get("strokeSuitability") as string;
  const condition = formData.get("condition") as string;
  const ageCategory = formData.get("ageCategory") as string;
  const priceStr = formData.get("price") as string;
  const description = (formData.get("description") as string)?.trim() || undefined;

  // Basic validation
  if (!brand || !model || !size) {
    return NextResponse.json({ error: "Brand, model, and size are required" }, { status: 400 });
  }
  if (!VALID_GENDER.includes(genderFit as GenderFit)) {
    return NextResponse.json({ error: "Invalid gender fit" }, { status: 400 });
  }
  if (!VALID_SUIT_TYPE.includes(suitType as SuitType)) {
    return NextResponse.json({ error: "Invalid suit type" }, { status: 400 });
  }
  if (!VALID_STROKE.includes(strokeSuitability as StrokeSuitability)) {
    return NextResponse.json({ error: "Invalid stroke suitability" }, { status: 400 });
  }
  if (!VALID_CONDITION.includes(condition as SuitCondition)) {
    return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
  }
  if (!VALID_AGE_CATEGORY.includes(ageCategory as AgeCategory)) {
    return NextResponse.json({ error: "Invalid age category" }, { status: 400 });
  }

  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price < 100 || price > 5_000_000) {
    return NextResponse.json({ error: "Price must be between $1 and $50,000" }, { status: 400 });
  }

  // Seller perks
  const sellerPerkPriority = formData.get("sellerPerkPriority") === "true";
  const sellerPerkAuthentication = formData.get("sellerPerkAuthentication") === "true";
  const sellerPerkVerifiedSuitscore = formData.get("sellerPerkVerifiedSuitscore") === "true";
  const sellerPerkPriorityVoucherCode = ((formData.get("sellerPerkPriorityVoucherCode") as string) ?? "").trim().toUpperCase() || null;
  const sellerPerkAuthVoucherCode = ((formData.get("sellerPerkAuthVoucherCode") as string) ?? "").trim().toUpperCase() || null;
  const sellerPerkSuitscoreVoucherCode = ((formData.get("sellerPerkSuitscoreVoucherCode") as string) ?? "").trim().toUpperCase() || null;

  // Upload photos
  const photoFiles = formData.getAll("photos") as File[];
  if (photoFiles.length === 0) {
    return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
  }

  const photoUrls: string[] = [];
  for (const file of photoFiles.slice(0, 6)) {
    try {
      const { url } = await uploadPublicImage({
        file,
        bucket: "listings",
        prefix: userId,
        maxMB: 8,
      });
      photoUrls.push(url);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Photo upload failed" },
        { status: 400 }
      );
    }
  }

  // Resolve voucher coverage for each selected seller perk.
  async function resolveVoucherCoverage(
    code: string | null,
    expectedType: VoucherType,
  ): Promise<boolean> {
    if (!code) return false;
    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher || voucher.type !== expectedType || voucher.redeemedAt) return false;
    if (voucher.expiresAt && voucher.expiresAt < new Date()) return false;
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { redeemedAt: new Date(), redeemedById: userId },
    });
    return true;
  }

  const [priorityCovered, authCovered, suitscoreCovered] = await Promise.all([
    sellerPerkPriority && sellerPerkPriorityVoucherCode
      ? resolveVoucherCoverage(sellerPerkPriorityVoucherCode, "priority_listing")
      : Promise.resolve(false),
    sellerPerkAuthentication && sellerPerkAuthVoucherCode
      ? resolveVoucherCoverage(sellerPerkAuthVoucherCode, "authentication")
      : Promise.resolve(false),
    sellerPerkVerifiedSuitscore && sellerPerkSuitscoreVoucherCode
      ? resolveVoucherCoverage(sellerPerkSuitscoreVoucherCode, "verified_suitscore")
      : Promise.resolve(false),
  ]);

  const listing = await prisma.listing.create({
    data: {
      sellerId: userId,
      title: `${brand} ${model}, Size ${size}`,
      brand,
      model,
      size,
      genderFit: genderFit as GenderFit,
      suitType: suitType as SuitType,
      ageCategory: ageCategory as AgeCategory,
      strokeSuitability: strokeSuitability as StrokeSuitability,
      condition: condition as SuitCondition,
      suitScore: 0, // legacy field, kept for DB compat
      price,
      photos: photoUrls,
      description,
      status: "active",
      // Seller perks
      sellerPerkPriority,
      sellerPerkAuthentication,
      sellerPerkVerifiedSuitscore,
      sellerPerkPriorityVoucherCovered: priorityCovered,
      sellerPerkAuthVoucherCovered: authCovered,
      sellerPerkSuitscoreVoucherCovered: suitscoreCovered,
      // Platform flags — set immediately when seller opted in via perk
      isPriority: sellerPerkPriority,
      priorityExpiresAt: sellerPerkPriority ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
      isAuthenticated: sellerPerkAuthentication,
      suitScoreVerified: sellerPerkVerifiedSuitscore,
    },
  });

  return NextResponse.json({ id: listing.id }, { status: 201 });
}
