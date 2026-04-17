import { z } from "zod";
import {
  GenderFit,
  ListingStatus,
  StrokeSuitability,
  SuitCondition,
} from "@prisma/client";

import { priceStringToCents } from "@/lib/price";

export const MAX_LISTING_IMAGES = 8;
export const ACCEPTED_LISTING_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

const nonEmptyString = (field: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${field} is required`)
    .max(max, `${field} must be ${max} characters or fewer`);

const optionalText = z
  .string()
  .trim()
  .max(2000, "Description must be 2000 characters or fewer")
  .optional()
  .transform((value) => (value && value.length ? value : undefined));

const priceField = z
  .string()
  .trim()
  .min(1, "Price is required")
  .transform((value, ctx) => {
    try {
      return priceStringToCents(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : "Enter a valid price",
      });
      return z.NEVER;
    }
  })
  .refine((value) => value <= 5000000, {
    message: "Price must be $50,000.00 or less",
  });

export const ListingStatusSchema = z.nativeEnum(ListingStatus);
export const GenderFitSchema = z.nativeEnum(GenderFit);
export const StrokeSuitabilitySchema = z.nativeEnum(StrokeSuitability);
export const SuitConditionSchema = z.nativeEnum(SuitCondition);

export const ListingEditorSchema = z.object({
  title: nonEmptyString("Title", 120, 3),
  brand: nonEmptyString("Brand", 80, 2),
  model: nonEmptyString("Model", 80),
  size: nonEmptyString("Size", 40),
  genderFit: GenderFitSchema,
  strokeSuitability: StrokeSuitabilitySchema,
  price: priceField,
  condition: SuitConditionSchema,
  description: optionalText,
  status: ListingStatusSchema,
});

export type ListingEditorInput = z.infer<typeof ListingEditorSchema>;

export const ListingUpdateSchema = ListingEditorSchema.extend({
  id: z
    .string()
    .trim()
    .cuid("Listing id is invalid"),
});

export type ListingUpdateInput = z.infer<typeof ListingUpdateSchema>;

export const ExistingPhotoSchema = z
  .string()
  .trim()
  .url("Existing photos must be valid URLs");

export const ExistingPhotosSchema = z
  .array(ExistingPhotoSchema)
  .max(MAX_LISTING_IMAGES, `You can keep up to ${MAX_LISTING_IMAGES} photos`);
