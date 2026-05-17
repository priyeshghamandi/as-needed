import { describe, expect, it } from "vitest";
import { facilitySchema } from "./facility";

const validLocation = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

const validFacility = {
  name: "Memorial Hospital",
  type: "hospital" as const,
  location: validLocation,
  contactName: "Pat Rivera",
  contactEmail: "pat@example.com",
  contactPhone: "5551234567",
  inviteContact: true,
};

describe("facilitySchema", () => {
  it("FAC-UT-001: valid facility payload passes", () => {
    expect(facilitySchema.safeParse(validFacility).success).toBe(true);
  });

  it("FAC-UT-002: missing name fails", () => {
    expect(facilitySchema.safeParse({ ...validFacility, name: "A" }).success).toBe(false);
  });

  it("FAC-UT-003: invalid type enum fails", () => {
    expect(facilitySchema.safeParse({ ...validFacility, type: "invalid" }).success).toBe(false);
  });

  it("FAC-UT-004: invalid contact email fails", () => {
    expect(facilitySchema.safeParse({ ...validFacility, contactEmail: "bad" }).success).toBe(false);
  });

  it("FAC-UT-005: missing placeId fails", () => {
    expect(
      facilitySchema.safeParse({
        ...validFacility,
        location: { ...validLocation, placeId: "" },
      }).success,
    ).toBe(false);
  });

  it("FAC-UT-006: notes > 2000 chars fails", () => {
    expect(
      facilitySchema.safeParse({ ...validFacility, notes: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
