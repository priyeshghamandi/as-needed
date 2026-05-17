import { describe, expect, it } from "vitest";
import { isAgencyRole, isFacilityRole, isProviderRole } from "@/lib/auth/roles";

describe("activity API access roles", () => {
  it("ACT-AUTH-01: provider is not agency role", () => {
    expect(isAgencyRole("provider")).toBe(false);
    expect(isProviderRole("provider")).toBe(true);
  });

  it("ACT-AUTH-02: facility_user is not agency role", () => {
    expect(isAgencyRole("facility_user")).toBe(false);
    expect(isFacilityRole("facility_user")).toBe(true);
  });

  it("coordinator is agency role", () => {
    expect(isAgencyRole("staffing_coordinator")).toBe(true);
  });
});
