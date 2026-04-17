import { describe, expect, it } from "vitest";

import {
  AddressSchema,
  AddressTypeSchema,
  ProfileUpdateSchema,
} from "@/lib/validators/account";

describe("ProfileUpdateSchema", () => {
  it("accepts valid input", () => {
    const parsed = ProfileUpdateSchema.parse({
      fullName: "Ada Lovelace",
      handle: "ada_l",
      bio: "Creating the future",
    });

    expect(parsed).toMatchObject({
      fullName: "Ada Lovelace",
      handle: "ada_l",
      bio: "Creating the future",
    });
  });

  it("rejects invalid handle", () => {
    expect(() =>
      ProfileUpdateSchema.parse({
        fullName: "Alan Turing",
        handle: "INVALID HANDLE",
        bio: "",
      })
    ).toThrowError();
  });
});

describe("AddressSchema", () => {
  const baseAddress = {
    type: AddressTypeSchema.enum.shipping,
    recipientName: "Grace Hopper",
    line1: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "us",
  } as const;

  it("normalises optional fields", () => {
    const parsed = AddressSchema.parse({
      ...baseAddress,
      line2: "",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    });

    expect(parsed).toMatchObject({
      type: "shipping",
      phone: "+1 (555) 123-4567",
      line2: undefined,
      country: "US",
      isDefault: true,
    });
  });

  it("rejects invalid phone numbers", () => {
    expect(() =>
      AddressSchema.parse({
        ...baseAddress,
        phone: "not-a-phone",
      })
    ).toThrowError();
  });
});
