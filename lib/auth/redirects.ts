import {
  isAgencyRole,
  isFacilityRole,
  isProviderRole,
  type ScopedRole,
} from "@/lib/auth/roles";

export function getPostLoginRedirect(roles: ScopedRole[]): string {
  if (roles.some((r) => isFacilityRole(r.role))) {
    return "/facility/dashboard";
  }

  if (roles.some((r) => isProviderRole(r.role))) {
    return "/my-shifts";
  }

  if (roles.some((r) => isAgencyRole(r.role))) {
    return "/dashboard";
  }

  return "/login";
}

export function getUnauthorizedRedirect(roles: ScopedRole[]): string {
  return getPostLoginRedirect(roles);
}
