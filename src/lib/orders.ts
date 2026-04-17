import { OrderStatus, Prisma } from "@prisma/client";
import type { Listing, ShippingMode } from "@prisma/client";

export type OrderEvent = {
  type: "status";
  status: OrderStatus;
  at: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ListingSnapshotSource = Pick<
  Listing,
  | "id"
  | "title"
  | "brand"
  | "model"
  | "size"
  | "genderFit"
  | "strokeSuitability"
  | "condition"
  | "photos"
  | "description"
  | "price"
>;

export type OrderSnapshot = {
  capturedAt: string;
  status: OrderStatus;
  listing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    size: string;
    genderFit: string;
    strokeSuitability: string;
    condition: string;
    description: string | null;
    photos: string[];
    listPrice: number;
  };
  parties: {
    buyerId: string;
    sellerId: string;
  };
  pricing: {
    buyerTotal: number;
    creditedToSeller: number;
    platformFee: number;
    shippingFee: number;
    currency: string;
  };
  shipping: {
    mode: ShippingMode;
    trackingUrl: string | null;
  };
};

export function ensureOrderEvents(
  raw: Prisma.JsonValue | null | undefined,
): OrderEvent[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((entry) => {
    if (!isOrderEvent(entry)) {
      return [];
    }

    return [
      {
        type: "status",
        status: entry.status,
        message: entry.message,
        at: normalizeDate(entry.at),
        metadata:
          entry.metadata && typeof entry.metadata === "object"
            ? (entry.metadata as Record<string, unknown>)
            : undefined,
      },
    ];
  });
}

