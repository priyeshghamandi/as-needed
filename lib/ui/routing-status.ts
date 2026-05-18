export type StaffingRequestRoutingStatus = "pending" | "routed" | "acknowledged" | "closed";

export const ROUTING_STATUS_LABELS: Record<StaffingRequestRoutingStatus, string> = {
  pending: "Pending",
  routed: "Routed",
  acknowledged: "Acknowledged",
  closed: "Closed",
};

export const ROUTING_STATUS_TONES: Record<
  StaffingRequestRoutingStatus,
  "neutral" | "teal" | "amber" | "ink"
> = {
  pending: "neutral",
  routed: "amber",
  acknowledged: "teal",
  closed: "ink",
};
