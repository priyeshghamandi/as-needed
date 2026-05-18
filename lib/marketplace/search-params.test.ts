import { describe, expect, it } from "vitest";
import {
  normalizeMarketplaceRoleParam,
  parseMarketplaceSearchInput,
} from "@/lib/marketplace/search-params";

describe("marketplace search-params", () => {
  it("MPS-001: normalizes role aliases", () => {
    expect(normalizeMarketplaceRoleParam("RN")).toBe("rn");
    expect(normalizeMarketplaceRoleParam("cna")).toBe("cna");
  });

  it("MPS-002: requires location for search", () => {
    const parsed = parseMarketplaceSearchInput(
      {
        role: "rn",
        urgency: "asap",
        sort: "relevance",
        page: 1,
      },
      null,
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toMatch(/location/i);
    }
  });

  it("MPS-003: accepts cookie location when lat/lng omitted", () => {
    const parsed = parseMarketplaceSearchInput(
      {
        role: "rn",
        urgency: "flexible",
        sort: "relevance",
        page: 1,
      },
      { latitude: 19.9975, longitude: 73.7898 },
    );
    expect(parsed.ok).toBe(true);
  });
});
