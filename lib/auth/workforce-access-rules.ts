import type { AppRole } from "@/lib/auth/roles";

export const WORKFORCE_WRITE_ROLES = [
  "agency_owner",
  "agency_admin",
  "recruiter",
] as const satisfies readonly AppRole[];

export const WORKFORCE_VIEW_ROLES = [
  ...WORKFORCE_WRITE_ROLES,
  "staffing_coordinator",
  "compliance_manager",
] as const satisfies readonly AppRole[];

export type WorkforceWriteRole = (typeof WORKFORCE_WRITE_ROLES)[number];
export type WorkforceViewRole = (typeof WORKFORCE_VIEW_ROLES)[number];

export function canManageWorkforce(primaryRole: string | null | undefined): boolean {
  return WORKFORCE_WRITE_ROLES.includes(primaryRole as WorkforceWriteRole);
}

export function canViewWorkforce(primaryRole: string | null | undefined): boolean {
  return WORKFORCE_VIEW_ROLES.includes(primaryRole as WorkforceViewRole);
}
