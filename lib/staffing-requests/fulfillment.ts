import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";

export { FILLED_ASSIGNMENT_STATUSES };

export type FulfillmentResult = {
  filledCount: number;
  professionalsRequired: number;
  progress: number;
  label: string;
  suggestedStatus: "open" | "partially_filled" | "confirmed";
};

export function computeFulfillment(
  professionalsRequired: number,
  filledCount: number,
): FulfillmentResult {
  const required = Math.max(1, professionalsRequired);
  const filled = Math.max(0, filledCount);
  const progress = Math.min(1, filled / required);
  let suggestedStatus: FulfillmentResult["suggestedStatus"] = "open";
  if (filled >= required) {
    suggestedStatus = "confirmed";
  } else if (filled > 0) {
    suggestedStatus = "partially_filled";
  }

  return {
    filledCount: filled,
    professionalsRequired: required,
    progress,
    label: `${filled} / ${required}`,
    suggestedStatus,
  };
}

export function countFilledAssignments(
  assignments: { status: string }[],
): number {
  return assignments.filter((a) =>
    (FILLED_ASSIGNMENT_STATUSES as readonly string[]).includes(a.status),
  ).length;
}
