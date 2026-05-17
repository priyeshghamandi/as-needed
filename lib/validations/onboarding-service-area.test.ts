import { describe, expect, it } from "vitest";
import { onboardingServiceAreaSchema } from "./onboarding-service-area";

const validServiceArea = {
  primaryServiceArea: {
    displayName: "Austin, TX",
    placeId: "mock-austin",
    city: "Austin",
    state: "TX",
    country: "US",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  serviceAreaRadiusMiles: 50,
};

describe("onboardingServiceAreaSchema", () => {
  it("ONB-UT-010: valid service area + radius 50 passes", () => {
    expect(onboardingServiceAreaSchema.safeParse(validServiceArea).success).toBe(true);
  });

  it("ONB-UT-011: radius 9 fails", () => {
    const result = onboardingServiceAreaSchema.safeParse({
      ...validServiceArea,
      serviceAreaRadiusMiles: 9,
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-012: radius 76 fails", () => {
    const result = onboardingServiceAreaSchema.safeParse({
      ...validServiceArea,
      serviceAreaRadiusMiles: 76,
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-013: missing placeId fails", () => {
    const result = onboardingServiceAreaSchema.safeParse({
      ...validServiceArea,
      primaryServiceArea: { ...validServiceArea.primaryServiceArea, placeId: "" },
    });
    expect(result.success).toBe(false);
  });
});
