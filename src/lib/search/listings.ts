import {
  GenderFit,
  ListingStatus,
  Prisma,
  StrokeSuitability,
  SuitCondition,
} from "@prisma/client";

export const LISTINGS_PAGE_SIZE = 24;

const MAX_PRICE_CENTS = 1_000_000; // $10,000 ceiling to prevent runaway queries

const SORT_ORDERS: Record<string, Prisma.ListingOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  price_asc: [{ price: "asc" }, { createdAt: "desc" }],
  price_desc: [{ price: "desc" }, { createdAt: "desc" }],
  size: [{ size: "asc" }, { createdAt: "desc" }],
  suitScore_desc: [{ suitScore: "desc" }, { createdAt: "desc" }],
};

type ListingQuery = {
  where: Prisma.ListingWhereInput;
  orderBy: Prisma.ListingOrderByWithRelationInput[];
  take: number;
  skip: number;
};

export function buildListingQuery(params: URLSearchParams): ListingQuery {
  const filters: Prisma.ListingWhereInput[] = [
    { status: ListingStatus.active },
  ];

  const q = params.get("q")?.trim();
  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const brands = getMultiValue(params, "brand");
  if (brands.length > 0) {
    filters.push({ brand: { in: brands } });
  }

  const models = getMultiValue(params, "model");
  if (models.length > 0) {
    filters.push({ model: { in: models } });
  }

  const sizes = getMultiValue(params, "size");
  if (sizes.length > 0) {
    filters.push({ size: { in: sizes } });
  }

  const conditions = getEnumValues(params, "condition", SuitCondition);
  if (conditions.length > 0) {
    filters.push({ condition: { in: conditions } });
  }

  const genders = getEnumValues(params, "gender", GenderFit);
  if (genders.length > 0) {
    filters.push({ genderFit: { in: genders } });
  }

  const strokes = getEnumValues(params, "stroke", StrokeSuitability);
  if (strokes.length > 0) {
    filters.push({ strokeSuitability: { in: strokes } });
  }

  const VALID_AGE_CATEGORIES = new Set(["twelve_and_under", "thirteen_and_over"]);
  const ageCategories = getMultiValue(params, "ageCategory").filter((v) =>
    VALID_AGE_CATEGORIES.has(v),
  );
  if (ageCategories.length > 0) {
    filters.push({ ageCategory: { in: ageCategories as ("twelve_and_under" | "thirteen_and_over")[] } });
  }

  const [minPrice, maxPrice] = normalizeRange(
    parsePrice(params.get("minPrice")),
    parsePrice(params.get("maxPrice")),
  );
  if (minPrice !== null || maxPrice !== null) {
    const priceRange: Prisma.IntFilter = {};
    if (minPrice !== null) priceRange.gte = minPrice;
    if (maxPrice !== null) priceRange.lte = maxPrice;
    filters.push({ price: priceRange });
  }

  const where =
    filters.length === 1 ? filters[0] : ({ AND: filters } satisfies Prisma.ListingWhereInput);

  const sortKey = params.get("sort") ?? "newest";
  const orderBy = SORT_ORDERS[sortKey] ?? SORT_ORDERS.newest;

  const page = parsePage(params.get("page"));
  const take = LISTINGS_PAGE_SIZE;
  const skip = Math.max(0, (page - 1) * take);

  return { where, orderBy, take, skip };
}

function parsePage(value: string | null): number {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 200);
}

function getMultiValue(params: URLSearchParams, key: string): string[] {
  const input = params.getAll(key);
  if (input.length === 0) return [];

  const deduped = new Set<string>();
  for (const raw of input) {
    if (!raw) continue;
    for (const value of raw.split(",")) {
      const trimmed = value.trim();
      if (trimmed) {
        deduped.add(trimmed);
      }
    }
  }

  return Array.from(deduped);
}

function getEnumValues<T extends string>(
  params: URLSearchParams,
  key: string,
  enumObject: Record<string, T>,
): T[] {
  const valid = new Set<T>(Object.values(enumObject));
  const values: T[] = [];

  for (const raw of params.getAll(key)) {
    if (!raw) continue;
    for (const fragment of raw.split(",")) {
      const normalized = fragment.trim().toLowerCase();
      if (!normalized) continue;
      if (valid.has(normalized as T) && !values.includes(normalized as T)) {
        values.push(normalized as T);
      }
    }
  }

  return values;
}

function parsePrice(value: string | null): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  const cents = Math.round(parsed * 100);
  if (cents < 0) return null;
  return Math.min(cents, MAX_PRICE_CENTS);
}

function normalizeRange(
  min: number | null,
  max: number | null,
): [number | null, number | null] {
  if (min !== null && max !== null && min > max) {
    return [max, min];
  }
  return [min, max];
}
