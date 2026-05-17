import { describe, expect, it } from "vitest";
import {
  assertCanManageAgencySettings,
  canManageAgencySettings,
} from "./assert-can-manage-settings";

describe("assertCanManageAgencySettings", () => {
  it("SET-UT-030: agency_owner allowed", () => {
    expect(canManageAgencySettings("agency_owner", "agency-id")).toBe(true);
  });

  it("SET-UT-031: staffing_coordinator forbidden", () => {
    expect(canManageAgencySettings("staffing_coordinator", "agency-id")).toBe(false);
    expect(() =>
      assertCanManageAgencySettings("staffing_coordinator", "agency-id"),
    ).toThrow(/permission/i);
  });

  it("SET-UT-032: missing agencyId forbidden", () => {
    expect(canManageAgencySettings("agency_owner", null)).toBe(false);
  });
});
