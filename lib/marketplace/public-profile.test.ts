import { describe, expect, it } from "vitest";
import {
  buildPublicProfileWarnings,
  isPublicProfileHeadlineConfigured,
} from "@/lib/marketplace/public-profile-format";

describe("public-profile", () => {
  it("PPP-UNIT-010: headline configured check", () => {
    expect(isPublicProfileHeadlineConfigured("ICU RN")).toBe(true);
    expect(isPublicProfileHeadlineConfigured("  ")).toBe(false);
    expect(isPublicProfileHeadlineConfigured(null)).toBe(false);
  });

  it("PPP-UNIT-011: warnings when visible without headline", () => {
    const warnings = buildPublicProfileWarnings({
      isMarketplaceVisible: true,
      profileHeadline: null,
      publicSlug: "jane-doe-abc",
    });
    expect(warnings.length).toBeGreaterThan(0);
  });
});
