import { describe, expect, it } from "vitest";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";

describe("POST /api/staffing-requests/[id]/fulfillment/confirm", () => {
  it("coordinators can confirm fulfillment", () => {
    expect(canManageStaffingRequests("staffing_coordinator")).toBe(true);
  });

  it("recruiters cannot confirm fulfillment", () => {
    expect(canManageStaffingRequests("recruiter")).toBe(false);
  });
});
