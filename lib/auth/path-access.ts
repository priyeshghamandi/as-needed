import { canViewCompliance } from "@/lib/auth/compliance-access-rules";
import {
  isAgencyRole,
  isFacilityRole,
  isProviderRole,
  pickPrimaryRole,
  type ScopedRole,
} from "@/lib/auth/roles";

/** Edge-safe route access checks (no DB or Node crypto). */
export function canAccessPath(pathname: string, roles: ScopedRole[]): boolean {
  if (
    pathname === "/notifications" ||
    pathname.startsWith("/notifications/")
  ) {
    return roles.some((r) => isAgencyRole(r.role) || isProviderRole(r.role));
  }

  const agencyPaths = [
    "/dashboard",
    "/workforce",
    "/staffing-requests",
    "/shifts",
    "/facilities",
    "/compliance",
    "/settings",
    "/onboarding",
    "/ops",
    "/requests",
  ];

  const providerPaths = ["/my-shifts", "/availability", "/rn"];

  const facilityPaths = ["/facility"];

  const isAgencyPath = agencyPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isProviderPath = providerPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isFacilityPath = facilityPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const hasAgency = roles.some((r) => isAgencyRole(r.role));
  const hasProvider = roles.some((r) => isProviderRole(r.role));
  const hasFacility = roles.some((r) => isFacilityRole(r.role));

  if (isAgencyPath && !hasAgency) return false;
  if (isProviderPath && !hasProvider) return false;
  if (isFacilityPath && !hasFacility) return false;

  const isCompliancePath =
    pathname === "/compliance" || pathname.startsWith("/compliance/");
  if (isCompliancePath && hasAgency) {
    return canViewCompliance(pickPrimaryRole(roles));
  }

  return true;
}
