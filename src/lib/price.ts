// ─── Perk pricing constants ────────────────────────────────────────────────
// Seller perks — taken as a percentage of the base sale price (basis points).
export const SELLER_PERK_PRIORITY_BPS = 300;        // 3%
export const SELLER_PERK_AUTHENTICATION_BPS = 500;  // 5%
export const SELLER_PERK_VERIFIED_SUITSCORE_BPS = 500; // 5%

// Human-readable percents (for UI labels).
export const SELLER_PERK_PRIORITY_PERCENT = 3;
export const SELLER_PERK_AUTHENTICATION_PERCENT = 5;
export const SELLER_PERK_VERIFIED_SUITSCORE_PERCENT = 5;

// Buyer perks — flat fee add-ons on top of the purchase price (cents).
export const BUYER_PERK_AUTHENTICATION_FEE = 1500;    // $15.00
export const BUYER_PERK_VERIFIED_SUITSCORE_FEE = 1500; // $15.00

// Platform fee (basis points).
export const PLATFORM_FEE_BPS = 1000; // 10%

export interface PerkPricing {
  basePrice: number;
  shippingFee: number;
  buyerPerksFee: number;
  buyerTotal: number;
  platformFee: number;
  sellerPerksFeePercent: number; // basis points
  sellerPerksFee: number;
  sellerPayout: number;
  suitCycleRevenue: number;
}

export function calcPerkPricing(opts: {
  basePrice: number;
  shippingFee: number;
  buyerPerkAuthentication: boolean;
  buyerPerkVerifiedSuitscore: boolean;
  sellerPerkPriority: boolean;
  sellerPerkAuthentication: boolean;
  sellerPerkVerifiedSuitscore: boolean;
  sellerPerkPriorityVoucherCovered: boolean;
  sellerPerkAuthVoucherCovered: boolean;
  sellerPerkSuitscoreVoucherCovered: boolean;
}): PerkPricing {
  const {
    basePrice, shippingFee,
    buyerPerkAuthentication, buyerPerkVerifiedSuitscore,
    sellerPerkPriority, sellerPerkAuthentication, sellerPerkVerifiedSuitscore,
    sellerPerkPriorityVoucherCovered, sellerPerkAuthVoucherCovered, sellerPerkSuitscoreVoucherCovered,
  } = opts;

  const buyerPerksFee =
    (buyerPerkAuthentication ? BUYER_PERK_AUTHENTICATION_FEE : 0) +
    (buyerPerkVerifiedSuitscore ? BUYER_PERK_VERIFIED_SUITSCORE_FEE : 0);

  const buyerTotal = basePrice + shippingFee + buyerPerksFee;
  const platformFee = Math.round((basePrice * PLATFORM_FEE_BPS) / 10000);

  let sellerPerksBps = 0;
  if (sellerPerkPriority && !sellerPerkPriorityVoucherCovered) sellerPerksBps += SELLER_PERK_PRIORITY_BPS;
  if (sellerPerkAuthentication && !sellerPerkAuthVoucherCovered) sellerPerksBps += SELLER_PERK_AUTHENTICATION_BPS;
  if (sellerPerkVerifiedSuitscore && !sellerPerkSuitscoreVoucherCovered) sellerPerksBps += SELLER_PERK_VERIFIED_SUITSCORE_BPS;

  const sellerPerksFee = Math.round((basePrice * sellerPerksBps) / 10000);
  const sellerPayout = Math.max(0, basePrice - platformFee - sellerPerksFee);
  const suitCycleRevenue = platformFee + sellerPerksFee + buyerPerksFee;

  return {
    basePrice,
    shippingFee,
    buyerPerksFee,
    buyerTotal,
    platformFee,
    sellerPerksFeePercent: sellerPerksBps,
    sellerPerksFee,
    sellerPayout,
    suitCycleRevenue,
  };
}

// ─── Formatting ────────────────────────────────────────────────────────────
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";
const PRICE_INPUT_REGEX = /^\d+(?:\.\d{0,2})?$/;

export function formatPrice(
  cents: number,
  {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
  }: { locale?: string; currency?: string } = {},
): string {
  if (Number.isNaN(cents)) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function priceStringToCents(raw: string): number {
  const value = raw.replace(/[$,\s]/g, "");
  if (!PRICE_INPUT_REGEX.test(value)) {
    throw new Error("Enter a valid price (up to two decimals).");
  }

  const [dollars, cents = ""] = value.split(".");
  const normalizedCents = cents.padEnd(2, "0").slice(0, 2);
  const parsedDollars = Number.parseInt(dollars, 10);
  const parsedCents = Number.parseInt(normalizedCents || "0", 10);

  if (Number.isNaN(parsedDollars) || Number.isNaN(parsedCents)) {
    throw new Error("Enter a valid price (up to two decimals).");
  }

  const total = parsedDollars * 100 + parsedCents;
  if (total < 0) {
    throw new Error("Price cannot be negative.");
  }

  return total;
}

export function centsToPriceInput(cents: number): string {
  if (!Number.isFinite(cents)) return "0.00";
  const absolute = Math.max(0, Math.round(cents));
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  return `${dollars}.${remainder.toString().padStart(2, "0")}`;
}
