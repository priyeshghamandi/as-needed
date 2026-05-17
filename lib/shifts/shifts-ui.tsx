import { Badge } from "@/components/primitives";

export type ShiftStatus =
  | "open"
  | "matching"
  | "partially_filled"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  open: "Open",
  matching: "Matching",
  partially_filled: "Partially filled",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SHIFT_STATUS_TONES: Record<
  ShiftStatus,
  "neutral" | "teal" | "amber" | "rose" | "ink"
> = {
  open: "teal",
  matching: "teal",
  partially_filled: "amber",
  confirmed: "teal",
  active: "ink",
  completed: "neutral",
  cancelled: "neutral",
};

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

export function ShiftStatusBadge({ status }: { status: string }) {
  const key = status as ShiftStatus;
  return (
    <Badge tone={SHIFT_STATUS_TONES[key] ?? "neutral"}>
      {SHIFT_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function shortShiftId(id: string): string {
  return id.slice(0, 8);
}
