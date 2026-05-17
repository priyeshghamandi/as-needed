export type AssignmentStatus =
  | "invited"
  | "accepted"
  | "declined"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

const COORDINATOR_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  invited: ["cancelled"],
  accepted: ["confirmed", "cancelled"],
  declined: [],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["completed", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

const PROVIDER_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  invited: ["accepted", "declined"],
  accepted: [],
  declined: [],
  confirmed: [],
  checked_in: [],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function canCoordinatorTransitionAssignment(from: string, to: string): boolean {
  const allowed = COORDINATOR_TRANSITIONS[from as AssignmentStatus];
  if (!allowed) return false;
  return allowed.includes(to as AssignmentStatus);
}

export function canProviderTransitionAssignment(from: string, to: string): boolean {
  const allowed = PROVIDER_TRANSITIONS[from as AssignmentStatus];
  if (!allowed) return false;
  return allowed.includes(to as AssignmentStatus);
}
