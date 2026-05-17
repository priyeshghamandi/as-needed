export type ComplianceStatus = "clear" | "attention" | "blocked";

export interface CredentialStatusInput {
  status: string;
}

/** Row-level compliance aggregate for workforce table (PRD §8.4). */
export function aggregateComplianceStatus(
  credentials: CredentialStatusInput[],
): ComplianceStatus {
  if (credentials.length === 0) return "clear";

  let blocked = false;
  let attention = false;

  for (const c of credentials) {
    if (c.status === "expired" || c.status === "rejected") {
      blocked = true;
    } else if (c.status === "expiring_soon" || c.status === "pending_review") {
      attention = true;
    }
  }

  if (blocked) return "blocked";
  if (attention) return "attention";
  return "clear";
}
