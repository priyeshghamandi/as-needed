import { isAgencyRole, type AppRole } from "@/lib/auth/roles";

export function canViewAgencySettings(
  primaryRole: AppRole | string | null | undefined,
  agencyId: string | null | undefined,
): boolean {
  if (!agencyId) return false;
  if (!primaryRole) return false;
  return isAgencyRole(primaryRole as AppRole);
}
