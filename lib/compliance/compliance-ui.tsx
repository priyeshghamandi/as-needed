import { Badge } from "@/components/primitives";
import type { CredentialStatus } from "@/lib/compliance/credential-transitions";

export const CREDENTIAL_STATUS_LABELS: Record<CredentialStatus, string> = {
  pending_review: "Pending review",
  verified: "Verified",
  expiring_soon: "Expiring soon",
  expired: "Expired",
  rejected: "Rejected",
};

const STATUS_TONES: Record<CredentialStatus, string> = {
  pending_review: "neutral",
  verified: "green",
  expiring_soon: "amber",
  expired: "red",
  rejected: "rose",
};

export function CredentialStatusBadge({
  status,
  displayBadge,
}: {
  status: string;
  displayBadge?: string | null;
}) {
  const key = status as CredentialStatus;
  const label = CREDENTIAL_STATUS_LABELS[key] ?? status;
  const tone = STATUS_TONES[key] ?? "neutral";

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <Badge tone={tone}>{label}</Badge>
      {displayBadge === "expiring_soon" && status === "verified" ? (
        <Badge tone="amber">Expiring soon</Badge>
      ) : null}
    </span>
  );
}

export function formatVerifiedAt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
