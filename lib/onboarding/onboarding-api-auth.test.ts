/**
 * ONB-UT-060–063: API auth rules (handlers use requireAuthContext + assertCanManageOnboarding).
 */
import { describe, expect, it } from "vitest";
import { canAccessPath } from "@/lib/auth/path-access";
import type { ScopedRole } from "@/lib/auth/roles";

function role(role: ScopedRole["role"], agencyId = "agency-a"): ScopedRole[] {
  return [{ role, agencyId }];
}

describe("onboarding API access", () => {
  it("ONB-UT-060: no roles cannot access /onboarding path", () => {
    expect(canAccessPath("/onboarding", [])).toBe(false);
  });

  it("ONB-UT-061: provider cannot access /onboarding", () => {
    expect(canAccessPath("/onboarding", role("provider"))).toBe(false);
  });

  it("ONB-UT-062: agency owner can access /onboarding", () => {
    expect(canAccessPath("/onboarding", role("agency_owner"))).toBe(true);
  });

  it("ONB-UT-063: facility user cannot access /onboarding", () => {
    expect(canAccessPath("/onboarding", role("facility_user"))).toBe(false);
  });
});
