import { Badge } from "@/components/primitives";

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  invited: "Invited",
  accepted: "Accepted",
  declined: "Declined",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export const ASSIGNMENT_STATUS_TONES: Record<
  string,
  "neutral" | "teal" | "amber" | "rose" | "ink"
> = {
  invited: "teal",
  accepted: "teal",
  declined: "neutral",
  confirmed: "ink",
  checked_in: "ink",
  completed: "neutral",
  cancelled: "neutral",
  no_show: "rose",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available",
  unavailable: "Unavailable",
  on_assignment: "On assignment",
};

export function AssignmentStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={ASSIGNMENT_STATUS_TONES[status] ?? "neutral"}>
      {ASSIGNMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function AvailabilityBadge({ status }: { status: string }) {
  const tone = status === "available" ? "teal" : status === "on_assignment" ? "amber" : "neutral";
  return (
    <Badge tone={tone}>{AVAILABILITY_LABELS[status] ?? status}</Badge>
  );
}
