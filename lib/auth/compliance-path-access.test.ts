import { describe, expect, it } from "vitest";
import { canAccessPath } from "./path-access";
import type { ScopedRole } from "./roles";

function role(role: ScopedRole["role"], agencyId = "agency-a"): ScopedRole[] {
  return [{ role, agencyId }];
}

describe("compliance path access", () => {
  it("COMP-E2E-004: coordinator denied /compliance", () => {
    expect(canAccessPath("/compliance", role("staffing_coordinator"))).toBe(false);
  });

  it("COMP-E2E-002: compliance manager allowed", () => {
    expect(canAccessPath("/compliance", role("compliance_manager"))).toBe(true);
  });

  it("COMP-E2E-003: agency owner allowed", () => {
    expect(canAccessPath("/compliance", role("agency_owner"))).toBe(true);
  });

  it("COMP-E2E-005: provider denied agency compliance path", () => {
    expect(
      canAccessPath("/compliance", [{ role: "provider", agencyId: null }]),
    ).toBe(false);
  });

  it("recruiter denied", () => {
    expect(canAccessPath("/compliance", role("recruiter"))).toBe(false);
  });
});
