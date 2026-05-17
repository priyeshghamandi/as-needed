import { describe, expect, it } from "vitest";
import { onboardingProfileSchema } from "./onboarding-profile";

const validProfile = {
  phone: "+1 555 010 2841",
  website: "",
  logoUrl: "",
  operationalContactName: "Jane Doe",
  operationalContactEmail: "ops@agency.com",
  description: "",
  staffingSpecialties: ["RN Staffing"],
};

describe("onboardingProfileSchema", () => {
  it("ONB-UT-001: valid profile payload passes", () => {
    expect(onboardingProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("ONB-UT-002: missing staffingSpecialties fails", () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      staffingSpecialties: [],
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-003: more than 8 specialties fails", () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      staffingSpecialties: Array.from({ length: 9 }, (_, i) => `Specialty ${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-004: invalid operationalContactEmail fails", () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      operationalContactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("ONB-UT-005: invalid optional website URL fails", () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
