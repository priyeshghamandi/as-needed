import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";

export type ShiftFillResult = {
  filledCount: number;
  requiredCount: number;
  suggestedStatus: ShiftStatusSuggestion;
};

export type ShiftStatusSuggestion =
  | "open"
  | "matching"
  | "partially_filled"
  | "confirmed";

export function countFilledShiftAssignments(
  assignments: { status: string }[],
): number {
  return assignments.filter((a) =>
    (FILLED_ASSIGNMENT_STATUSES as readonly string[]).includes(a.status),
  ).length;
}

export function suggestShiftStatusFromFill(
  requiredCount: number,
  filledCount: number,
  currentStatus: string,
): ShiftStatusSuggestion {
  const required = Math.max(1, requiredCount);
  const filled = Math.max(0, filledCount);

  if (filled >= required) return "confirmed";
  if (filled > 0) return "partially_filled";
  if (currentStatus === "matching") return "matching";
  return "open";
}

export function computeShiftFill(
  requiredCount: number,
  assignments: { status: string }[],
  currentStatus: string,
): ShiftFillResult {
  const filledCount = countFilledShiftAssignments(assignments);
  return {
    filledCount,
    requiredCount: Math.max(1, requiredCount),
    suggestedStatus: suggestShiftStatusFromFill(requiredCount, filledCount, currentStatus),
  };
}
