export type FulfillmentTimelineStepId =
  | "submitted"
  | "matching"
  | "contacted"
  | "assigned"
  | "confirmed"
  | "active"
  | "completed";

export type FulfillmentTimelineStep = {
  id: FulfillmentTimelineStepId;
  label: string;
  complete: boolean;
  current: boolean;
};

export type FulfillmentTimelineInput = {
  requestStatus: string;
  hasAssignments: boolean;
  hasAcceptedAssignment: boolean;
  hasActiveShift: boolean;
};

const STEPS: { id: FulfillmentTimelineStepId; label: string }[] = [
  { id: "submitted", label: "Request submitted" },
  { id: "matching", label: "Matching started" },
  { id: "contacted", label: "Professionals contacted" },
  { id: "assigned", label: "Shift assigned" },
  { id: "confirmed", label: "Confirmed" },
  { id: "active", label: "Shift active" },
  { id: "completed", label: "Completed" },
];

const MATCHING_STATUSES = new Set([
  "matching",
  "partially_filled",
  "confirmed",
  "completed",
  "at_risk",
]);

const CONTACTED_STATUSES = new Set(["partially_filled", "confirmed", "completed", "at_risk"]);

export function deriveFulfillmentTimeline(
  input: FulfillmentTimelineInput,
): FulfillmentTimelineStep[] {
  const flags: Record<FulfillmentTimelineStepId, boolean> = {
    submitted: true,
    matching: MATCHING_STATUSES.has(input.requestStatus),
    contacted:
      CONTACTED_STATUSES.has(input.requestStatus) || input.hasAssignments,
    assigned: input.hasAcceptedAssignment,
    confirmed: input.requestStatus === "confirmed" || input.requestStatus === "completed",
    active: input.hasActiveShift,
    completed: input.requestStatus === "completed",
  };

  const firstIncomplete = STEPS.findIndex((s) => !flags[s.id]);

  return STEPS.map((step, index) => ({
    ...step,
    complete: flags[step.id],
    current: firstIncomplete === -1 ? index === STEPS.length - 1 : index === firstIncomplete,
  }));
}
