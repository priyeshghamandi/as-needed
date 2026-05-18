export type StaffingRequestFulfillmentStatus =
  | "pending_agency_review"
  | "agency_confirmed"
  | "agency_declined"
  | "alternative_proposed"
  | "customer_approved"
  | "customer_rejected"
  | "cancelled";

export const FULFILLMENT_STATUS_LABELS: Record<StaffingRequestFulfillmentStatus, string> = {
  pending_agency_review: "Pending agency review",
  agency_confirmed: "Awaiting your approval",
  agency_declined: "Agency declined",
  alternative_proposed: "Alternative proposed",
  customer_approved: "Approved",
  customer_rejected: "Rejected",
  cancelled: "Cancelled",
};

export const FULFILLMENT_STATUS_TONES: Record<
  StaffingRequestFulfillmentStatus,
  "neutral" | "teal" | "amber" | "rose"
> = {
  pending_agency_review: "amber",
  agency_confirmed: "teal",
  agency_declined: "rose",
  alternative_proposed: "amber",
  customer_approved: "teal",
  customer_rejected: "rose",
  cancelled: "neutral",
};
