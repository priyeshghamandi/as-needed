import { describe, expect, it } from "vitest";
import { canManageShifts, canViewShifts } from "@/lib/auth/shifts-access-rules";

describe("shifts permissions", () => {
  it("SHIFT-UT-031 / SHIFT-AUTH-01: recruiter cannot manage", () => {
    expect(canManageShifts("recruiter")).toBe(false);
  });

  it("SHIFT-UT-032 / SHIFT-AUTH-02: coordinator can manage", () => {
    expect(canManageShifts("staffing_coordinator")).toBe(true);
  });

  it("recruiter can view shifts", () => {
    expect(canViewShifts("recruiter")).toBe(true);
  });
});
