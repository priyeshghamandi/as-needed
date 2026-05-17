import { describe, expect, it } from "vitest";
import { onboardingFacilitySchema } from "./onboarding-facility";

const validFacility = {
  name: "Memorial Hospital",
  type: "hospital" as const,
  location: {
    displayName: "San Francisco, CA",
    placeId: "mock-sf",
    city: "San Francisco",
    state: "CA",
    country: "US",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  contactName: "Pat Lee",
  contactEmail: "pat@facility.com",
  contactPhone: "+1 555 010 9999",
  inviteContact: true,
};

describe("onboardingFacilitySchema", () => {
  it("ONB-UT-030: valid facility passes", () => {
    expect(onboardingFacilitySchema.safeParse(validFacility).success).toBe(true);
  });

  it("ONB-UT-031: invalid facility type fails", () => {
    const result = onboardingFacilitySchema.safeParse({
      ...validFacility,
      type: "clinic_invalid",
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-032: invalid contact email fails", () => {
    const result = onboardingFacilitySchema.safeParse({
      ...validFacility,
      contactEmail: "bad-email",
    });
    expect(result.success).toBe(false);
  });
});
