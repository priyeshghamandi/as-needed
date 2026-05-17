export type AppRole =
  | "platform_admin"
  | "agency_owner"
  | "agency_admin"
  | "staffing_coordinator"
  | "recruiter"
  | "compliance_manager"
  | "facility_user"
  | "provider";

export const AGENCY_ROLES: AppRole[] = [
  "platform_admin",
  "agency_owner",
  "agency_admin",
  "staffing_coordinator",
  "recruiter",
  "compliance_manager",
];

export const PROVIDER_ROLES: AppRole[] = ["provider"];

export const FACILITY_ROLES: AppRole[] = ["facility_user"];

export const INVITE_CREATOR_ROLES: AppRole[] = [
  "platform_admin",
  "agency_owner",
  "agency_admin",
];

export type ScopedRole = {
  role: AppRole;
  agencyId: string | null;
};

export function isAgencyRole(role: AppRole): boolean {
  return AGENCY_ROLES.includes(role);
}

export function isProviderRole(role: AppRole): boolean {
  return PROVIDER_ROLES.includes(role);
}

export function isFacilityRole(role: AppRole): boolean {
  return FACILITY_ROLES.includes(role);
}

export function pickPrimaryRole(roles: ScopedRole[]): AppRole | null {
  const order: AppRole[] = [
    "platform_admin",
    "agency_owner",
    "agency_admin",
    "staffing_coordinator",
    "recruiter",
    "compliance_manager",
    "facility_user",
    "provider",
  ];

  for (const candidate of order) {
    if (roles.some((r) => r.role === candidate)) {
      return candidate;
    }
  }

  return roles[0]?.role ?? null;
}

export function pickPrimaryAgencyId(roles: ScopedRole[]): string | null {
  const agencyRole = roles.find(
    (r) => r.agencyId && (isAgencyRole(r.role) || isFacilityRole(r.role)),
  );
  return agencyRole?.agencyId ?? roles.find((r) => r.agencyId)?.agencyId ?? null;
}
