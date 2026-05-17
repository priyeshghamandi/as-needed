import type { AppRole } from "@/lib/auth/roles";

export const FACILITIES_WRITE_ROLES = [
  "agency_owner",
  "agency_admin",
  "staffing_coordinator",
] as const satisfies readonly AppRole[];

export const FACILITIES_VIEW_ROLES = [
  ...FACILITIES_WRITE_ROLES,
  "recruiter",
  "compliance_manager",
] as const satisfies readonly AppRole[];

export type FacilitiesWriteRole = (typeof FACILITIES_WRITE_ROLES)[number];
export type FacilitiesViewRole = (typeof FACILITIES_VIEW_ROLES)[number];

export function canManageFacilities(primaryRole: string | null | undefined): boolean {
  return FACILITIES_WRITE_ROLES.includes(primaryRole as FacilitiesWriteRole);
}

export function canViewFacilities(primaryRole: string | null | undefined): boolean {
  return FACILITIES_VIEW_ROLES.includes(primaryRole as FacilitiesViewRole);
}
