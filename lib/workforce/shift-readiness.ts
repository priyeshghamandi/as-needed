export type ComplianceStatus = "clear" | "attention" | "blocked";
export type ShiftReadiness = "ready" | "not_ready";

export type CredentialStatusInput = {
  status: string;
};

export function deriveComplianceStatus(
  credentials: CredentialStatusInput[],
): ComplianceStatus {
  let blocked = false;
  let attention = false;
  for (const c of credentials) {
    if (c.status === "expired" || c.status === "rejected") blocked = true;
    else if (c.status === "expiring_soon" || c.status === "pending_review") attention = true;
  }
  if (blocked) return "blocked";
  if (attention) return "attention";
  return "clear";
}

export function computeShiftReadiness(
  availabilityStatus: string,
  complianceStatus: ComplianceStatus,
): ShiftReadiness {
  if (availabilityStatus === "on_shift") return "not_ready";
  if (availabilityStatus === "available" && complianceStatus === "clear") return "ready";
  return "not_ready";
}
