import { describe, expect, it } from "vitest";
import { canAccessPath } from "@/lib/auth/path-access";
import type { ScopedRole } from "@/lib/auth/roles";

function role(role: ScopedRole["role"], agencyId: string | null = "agency-1"): ScopedRole[] {
  return [{ role, agencyId }];
}

describe("notifications path access", () => {
  it("NOTIF-E2E-002: agency coordinator can access", () => {
    expect(canAccessPath("/notifications", role("staffing_coordinator"))).toBe(true);
  });

  it("NOTIF-E2E-003: provider can access", () => {
    expect(canAccessPath("/notifications", role("provider", null))).toBe(true);
  });

  it("facility user can access", () => {
    expect(canAccessPath("/notifications", role("facility_user"))).toBe(true);
  });
});
