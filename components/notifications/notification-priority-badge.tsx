import { Badge } from "@/components/primitives";
import type { NotificationPriority } from "@/lib/notifications/types";

const PRIORITY_TONES: Record<NotificationPriority, string> = {
  info: "neutral",
  important: "teal",
  urgent: "amber",
  critical: "rose",
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  info: "Info",
  important: "Important",
  urgent: "Urgent",
  critical: "Critical",
};

export function NotificationPriorityBadge({
  priority,
}: {
  priority: NotificationPriority | string;
}) {
  const key = priority as NotificationPriority;
  return (
    <Badge tone={PRIORITY_TONES[key] ?? "neutral"}>
      {PRIORITY_LABELS[key] ?? priority}
    </Badge>
  );
}
