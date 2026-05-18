import { describe, expect, it } from "vitest";
import { rankMarketplaceResults } from "@/lib/marketplace/search-ranking";

describe("marketplace search-ranking", () => {
  it("MPS-RANK-001: boosts likely_available above recently_active", () => {
    const ranked = rankMarketplaceResults(
      [
        { approximateAvailability: "recently_active" },
        { approximateAvailability: "likely_available" },
      ],
      { sort: "relevance" },
    );
    expect(ranked[0].approximateAvailability).toBe("likely_available");
  });
});
