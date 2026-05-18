import { describe, expect, it } from "vitest";
import {
  canManageMarketplaceVisibility,
  canViewMarketplaceVisibility,
} from "@/lib/auth/marketplace-visibility-permissions";

describe("marketplace-visibility-permissions", () => {
  it("recruiter can manage", () => {
    expect(canManageMarketplaceVisibility("recruiter")).toBe(true);
  });

  it("coordinator cannot manage", () => {
    expect(canManageMarketplaceVisibility("staffing_coordinator")).toBe(false);
  });

  it("coordinator can view", () => {
    expect(canViewMarketplaceVisibility("staffing_coordinator")).toBe(true);
  });
});
