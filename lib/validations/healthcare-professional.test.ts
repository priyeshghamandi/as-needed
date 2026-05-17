import { describe, expect, it } from "vitest";
import { healthcareProfessionalSchema } from "./healthcare-professional";

const validLocation = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

const validMinimal = {
  firstName: "Alex",
  lastName: "Rivera",
  role: "rn" as const,
  email: "alex@example.com",
  phone: "",
  location: validLocation,
  sendInvite: false,
};

describe("healthcareProfessionalSchema", () => {
  it("WORK-UT-001: valid minimal payload passes", () => {
    expect(healthcareProfessionalSchema.safeParse(validMinimal).success).toBe(true);
  });

  it("WORK-UT-002: missing firstName fails", () => {
    const result = healthcareProfessionalSchema.safeParse({ ...validMinimal, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("WORK-UT-003: invalid role enum fails", () => {
    const result = healthcareProfessionalSchema.safeParse({ ...validMinimal, role: "invalid" });
    expect(result.success).toBe(false);
  });

  it("WORK-UT-004: sendInvite true without email fails", () => {
    const result = healthcareProfessionalSchema.safeParse({
      ...validMinimal,
      email: "",
      sendInvite: true,
    });
    expect(result.success).toBe(false);
  });

  it("WORK-UT-005: neither email nor phone fails", () => {
    const result = healthcareProfessionalSchema.safeParse({
      ...validMinimal,
      email: "",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("WORK-UT-006: yearsExperience > 60 fails", () => {
    const result = healthcareProfessionalSchema.safeParse({
      ...validMinimal,
      yearsExperience: 61,
    });
    expect(result.success).toBe(false);
  });

  it("WORK-UT-007: missing placeId on location fails", () => {
    const result = healthcareProfessionalSchema.safeParse({
      ...validMinimal,
      location: { ...validLocation, placeId: "" },
    });
    expect(result.success).toBe(false);
  });
});
