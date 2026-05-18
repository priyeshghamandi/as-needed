import { describe, expect, it } from "vitest";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";

describe("POST /api/staffing-requests/[id]/alternatives", () => {
  it("coordinators can propose suggested alternatives", () => {
    expect(canManageStaffingRequests("staffing_coordinator")).toBe(true);
  });

  it("recruiters cannot propose suggested alternatives", () => {
    expect(canManageStaffingRequests("recruiter")).toBe(false);
  });
});
