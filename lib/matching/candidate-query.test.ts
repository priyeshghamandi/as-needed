import { describe, expect, it } from "vitest";
import { sortCandidates } from "@/lib/matching/filters";
import type { MatchCandidateRow } from "@/lib/matching/types";

function row(
  id: string,
  score: number,
  miles: number | null,
): MatchCandidateRow {
  return {
    id,
    firstName: id,
    lastName: "Test",
    role: "rn",
    specialty: null,
    city: null,
    state: null,
    availabilityStatus: "available",
    reliabilityScore: score,
    distanceMiles: miles,
    withinServiceArea: true,
    assignmentStatus: null,
    assignmentId: null,
    complianceWarnings: [],
    meetsCredentials: true,
  };
}

describe("candidate sort", () => {
  it("MATCH-UT-010: sort by reliability desc", () => {
    const sorted = sortCandidates([row("a", 50, 1), row("b", 90, 1)]);
    expect(sorted[0]?.id).toBe("b");
  });

  it("MATCH-UT-011: distance sort tie-break", () => {
    const sorted = sortCandidates([row("far", 80, 20), row("near", 80, 2)]);
    expect(sorted[0]?.id).toBe("near");
  });
});
