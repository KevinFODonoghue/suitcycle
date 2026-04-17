// src/lib/validators/account.ts
import { z } from "zod";

export const handleRegex = /^[a-z0-9_.]{3,20}$/; // lowercase letters, numbers, underscores, dots

export const ProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(80, "Full name must be 80 characters or fewer"),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(handleRegex, "Handle must be 3-20 chars (lowercase letters, numbers, . or _)."),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or fewer")
    .optional()
    .transform((value) => (value?.length ? value : undefined)),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const AddressTypeSchema = z.enum(["shipping", "returns"]);

const phoneRegex = /^[+0-9().\s-]{7,20}$/;

export const AddressSchema = z.object({
  id: z.string().optional(),
  type: AddressTypeSchema,
  recipientName: z
    .string()
    .trim()
    .min(1, "Recipient name is required")
    .max(120, "Recipient name must be 120 characters or fewer"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Enter a valid phone number",
    })
    .transform((value) => (value && value.length ? value : undefined)),
  line1: z
    .string()
    .trim()
    .min(1, "Address line 1 is required")
    .max(120, "Address line 1 must be 120 characters or fewer"),
  line2: z
    .string()
    .trim()
    .max(120, "Address line 2 must be 120 characters or fewer")
    .optional()
    .transform((value) => (value?.length ? value : undefined)),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(80, "City must be 80 characters or fewer"),
  state: z
    .string()
    .trim()
    .min(1, "State or province is required")
    .max(80, "State or province must be 80 characters or fewer"),
  postalCode: z
    .string()
    .trim()
    .min(2, "Postal code is required")
    .max(20, "Postal code must be 20 characters or fewer"),
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter ISO country code")
    .toUpperCase(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof AddressSchema>;

export const DeleteAddressSchema = z.object({
  id: z.string().min(1, "Address id is required"),
});

export const SetDefaultAddressSchema = z.object({
  id: z.string().min(1, "Address id is required"),
  type: AddressTypeSchema,
});

export function parseProfileUpdate(input: unknown): ProfileUpdateInput {
  return ProfileUpdateSchema.parse(input);
}

export function parseAddressInput(input: unknown): AddressInput {
  return AddressSchema.parse(input);
}
