import { describe, expect, it } from "vitest";
import { canViewStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";

describe("GET /api/staffing-requests/routed", () => {
  it("RTR-API-001: coordinators can view routed queue", () => {
    expect(canViewStaffingRequests("staffing_coordinator")).toBe(true);
  });

  it("facility users cannot view routed queue via agency roles", () => {
    expect(canViewStaffingRequests("facility_user")).toBe(false);
  });
});
