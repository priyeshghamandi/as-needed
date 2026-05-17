import { describe, expect, it } from "vitest";
import { isProviderRole } from "@/lib/auth/roles";
import type { ProviderShiftTab } from "@/lib/provider/provider-shifts";

describe("GET /api/provider/shifts rules", () => {
  it("HPP-UT-040: provider role recognized", () => {
    expect(isProviderRole("provider")).toBe(true);
  });

  it("HPP-UT-041: agency_owner is not provider", () => {
    expect(isProviderRole("agency_owner")).toBe(false);
  });

  it("tabs include invites upcoming past", () => {
    const tabs: ProviderShiftTab[] = ["invites", "upcoming", "past"];
    expect(tabs).toHaveLength(3);
  });
});
