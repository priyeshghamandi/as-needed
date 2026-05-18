import { describe, expect, it } from "vitest";
import { sortCategoryProfessionals } from "@/lib/marketplace/category-sort";
import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";

function stubResult(
  overrides: Partial<MarketplaceSearchResult> & { displayName: string },
): MarketplaceSearchResult {
  return {
    id: overrides.id ?? "id",
    publicSlug: overrides.publicSlug ?? "slug",
    displayName: overrides.displayName,
    role: "rn",
    roleLabel: "RN",
    headline: "RN",
    specialty: null,
    yearsExperienceLabel: null,
    city: null,
    state: null,
    agencyName: "Agency",
    approximateAvailability: overrides.approximateAvailability ?? null,
    availabilityLabel: overrides.availabilityLabel ?? null,
  };
}

describe("marketplace categories", () => {
  it("CAT-UNIT-001: sortCategoryProfessionals prefers recently_active then name", () => {
    const sorted = sortCategoryProfessionals([
      stubResult({ displayName: "Zoe Alpha", approximateAvailability: "likely_available" }),
      stubResult({ displayName: "Amy Beta", approximateAvailability: "recently_active" }),
      stubResult({ displayName: "Ann Gamma", approximateAvailability: "recently_active" }),
    ]);
    expect(sorted[0].displayName).toBe("Amy Beta");
    expect(sorted[1].displayName).toBe("Ann Gamma");
    expect(sorted[2].displayName).toBe("Zoe Alpha");
  });
});
