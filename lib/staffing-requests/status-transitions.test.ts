import { describe, expect, it } from "vitest";
import { canTransitionStaffingRequestStatus } from "@/lib/staffing-requests/status-transitions";

describe("status transitions", () => {
  it("REQ-UT-020: draft → open allowed", () => {
    expect(canTransitionStaffingRequestStatus("draft", "open")).toBe(true);
  });

  it("REQ-UT-021: open → matching allowed", () => {
    expect(canTransitionStaffingRequestStatus("open", "matching")).toBe(true);
  });

  it("REQ-UT-022: completed → open denied", () => {
    expect(canTransitionStaffingRequestStatus("completed", "open")).toBe(false);
  });

  it("REQ-UT-023: cancelled → matching denied", () => {
    expect(canTransitionStaffingRequestStatus("cancelled", "matching")).toBe(false);
  });

  it("REQ-UT-024: open → cancelled allowed", () => {
    expect(canTransitionStaffingRequestStatus("open", "cancelled")).toBe(true);
  });
});