export function createStatusEvent(
  status: OrderStatus,
  message: string,
  occurredAt: Date = new Date(),
  metadata: Record<string, unknown> = {},
): OrderEvent {
  return {
    type: "status",
    status,
    message,
    at: occurredAt.toISOString(),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

export function appendStatusEvent(
  events: OrderEvent[],
  status: OrderStatus,
  message: string,
  occurredAt: Date = new Date(),
  metadata: Record<string, unknown> = {},
): OrderEvent[] {
  const lastEvent = [...events].reverse().find((event) => event.type === "status");
  if (lastEvent && lastEvent.status === status) {
    return events;
  }

  return [...events, createStatusEvent(status, message, occurredAt, metadata)];
}

export function serializeOrderEvents(events: OrderEvent[]): Prisma.JsonArray {
  // Cast OrderEvent[] into Prisma-compatible JSON for persistence.
  return events as unknown as Prisma.JsonArray;
}

export function buildOrderSnapshot(
  listing: ListingSnapshotSource,
  {
    buyerId,
    sellerId,
    price,
    appFee,
    currency,
    status,
    shippingMode,
    shippingFee = 0,
    trackingUrl = null,
    capturedAt = new Date(),
  }: {
    buyerId: string;
    sellerId: string;
    price: number;
    appFee: number;
    currency: string;
    status: OrderStatus;
    shippingMode: ShippingMode;
    shippingFee?: number;
    trackingUrl?: string | null;
    capturedAt?: Date;
  },
): OrderSnapshot {
  const normalizedShippingFee =
    typeof shippingFee === "number" && Number.isFinite(shippingFee)
      ? Math.max(0, Math.round(shippingFee))
      : 0;
  const normalizedTrackingUrl =
    typeof trackingUrl === "string" && trackingUrl.length > 0
      ? trackingUrl
      : null;

  return {
    capturedAt: capturedAt.toISOString(),
    status,
    listing: {
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      size: listing.size,
      genderFit: listing.genderFit,
      strokeSuitability: listing.strokeSuitability,
      condition: listing.condition,
      description: listing.description ?? null,
      photos: listing.photos,
      listPrice: listing.price,
    },
    parties: {
      buyerId,
      sellerId,
    },
    pricing: {
      buyerTotal: price,
      creditedToSeller: Math.max(price - appFee, 0),
      platformFee: appFee,
      shippingFee: normalizedShippingFee,
      currency,
    },
    shipping: {
      mode: shippingMode,
      trackingUrl: normalizedTrackingUrl,
    },
  };
}

export function calculatePlatformFee(amountInCents: number): number {
  return Math.max(0, Math.round(amountInCents * 0.1));
}

const ORDER_STATUS_VALUES = new Set<OrderStatus>([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
};

const ORDER_STATUS_BADGES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-indigo-100 text-indigo-800",
  canceled: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  return ORDER_STATUS_BADGES[status] ?? "bg-muted text-foreground";
}

export function parseOrderSnapshot(
  raw: Prisma.JsonValue | null | undefined,
): OrderSnapshot | null {
  if (!raw || typeof raw !== "object" || raw === null) {
    return null;
  }

  const snapshot = raw as Record<string, unknown>;
  const listingRaw = snapshot.listing;

  if (!listingRaw || typeof listingRaw !== "object") {
    return null;
  }

  const listing = listingRaw as Record<string, unknown>;
  const parties =
    typeof snapshot.parties === "object" && snapshot.parties !== null
      ? (snapshot.parties as Record<string, unknown>)
      : undefined;
  const pricing =
    typeof snapshot.pricing === "object" && snapshot.pricing !== null
      ? (snapshot.pricing as Record<string, unknown>)
      : undefined;
  const shipping =
    typeof snapshot.shipping === "object" && snapshot.shipping !== null
      ? (snapshot.shipping as Record<string, unknown>)
      : undefined;

  const statusCandidate = snapshot.status;
  const status =
    typeof statusCandidate === "string" &&
    ORDER_STATUS_VALUES.has(statusCandidate as OrderStatus)
      ? (statusCandidate as OrderStatus)
      : OrderStatus.pending;

  const capturedAtValue = snapshot.capturedAt;
  const capturedAt =
    typeof capturedAtValue === "string"
      ? normalizeDate(capturedAtValue)
      : new Date().toISOString();

  const buyerId =
    (parties?.buyerId as string | undefined) ??
    (snapshot.buyerId as string | undefined) ??
    "";
  const sellerId =
    (parties?.sellerId as string | undefined) ??
    (snapshot.sellerId as string | undefined) ??
    "";

  const buyerTotal =
    (pricing?.buyerTotal as number | undefined) ??
    (snapshot.price as number | undefined) ??
    0;
  const platformFee =
    (pricing?.platformFee as number | undefined) ??
    (snapshot.appFee as number | undefined) ??
    0;
  const rawShippingFee =
    (pricing?.shippingFee as number | undefined) ??
    (snapshot.shippingFee as number | undefined) ??
    0;
  const shippingFee =
    typeof rawShippingFee === "number" && Number.isFinite(rawShippingFee)
      ? Math.max(rawShippingFee, 0)
      : 0;
  const creditedToSeller =
    (pricing?.creditedToSeller as number | undefined) ??
    Math.max(buyerTotal - platformFee, 0);
  const currency =
    (pricing?.currency as string | undefined) ??
    (snapshot.currency as string | undefined) ??
    "USD";
  const shippingModeCandidate =
    (shipping?.mode as string | undefined) ??
    (snapshot.shippingMode as string | undefined);
  const shippingMode: ShippingMode =
    shippingModeCandidate === "shippo" ? "shippo" : "manual";
  const trackingUrlValue =
    (shipping?.trackingUrl as string | undefined) ??
    (snapshot.trackingUrl as string | undefined) ??
    null;
  const trackingUrl =
    typeof trackingUrlValue === "string" && trackingUrlValue.length
      ? trackingUrlValue
      : null;

  const photosSource = listing.photos as unknown;
  const photos =
    Array.isArray(photosSource)
      ? (photosSource as unknown[]).filter(
          (photo): photo is string => typeof photo === "string",
        )
      : [];

  const listPriceSource = listing.listPrice as unknown;
  const priceFallback = listing.price as unknown;
  const listPrice =
    typeof listPriceSource === "number"
      ? (listPriceSource as number)
      : typeof priceFallback === "number"
        ? (priceFallback as number)
        : buyerTotal;

  const descriptionValue = listing.description;
  const description =
    typeof descriptionValue === "string" ? (descriptionValue as string) : null;

  return {
    capturedAt,
    status,
    listing: {
      id: typeof listing.id === "string" ? (listing.id as string) : "",
      title:
        typeof listing.title === "string"
          ? (listing.title as string)
          : "Listing",
      brand: typeof listing.brand === "string" ? (listing.brand as string) : "",
      model: typeof listing.model === "string" ? (listing.model as string) : "",
      size: typeof listing.size === "string" ? (listing.size as string) : "",
      genderFit:
        typeof listing.genderFit === "string"
          ? (listing.genderFit as string)
          : "",
      strokeSuitability:
        typeof listing.strokeSuitability === "string"
          ? (listing.strokeSuitability as string)
          : "",
      condition:
        typeof listing.condition === "string"
          ? (listing.condition as string)
          : "",
      description,
      photos,
      listPrice,
    },
    parties: {
      buyerId,
      sellerId,
    },
    pricing: {
      buyerTotal,
      creditedToSeller,
      platformFee,
      shippingFee,
      currency,
    },
    shipping: {
      mode: shippingMode,
      trackingUrl,
    },
  };
}


function normalizeDate(value: unknown): string {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return new Date().toISOString();
}

function isOrderEvent(value: unknown): value is OrderEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === "status" &&
    typeof candidate.status === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.at === "string"
  );
}
