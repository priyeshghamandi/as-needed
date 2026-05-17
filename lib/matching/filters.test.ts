import { describe, expect, it } from "vitest";
import {
  applyCandidateFilters,
  isExcludedByAssignment,
  matchesAvailableOnly,
  matchesRole,
} from "@/lib/matching/filters";
import type { MatchCandidateRow } from "@/lib/matching/types";

const base: MatchCandidateRow = {
  id: "1",
  firstName: "A",
  lastName: "B",
  role: "rn",
  specialty: null,
  city: "SF",
  state: "CA",
  availabilityStatus: "available",
  reliabilityScore: 100,
  distanceMiles: 1,
  withinServiceArea: true,
  assignmentStatus: null,
  assignmentId: null,
  complianceWarnings: [],
  meetsCredentials: true,
};

describe("matching filters", () => {
  it("MATCH-UT-001: role filter excludes wrong role", () => {
    expect(matchesRole({ ...base, role: "cna" }, "rn")).toBe(false);
    expect(matchesRole(base, "rn")).toBe(true);
  });

  it("MATCH-UT-002: available filter", () => {
    expect(matchesAvailableOnly({ ...base, availabilityStatus: "unavailable" }, true)).toBe(
      false,
    );
    expect(matchesAvailableOnly(base, true)).toBe(true);
  });

  it("MATCH-UT-003: exclude already invited", () => {
    expect(isExcludedByAssignment({ ...base, assignmentStatus: "invited" })).toBe(true);
    expect(isExcludedByAssignment(base)).toBe(false);
  });

  it("MATCH-UT-004: credentials filter partial match", () => {
    const filtered = applyCandidateFilters(
      [
        { ...base, id: "1", meetsCredentials: false },
        { ...base, id: "2", meetsCredentials: true },
      ],
      { roleNeeded: "rn", hasRequiredCredentials: true },
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("2");
  });
});
