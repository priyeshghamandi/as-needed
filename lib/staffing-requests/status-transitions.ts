import type { StaffingRequestStatus } from "@/lib/ui/status-colors";

const ALLOWED_TRANSITIONS: Record<StaffingRequestStatus, StaffingRequestStatus[]> = {
  draft: ["open"],
  open: ["matching", "cancelled", "at_risk"],
  matching: ["cancelled", "at_risk", "partially_filled", "confirmed"],
  partially_filled: ["cancelled", "at_risk", "matching", "confirmed"],
  at_risk: ["cancelled", "matching", "partially_filled", "confirmed"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionStaffingRequestStatus(
  from: string,
  to: string,
): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as StaffingRequestStatus];
  if (!allowed) return false;
  return allowed.includes(to as StaffingRequestStatus);
}

export function assertTransitionAllowed(from: string, to: string): void {
  if (!canTransitionStaffingRequestStatus(from, to)) {
    throw new Error(`Cannot transition staffing request from ${from} to ${to}.`);
  }
}
