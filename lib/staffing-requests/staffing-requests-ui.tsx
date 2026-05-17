import { Badge } from "@/components/primitives";
import {
  PRIORITY_LABELS,
  PRIORITY_TONES,
  STAFFING_REQUEST_STATUS_LABELS,
  STAFFING_REQUEST_STATUS_TONES,
  type StaffingRequestStatus,
} from "@/lib/ui/status-colors";
import { WORKFORCE_ROLE_LABELS } from "@/lib/validations/workforce-professional";

export function roleNeededLabel(role: string): string {
  return WORKFORCE_ROLE_LABELS[role as keyof typeof WORKFORCE_ROLE_LABELS] ?? role.toUpperCase();
}

export function StatusBadge({ status }: { status: string }) {
  const key = status as StaffingRequestStatus;
  return (
    <Badge tone={STAFFING_REQUEST_STATUS_TONES[key] ?? "neutral"}>
      {STAFFING_REQUEST_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge tone={PRIORITY_TONES[priority] ?? "neutral"}>
      {PRIORITY_LABELS[priority] ?? priority}
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
