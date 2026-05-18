import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";
import { assertFulfillmentTransition } from "@/lib/fulfillment/fulfillment-status";

export type SuggestedAlternativeStatus =
  | "pending_customer"
  | "approved"
  | "rejected"
  | "withdrawn";

export function canProposeAlternative(
  fulfillmentStatus: StaffingRequestFulfillmentStatus | null | undefined,
): boolean {
  return (
    fulfillmentStatus === "agency_declined" ||
    fulfillmentStatus === "pending_agency_review" ||
    !fulfillmentStatus
  );
}

export function fulfillmentStatusAfterWithdrawAlternative(params: {
  hasAnyConfirmedReview: boolean;
  allSelectionsReviewed: boolean;
  allDeclined: boolean;
}): StaffingRequestFulfillmentStatus {
  if (params.hasAnyConfirmedReview) {
    return "agency_confirmed";
  }
  if (params.allSelectionsReviewed && params.allDeclined) {
    return "agency_declined";
  }
  return "pending_agency_review";
}

export function assertAlternativeFulfillmentTransition(
  from: StaffingRequestFulfillmentStatus | null | undefined,
  to: StaffingRequestFulfillmentStatus,
): { ok: true } | { ok: false; message: string } {
  return assertFulfillmentTransition(from, to);
}

export function hasPendingAlternativeConstraint(
  existing: { originalProfessionalId: string; status: SuggestedAlternativeStatus }[],
  originalProfessionalId: string,
): boolean {
  return existing.some(
    (row) =>
      row.originalProfessionalId === originalProfessionalId &&
      row.status === "pending_customer",
  );
}
