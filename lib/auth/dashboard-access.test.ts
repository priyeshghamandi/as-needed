import { describe, expect, it } from "vitest";
import { canAccessPath } from "./path-access";
import type { ScopedRole } from "./roles";

/** OPS-UT-020–023 / OPS-AUTH: dashboard access via middleware path rules (no REST API). */

function role(role: ScopedRole["role"], agencyId = "agency-a"): ScopedRole[] {
  return [{ role, agencyId }];
}

describe("dashboard path access", () => {
  it("OPS-UT-020: no roles cannot access /dashboard", () => {
    expect(canAccessPath("/dashboard", [])).toBe(false);
  });

  it("OPS-UT-021 / OPS-AUTH-01: provider cannot access /dashboard", () => {
    expect(canAccessPath("/dashboard", role("provider"))).toBe(false);
  });

  it("OPS-UT-022: agency owner can access /dashboard", () => {
    expect(canAccessPath("/dashboard", role("agency_owner"))).toBe(true);
  });

  it("OPS-AUTH-02: agency owner cannot access facility paths", () => {
    expect(canAccessPath("/facility/dashboard", role("agency_owner"))).toBe(false);
  });

  it("OPS-UT-023: facility user cannot access agency dashboard", () => {
    expect(canAccessPath("/dashboard", role("facility_user"))).toBe(false);
  });
});
