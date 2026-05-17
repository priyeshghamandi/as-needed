import { describe, expect, it } from "vitest";
import { onboardingProfessionalSchema } from "./onboarding-professional";

const validLocation = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

const validProfessional = {
  firstName: "Alex",
  lastName: "Rivera",
  role: "rn" as const,
  email: "alex@example.com",
  phone: "",
  location: validLocation,
  sendInvite: false,
};

describe("onboardingProfessionalSchema", () => {
  it("ONB-UT-020: valid professional passes", () => {
    expect(onboardingProfessionalSchema.safeParse(validProfessional).success).toBe(true);
  });

  it("ONB-UT-021: sendInvite true without email fails", () => {
    const result = onboardingProfessionalSchema.safeParse({
      ...validProfessional,
      email: "",
      sendInvite: true,
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-022: missing both email and phone fails", () => {
    const result = onboardingProfessionalSchema.safeParse({
      ...validProfessional,
      email: "",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-023: invalid role enum fails", () => {
    const result = onboardingProfessionalSchema.safeParse({
      ...validProfessional,
      role: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
