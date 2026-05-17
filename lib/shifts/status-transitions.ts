export type ShiftStatus =
  | "open"
  | "matching"
  | "partially_filled"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

const ALLOWED_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  open: ["matching", "partially_filled", "confirmed", "cancelled", "active"],
  matching: ["partially_filled", "confirmed", "cancelled", "active"],
  partially_filled: ["matching", "confirmed", "cancelled", "active"],
  confirmed: ["active", "completed", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionShiftStatus(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as ShiftStatus];
  if (!allowed) return false;
  return allowed.includes(to as ShiftStatus);
}

export function assertShiftTransitionAllowed(from: string, to: string): void {
  if (!canTransitionShiftStatus(from, to)) {
    throw new Error(`Cannot transition shift from ${from} to ${to}.`);
  }
}
