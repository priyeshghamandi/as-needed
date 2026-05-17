import { describe, expect, it } from "vitest";
import {
  canManageAssignments,
  canViewMatchPage,
} from "@/lib/auth/assignments-access-rules";

describe("assignment permissions", () => {
  it("MATCH-UT-040: coordinator can invite", () => {
    expect(canManageAssignments("staffing_coordinator")).toBe(true);
  });

  it("MATCH-UT-041: recruiter cannot invite", () => {
    expect(canManageAssignments("recruiter")).toBe(false);
  });

  it("MATCH-UT-042: recruiter can view match page", () => {
    expect(canViewMatchPage("recruiter")).toBe(true);
  });
});
