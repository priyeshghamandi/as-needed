export function formatActivityRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

export function formatActivityAbsoluteTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function activityDetailsLine(metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null;

  const summary = metadata.summary;
  if (typeof summary === "string" && summary.trim()) {
    return summary.trim().slice(0, 200);
  }

  const fromStatus = metadata.fromStatus;
  const toStatus = metadata.toStatus;
  if (typeof fromStatus === "string" && typeof toStatus === "string") {
    return `${fromStatus} → ${toStatus}`;
  }

  return null;
}
