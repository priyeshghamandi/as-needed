import { Badge } from "@/components/primitives";
import {
  ROUTING_STATUS_LABELS,
  ROUTING_STATUS_TONES,
  type StaffingRequestRoutingStatus,
} from "@/lib/ui/routing-status";

export function RoutingStatusBadge({
  status,
  overdue,
}: {
  status: StaffingRequestRoutingStatus;
  overdue?: boolean;
}) {
  const tone = overdue && status === "routed" ? "amber" : ROUTING_STATUS_TONES[status];
  const label =
    overdue && status === "routed"
      ? `${ROUTING_STATUS_LABELS[status]} · overdue`
      : ROUTING_STATUS_LABELS[status];

  return (
    <Badge tone={tone} className="font-mono text-[11px]">
      {label}
    </Badge>
  );
}
