import { describe, expect, it } from "vitest";
import {
  canManageStaffingRequests,
  canViewStaffingRequests,
} from "@/lib/auth/staffing-requests-access-rules";

describe("staffing requests permissions", () => {
  it("REQ-UT-040: coordinator can manage", () => {
    expect(canManageStaffingRequests("staffing_coordinator")).toBe(true);
  });

  it("REQ-UT-041: recruiter cannot manage", () => {
    expect(canManageStaffingRequests("recruiter")).toBe(false);
  });

  it("REQ-UT-042: compliance cannot manage", () => {
    expect(canManageStaffingRequests("compliance_manager")).toBe(false);
  });

  it("recruiter can view", () => {
    expect(canViewStaffingRequests("recruiter")).toBe(true);
  });
});
