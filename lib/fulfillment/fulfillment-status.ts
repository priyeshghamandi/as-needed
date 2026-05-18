import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

const TERMINAL: StaffingRequestFulfillmentStatus[] = [
  "customer_approved",
  "customer_rejected",
  "cancelled",
];

export function isTerminalFulfillmentStatus(
  status: StaffingRequestFulfillmentStatus | null | undefined,
): boolean {
  if (!status) return false;
  return TERMINAL.includes(status);
}

export function canAgencyReviewFulfillment(
  status: StaffingRequestFulfillmentStatus | null | undefined,
): boolean {
  return status === "pending_agency_review" || status === null;
}

export function canCustomerApproveFulfillment(
  status: StaffingRequestFulfillmentStatus | null | undefined,
): boolean {
  return status === "agency_confirmed";
}

export function assertFulfillmentTransition(
  from: StaffingRequestFulfillmentStatus | null | undefined,
  to: StaffingRequestFulfillmentStatus,
): { ok: true } | { ok: false; message: string } {
  if (from === to) {
    return { ok: true };
  }

  if (isTerminalFulfillmentStatus(from)) {
    return {
      ok: false,
      message: `Cannot change fulfillment status from ${from}.`,
    };
  }

  const allowed: Partial<
    Record<StaffingRequestFulfillmentStatus | "null", StaffingRequestFulfillmentStatus[]>
  > = {
    null: ["pending_agency_review", "agency_confirmed", "agency_declined"],
    pending_agency_review: ["agency_confirmed", "agency_declined", "alternative_proposed"],
    agency_confirmed: ["customer_approved", "customer_rejected"],
    agency_declined: ["alternative_proposed", "cancelled"],
    alternative_proposed: [
      "customer_approved",
      "customer_rejected",
      "agency_declined",
      "pending_agency_review",
      "agency_confirmed",
    ],
  };

  const key = from ?? "null";
  const next = allowed[key] ?? [];
  if (!next.includes(to)) {
    return {
      ok: false,
      message: `Invalid fulfillment transition from ${from ?? "none"} to ${to}.`,
    };
  }

  return { ok: true };
}

export type AgencyFulfillmentAggregate = {
  selectionCount: number;
  reviewedCount: number;
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
};

export function deriveFulfillmentStatusFromAgencyReviews(
  aggregates: AgencyFulfillmentAggregate[],
  current: StaffingRequestFulfillmentStatus | null,
): StaffingRequestFulfillmentStatus | null {
  if (isTerminalFulfillmentStatus(current)) return current;

  const allReviewed = aggregates.every((a) => a.pendingCount === 0 && a.selectionCount > 0);
  if (!allReviewed) {
    return current ?? "pending_agency_review";
  }

  const anyConfirmed = aggregates.some((a) => a.confirmedCount > 0);
  if (anyConfirmed) {
    return "agency_confirmed";
  }

  return "agency_declined";
}
