import { z } from "zod";

const enforceProdSecrets =
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL === "1" &&
  process.env.SKIP_ENV_VALIDATION !== "1";

const optionalSecret = (key) =>
  z
    .string()
    .min(1, `${key} is required`)
    .optional()
    .superRefine((value, ctx) => {
      if (!value && enforceProdSecrets) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required in production`,
        });
      }
    });

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  RESEND_API_KEY: optionalSecret("RESEND_API_KEY"),
  STRIPE_SECRET_KEY: optionalSecret("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: optionalSecret("STRIPE_WEBHOOK_SECRET"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_AVATAR_BUCKET: z.string().default("avatars"),
  SUPABASE_LISTING_BUCKET: z.string().default("listing-images"),
  SHIPPING_MODE: z.enum(["manual", "shippo"]).default("manual"),
  MANUAL_SHIPPING_FLAT_FEE_CENTS: z.coerce.number().int().min(0).default(0),
  ADMIN_EMAILS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const clientResult = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

if (!clientResult.success) {
  throw new Error(`Invalid client env: ${clientResult.error.message}`);
}

const clientEnvOnly = clientResult.data;

let serverEnvOnly;
if (typeof window === "undefined") {
  const serverResult = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_AVATAR_BUCKET: process.env.SUPABASE_AVATAR_BUCKET ?? "avatars",
    SUPABASE_LISTING_BUCKET:
      process.env.SUPABASE_LISTING_BUCKET ?? "listing-images",
    SHIPPING_MODE: process.env.SHIPPING_MODE,
    MANUAL_SHIPPING_FLAT_FEE_CENTS:
      process.env.MANUAL_SHIPPING_FLAT_FEE_CENTS,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    SENTRY_DSN: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!serverResult.success) {
    throw new Error(`Invalid server env: ${serverResult.error.message}`);
  }

  serverEnvOnly = serverResult.data;
} else {
  serverEnvOnly = new Proxy(
    {},
    {
      get() {
        throw new Error("Attempted to access server env on the client");
      },
    }
  );
}

export { clientEnvOnly, serverEnvOnly };

export const env =
  typeof window === "undefined"
    ? { ...serverEnvOnly, ...clientEnvOnly }
    : clientEnvOnly;
