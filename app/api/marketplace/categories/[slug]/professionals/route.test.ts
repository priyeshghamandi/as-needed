import { describe, expect, it } from "vitest";

describe("GET /api/marketplace/categories/[slug]/professionals", () => {
  it("CAT-API-003: professional shape excludes availability block times", () => {
    type Keys = keyof import("@/lib/marketplace/search-results").MarketplaceSearchResult;
    const keys: Keys[] = [
      "id",
      "publicSlug",
      "displayName",
      "role",
      "roleLabel",
      "headline",
      "specialty",
      "yearsExperienceLabel",
      "city",
      "state",
      "agencyName",
      "approximateAvailability",
      "availabilityLabel",
    ];
    expect(keys).not.toContain("availability_blocks" as Keys);
    expect(keys).not.toContain("startAt" as Keys);
  });
});
