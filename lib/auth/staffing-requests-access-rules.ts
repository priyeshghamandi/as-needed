import type { AppRole } from "@/lib/auth/roles";

export const STAFFING_REQUESTS_WRITE_ROLES = [
  "agency_owner",
  "agency_admin",
  "staffing_coordinator",
] as const satisfies readonly AppRole[];

export const STAFFING_REQUESTS_VIEW_ROLES = [
  ...STAFFING_REQUESTS_WRITE_ROLES,
  "recruiter",
  "compliance_manager",
] as const satisfies readonly AppRole[];

export type StaffingRequestsWriteRole = (typeof STAFFING_REQUESTS_WRITE_ROLES)[number];
export type StaffingRequestsViewRole = (typeof STAFFING_REQUESTS_VIEW_ROLES)[number];

export function canManageStaffingRequests(
  primaryRole: string | null | undefined,
): boolean {
  return STAFFING_REQUESTS_WRITE_ROLES.includes(primaryRole as StaffingRequestsWriteRole);
}

export function canViewStaffingRequests(primaryRole: string | null | undefined): boolean {
  return STAFFING_REQUESTS_VIEW_ROLES.includes(primaryRole as StaffingRequestsViewRole);
}
