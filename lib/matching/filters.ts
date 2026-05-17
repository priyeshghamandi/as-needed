import type { MatchCandidateRow } from "@/lib/matching/types";

export const BLOCKING_ASSIGNMENT_STATUSES = [
  "invited",
  "accepted",
  "confirmed",
  "checked_in",
] as const;

export type CandidateFilterInput = {
  roleNeeded: string;
  availableOnly?: boolean;
  withinServiceArea?: boolean;
  hasRequiredCredentials?: boolean;
  requiredCredentials?: string[] | null;
};

export function matchesRole(candidate: MatchCandidateRow, roleNeeded: string): boolean {
  return candidate.role === roleNeeded;
}

export function matchesAvailableOnly(
  candidate: MatchCandidateRow,
  availableOnly: boolean,
): boolean {
  if (!availableOnly) return true;
  return candidate.availabilityStatus === "available";
}

export function matchesServiceArea(
  candidate: MatchCandidateRow,
  withinServiceArea: boolean,
): boolean {
  if (!withinServiceArea) return true;
  return candidate.withinServiceArea;
}

export function isExcludedByAssignment(candidate: MatchCandidateRow): boolean {
  if (!candidate.assignmentStatus) return false;
  return (BLOCKING_ASSIGNMENT_STATUSES as readonly string[]).includes(
    candidate.assignmentStatus,
  );
}

export function applyCandidateFilters(
  candidates: MatchCandidateRow[],
  filters: CandidateFilterInput,
): MatchCandidateRow[] {
  return candidates.filter((candidate) => {
    if (!matchesRole(candidate, filters.roleNeeded)) return false;
    if (!matchesAvailableOnly(candidate, filters.availableOnly ?? false)) return false;
    if (!matchesServiceArea(candidate, filters.withinServiceArea ?? false)) return false;
    if (isExcludedByAssignment(candidate)) return false;
    if (filters.hasRequiredCredentials && !candidate.meetsCredentials) return false;
    return true;
  });
}

export function sortCandidates(candidates: MatchCandidateRow[]): MatchCandidateRow[] {
  return [...candidates].sort((a, b) => {
    const scoreDiff = (b.reliabilityScore ?? 0) - (a.reliabilityScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const distA = a.distanceMiles ?? Number.POSITIVE_INFINITY;
    const distB = b.distanceMiles ?? Number.POSITIVE_INFINITY;
    return distA - distB;
  });
}
