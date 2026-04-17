import { describe, expect, it } from "vitest";
import {
  GenderFit,
  ListingStatus,
  StrokeSuitability,
  SuitCondition,
} from "@prisma/client";

import {
  ListingEditorSchema,
  ListingUpdateSchema,
  MAX_LISTING_IMAGES,
} from "@/lib/validation/listing";

const baseInput = {
  title: "Arena Carbon Air 2",
  brand: "Arena",
  model: "Carbon Air 2",
  size: "24",
  genderFit: GenderFit.female,
  strokeSuitability: StrokeSuitability.im,
  price: "299.99",
  condition: SuitCondition.podium,
  status: ListingStatus.active,
  description: "Worn for two meets.",
};

describe("ListingEditorSchema", () => {
  it("transforms price input to cents", () => {
    const parsed = ListingEditorSchema.parse(baseInput);
    expect(parsed.price).toBe(29999);
  });

  it("trims and normalises optional description", () => {
    const parsed = ListingEditorSchema.parse({
      ...baseInput,
      description: "  Ready for a new swimmer  ",
    });
    expect(parsed.description).toBe("Ready for a new swimmer");
  });

  it("rejects invalid price strings", () => {
    expect(() =>
      ListingEditorSchema.parse({
        ...baseInput,
        price: "12.999",
      }),
    ).toThrowError(/valid price/i);
  });
});

describe("ListingUpdateSchema", () => {
  it("requires a valid id", () => {
    expect(() =>
      ListingUpdateSchema.parse({
        ...baseInput,
        id: "not-a-cuid",
      }),
    ).toThrowError(/invalid/i);
  });
});

describe("MAX_LISTING_IMAGES", () => {
  it("caps the number of listing photos", () => {
    expect(MAX_LISTING_IMAGES).toBe(8);
  });
});
