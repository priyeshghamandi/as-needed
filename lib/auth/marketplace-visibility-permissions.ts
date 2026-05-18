import {
  canManageWorkforce,
  WORKFORCE_WRITE_ROLES,
  WORKFORCE_VIEW_ROLES,
} from "@/lib/auth/workforce-access-rules";

export {
  WORKFORCE_WRITE_ROLES as MARKETPLACE_VISIBILITY_WRITE_ROLES,
  WORKFORCE_VIEW_ROLES as MARKETPLACE_VISIBILITY_VIEW_ROLES,
};

export function canManageMarketplaceVisibility(
  primaryRole: string | null | undefined,
): boolean {
  return canManageWorkforce(primaryRole);
}

export function canViewMarketplaceVisibility(
  primaryRole: string | null | undefined,
): boolean {
  return WORKFORCE_VIEW_ROLES.includes(
    primaryRole as (typeof WORKFORCE_VIEW_ROLES)[number],
  );
}
