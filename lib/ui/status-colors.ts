export type StaffingRequestStatus =
  | "draft"
  | "open"
  | "matching"
  | "partially_filled"
  | "confirmed"
  | "at_risk"
  | "completed"
  | "cancelled";

export const STAFFING_REQUEST_STATUS_LABELS: Record<StaffingRequestStatus, string> = {
  draft: "Draft",
  open: "Open",
  matching: "Matching",
  partially_filled: "Partially filled",
  confirmed: "Confirmed",
  at_risk: "At risk",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STAFFING_REQUEST_STATUS_TONES: Record<
  StaffingRequestStatus,
  "neutral" | "teal" | "amber" | "rose" | "ink"
> = {
  draft: "neutral",
  open: "teal",
  matching: "teal",
  partially_filled: "amber",
  confirmed: "teal",
  at_risk: "rose",
  completed: "ink",
  cancelled: "neutral",
};

export const PRIORITY_LABELS: Record<string, string> = {
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_TONES: Record<string, "neutral" | "amber" | "rose"> = {
  normal: "neutral",
  high: "amber",
  urgent: "rose",
};
