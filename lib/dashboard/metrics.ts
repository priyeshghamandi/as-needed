export const ACTIVE_REQUEST_STATUSES = [
  "open",
  "matching",
  "partially_filled",
  "at_risk",
] as const;

export const FILL_RATE_REQUEST_STATUSES = [
  ...ACTIVE_REQUEST_STATUSES,
  "confirmed",
] as const;

export const FILLED_ASSIGNMENT_STATUSES = [
  "accepted",
  "confirmed",
  "checked_in",
  "completed",
] as const;

export const COMPLIANCE_ALERT_STATUSES = [
  "expiring_soon",
  "expired",
  "pending_review",
] as const;

export const URGENT_SHIFT_EXCLUDED_STATUSES = [
  "completed",
  "cancelled",
  "confirmed",
  "active",
] as const;

export interface FillRateInput {
  professionalsRequired: number;
  filledCount: number;
}

export interface RequestStatusInput {
  status: string;
}

export interface ProfessionalAvailabilityInput {
  isActive: boolean;
  availabilityStatus: string;
}

export interface ShiftUrgencyInput {
  status: string;
  startAt: Date;
  now?: Date;
}

export interface CredentialAlertInput {
  status: string;
}

export function countOpenRequests(requests: RequestStatusInput[]): number {
  return requests.filter((r) =>
    (ACTIVE_REQUEST_STATUSES as readonly string[]).includes(r.status),
  ).length;
}

export function countAvailableProfessionals(
  professionals: ProfessionalAvailabilityInput[],
): number {
  return professionals.filter(
    (p) => p.isActive && p.availabilityStatus === "available",
  ).length;
}

/** Shifts starting within the next 24h that are not completed/cancelled/confirmed/active. */
export function countUrgentShifts(
  shifts: ShiftUrgencyInput[],
  now: Date = new Date(),
): number {
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return shifts.filter((s) => {
    if ((URGENT_SHIFT_EXCLUDED_STATUSES as readonly string[]).includes(s.status)) {
      return false;
    }
    return s.startAt >= now && s.startAt < in24h;
  }).length;
}

export function countComplianceAlerts(credentials: CredentialAlertInput[]): number {
  return credentials.filter((c) =>
    (COMPLIANCE_ALERT_STATUSES as readonly string[]).includes(c.status),
  ).length;
}

export function computeFillRate(requests: FillRateInput[]): number {
  if (requests.length === 0) return 0;
  const requiredSlots = requests.reduce((sum, r) => sum + r.professionalsRequired, 0);
  if (requiredSlots === 0) return 0;
  const filledSlots = requests.reduce(
    (sum, r) => sum + Math.min(r.filledCount, r.professionalsRequired),
    0,
  );
  return Math.round((filledSlots / requiredSlots) * 100);
}
