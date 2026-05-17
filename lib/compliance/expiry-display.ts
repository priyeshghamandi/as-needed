export type ExpiryDisplayBadge = "expiring_soon" | null;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysUntilExpiry(expiresAt: Date | string | null): number | null {
  if (!expiresAt) return null;
  const end = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  return Math.ceil((endDay.getTime() - today.getTime()) / MS_PER_DAY);
}

/** COMP-040: display-only expiring badge when verified and within 30 days. */
export function computeExpiryDisplayBadge(
  status: string,
  expiresAt: Date | string | null,
): ExpiryDisplayBadge {
  if (status !== "verified" || !expiresAt) return null;
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return null;
  if (days <= 30) return "expiring_soon";
  return null;
}

export function formatExpiryDate(expiresAt: Date | string | null): string {
  if (!expiresAt) return "—";
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
