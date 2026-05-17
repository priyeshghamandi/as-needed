import { canProviderTransitionAssignment } from "@/lib/assignments/status-transitions";

export function canProviderAcceptAssignment(currentStatus: string): boolean {
  return canProviderTransitionAssignment(currentStatus, "accepted");
}

export function canProviderDeclineAssignment(currentStatus: string): boolean {
  return canProviderTransitionAssignment(currentStatus, "declined");
}

export function isAssignmentResponseIdempotent(currentStatus: string): boolean {
  return currentStatus === "accepted" || currentStatus === "confirmed";
}

export function isAssignmentDeclineIdempotent(currentStatus: string): boolean {
  return currentStatus === "declined";
}
