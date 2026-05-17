export type CredentialRow = {
  type: string;
  status: string;
};

export function evaluateCredentialMatch(
  requiredCredentials: string[] | null | undefined,
  credentials: CredentialRow[],
): { meetsCredentials: boolean; complianceWarnings: string[] } {
  const warnings: string[] = [];
  const required = (requiredCredentials ?? []).map((r) => r.trim().toLowerCase()).filter(Boolean);

  if (required.length === 0) {
    for (const cred of credentials) {
      if (cred.status === "expired") {
        warnings.push(`${cred.type} expired`);
      }
    }
    return { meetsCredentials: true, complianceWarnings: warnings };
  }

  const verifiedTypes = new Set(
    credentials
      .filter((c) => c.status === "verified" || c.status === "expiring_soon")
      .map((c) => c.type.trim().toLowerCase()),
  );

  let meetsAll = true;
  for (const req of required) {
    if (!verifiedTypes.has(req)) {
      meetsAll = false;
      warnings.push(`Missing verified ${req}`);
    }
  }

  for (const cred of credentials) {
    if (cred.status === "expired") {
      warnings.push(`${cred.type} expired`);
    }
  }

  return { meetsCredentials: meetsAll, complianceWarnings: warnings };
}
