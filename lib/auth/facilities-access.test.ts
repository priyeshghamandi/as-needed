import { describe, expect, it } from "vitest";
import {
  canManageFacilities,
  canViewFacilities,
  FACILITIES_WRITE_ROLES,
  FACILITIES_VIEW_ROLES,
} from "./facilities-access-rules";

describe("facilities access", () => {
  it("FAC-UT-020 / FAC-AUTH-01: recruiter cannot manage facilities", () => {
    expect(canManageFacilities("recruiter")).toBe(false);
  });

  it("FAC-UT-021 / FAC-AUTH-02: coordinator can manage facilities", () => {
    expect(canManageFacilities("staffing_coordinator")).toBe(true);
  });

  it("FAC-AUTH-04: compliance manager cannot manage facilities", () => {
    expect(canManageFacilities("compliance_manager")).toBe(false);
  });

  it("recruiter can view facilities", () => {
    expect(canViewFacilities("recruiter")).toBe(true);
  });

  it("write roles are subset of view roles", () => {
    for (const role of FACILITIES_WRITE_ROLES) {
      expect(FACILITIES_VIEW_ROLES).toContain(role);
    }
  });
});
