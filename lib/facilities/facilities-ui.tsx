import { Badge } from "@/components/primitives";
import { facilityTypeLabel } from "@/lib/facilities/type-labels";
import type { PortalAccessStatus } from "@/lib/facilities/queries";

export { facilityTypeLabel };

export function formatRelativeTime(isoString: string | Date): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function PortalAccessBadge({ status }: { status: PortalAccessStatus }) {
  if (status === "active") {
    return <Badge tone="green">Active</Badge>;
  }
  if (status === "invited") {
    return <Badge tone="amber">Invite pending</Badge>;
  }
  return <Badge tone="ink">Not invited</Badge>;
}
