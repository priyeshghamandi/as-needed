export type CredentialStatus =
  | "pending_review"
  | "verified"
  | "expiring_soon"
  | "expired"
  | "rejected";

const VERIFY_FROM: CredentialStatus[] = ["pending_review"];

const REJECT_FROM: CredentialStatus[] = ["pending_review"];

const MANUAL_STATUS_TARGETS: CredentialStatus[] = [
  "expiring_soon",
  "expired",
  "pending_review",
];

export function canVerifyCredential(from: string): boolean {
  return VERIFY_FROM.includes(from as CredentialStatus);
}

export function canRejectCredential(from: string): boolean {
  return REJECT_FROM.includes(from as CredentialStatus);
}

export function canManualStatusTransition(to: string): boolean {
  return MANUAL_STATUS_TARGETS.includes(to as CredentialStatus);
}

export function canReopenReview(from: string): boolean {
  return from === "rejected";
}

/** Verified status must go through verify action (sets verifier fields). */
export function isDirectVerifiedStatusUpdate(to: string): boolean {
  return to === "verified";
}
