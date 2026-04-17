import { env } from "@/env.mjs";

export type ShippingMode = "manual" | "shippo";

const SHIPPING_MODE_FALLBACK: ShippingMode = "manual";

function resolveShippingMode(candidate: unknown): ShippingMode {
  if (candidate === "shippo") {
    return "shippo";
  }

  return SHIPPING_MODE_FALLBACK;
}

function toNonNegativeInteger(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

const resolvedMode = resolveShippingMode((env as Record<string, unknown>).SHIPPING_MODE);
const manualFlatFeeCents = toNonNegativeInteger(
  (env as Record<string, unknown>).MANUAL_SHIPPING_FLAT_FEE_CENTS,
);

export const shippingConfig = {
  mode: resolvedMode,
  manualFlatFeeCents,
  get isManual() {
    return this.mode === "manual";
  },
  get isShippo() {
    return this.mode === "shippo";
  },
};

export function getShippingMode(): ShippingMode {
  return shippingConfig.mode;
}

export function isManualShippingEnabled(): boolean {
  return shippingConfig.mode === "manual";
}

export function isShippoEnabled(): boolean {
  return shippingConfig.mode === "shippo";
}

export function getManualShippingFlatFeeCents(): number {
  return shippingConfig.manualFlatFeeCents;
}
