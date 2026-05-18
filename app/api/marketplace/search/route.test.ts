import { describe, expect, it } from "vitest";
import {
  MARKETPLACE_SHIFT_TYPES,
  MARKETPLACE_SORT_VALUES,
  parseMarketplaceSearchInput,
} from "@/lib/marketplace/search-params";

describe("GET /api/marketplace/search", () => {
  it("MPS-API-001: validates required role and need", () => {
    const parsed = parseMarketplaceSearchInput(
      { role: "", sort: "relevance", page: 1 },
      { latitude: 37.77, longitude: -122.42 },
    );
    expect(parsed.ok).toBe(false);
  });

  it("MPS-API-002: returns parsed search with pagination and sort", () => {
    const parsed = parseMarketplaceSearchInput(
      {
        role: "cna",
        urgency: "this_week",
        sort: "recently_active",
        page: 2,
        lat: 37.77,
        lng: -122.42,
      },
      null,
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.sort).toBe("recently_active");
    }
  });

  it("MPS-API-003: shift types and sort enums are stable", () => {
    expect(MARKETPLACE_SHIFT_TYPES).toContain("night");
    expect(MARKETPLACE_SORT_VALUES).toEqual(["relevance", "recently_active"]);
  });
});
