import type { AppRole } from "@/lib/auth/roles";

export const COMPLIANCE_VIEW_ROLES = [
  "compliance_manager",
  "agency_owner",
  "agency_admin",
] as const satisfies readonly AppRole[];

export type ComplianceViewRole = (typeof COMPLIANCE_VIEW_ROLES)[number];

export function canViewCompliance(primaryRole: string | null | undefined): boolean {
  return COMPLIANCE_VIEW_ROLES.includes(primaryRole as ComplianceViewRole);
}

export function canManageCompliance(primaryRole: string | null | undefined): boolean {
  return canViewCompliance(primaryRole);
}
