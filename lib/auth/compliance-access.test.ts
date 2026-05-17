import { describe, expect, it } from "vitest";
import {
  canManageCompliance,
  canViewCompliance,
} from "./compliance-access-rules";

describe("compliance access rules", () => {
  it("COMP-UT-020: compliance_manager can manage", () => {
    expect(canManageCompliance("compliance_manager")).toBe(true);
    expect(canViewCompliance("compliance_manager")).toBe(true);
  });

  it("COMP-UT-021: recruiter cannot manage compliance", () => {
    expect(canManageCompliance("recruiter")).toBe(false);
    expect(canViewCompliance("recruiter")).toBe(false);
  });

  it("COMP-UT-022: coordinator cannot view compliance", () => {
    expect(canViewCompliance("staffing_coordinator")).toBe(false);
  });

  it("agency_owner can view compliance", () => {
    expect(canViewCompliance("agency_owner")).toBe(true);
  });
});
