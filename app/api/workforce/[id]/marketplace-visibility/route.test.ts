import { describe, expect, it } from "vitest";
import { canManageMarketplaceVisibility } from "@/lib/auth/marketplace-visibility-permissions";
import { marketplaceVisibilityPatchSchema } from "@/lib/validations/marketplace-visibility";

describe("marketplace-visibility API rules", () => {
  it("MEL-API-001: valid patch body", () => {
    const parsed = marketplaceVisibilityPatchSchema.safeParse({ isMarketplaceVisible: true });
    expect(parsed.success).toBe(true);
  });

  it("MEL-API-002: coordinator cannot manage", () => {
    expect(canManageMarketplaceVisibility("staffing_coordinator")).toBe(false);
  });

  it("MEL-API-003: recruiter can manage", () => {
    expect(canManageMarketplaceVisibility("recruiter")).toBe(true);
  });
});
