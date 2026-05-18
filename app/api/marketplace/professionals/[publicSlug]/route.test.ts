import { describe, expect, it } from "vitest";

describe("GET /api/marketplace/professionals/[publicSlug]", () => {
  it("PPP-API-003: public profile JSON shape has no schedule fields", () => {
    type Profile = import("@/lib/marketplace/public-profile-queries").PublicProfessionalProfile;
    const keys: (keyof Profile)[] = [
      "id",
      "publicSlug",
      "displayName",
      "role",
      "roleLabel",
      "headline",
      "bio",
      "specialties",
      "photoUrl",
      "approximateAvailability",
      "availabilityLabel",
      "yearsExperienceLabel",
      "credentialsSummary",
      "city",
      "state",
      "agencyName",
      "canRequest",
      "locationRequired",
    ];
    expect(keys).not.toContain("startAt" as keyof Profile);
    expect(keys).not.toContain("availability_blocks" as keyof Profile);
  });
});
