import { Badge } from "@/components/primitives";
import { WORKFORCE_ROLE_LABELS } from "@/lib/validations/workforce-professional";
import type { ComplianceStatus, ShiftReadiness } from "@/lib/workforce/shift-readiness";

export function roleLabel(role: string): string {
  return WORKFORCE_ROLE_LABELS[role as keyof typeof WORKFORCE_ROLE_LABELS] ?? role.toUpperCase();
}

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  if (status === "blocked") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-700">
        Blocked
      </span>
    );
  }
  if (status === "attention") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700">
        Attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700">
      Clear
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    available: "Available",
    unavailable: "Unavailable",
    on_shift: "On shift",
    pending_confirmation: "Pending",
  };
  const tone =
    status === "available"
      ? "green"
      : status === "on_shift"
        ? "teal"
        : status === "pending_confirmation"
          ? "amber"
          : "ink";
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>;
}

export function ShiftReadinessBadge({ readiness }: { readiness: ShiftReadiness }) {
  return (
    <Badge tone={readiness === "ready" ? "green" : "ink"}>
      {readiness === "ready" ? "Ready" : "Not ready"}
    </Badge>
  );
}

export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "No shifts yet";
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
