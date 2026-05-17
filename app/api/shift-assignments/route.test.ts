import { describe, expect, it } from "vitest";
import {
  canCoordinatorTransitionAssignment,
  canProviderTransitionAssignment,
} from "@/lib/assignments/status-transitions";
import { canManageAssignments } from "@/lib/auth/assignments-access-rules";

describe("shift assignment API rules", () => {
  it("MATCH-UT-050: recruiter blocked from manage", () => {
    expect(canManageAssignments("recruiter")).toBe(false);
  });

  it("MATCH-UT-051: coordinator can manage", () => {
    expect(canManageAssignments("staffing_coordinator")).toBe(true);
  });

  it("MATCH-UT-052: provider accept transition allowed", () => {
    expect(canProviderTransitionAssignment("invited", "accepted")).toBe(true);
  });

  it("MATCH-UT-053: coordinator confirm transition allowed", () => {
    expect(canCoordinatorTransitionAssignment("accepted", "confirmed")).toBe(true);
  });
});
