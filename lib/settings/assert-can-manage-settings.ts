import type { AppRole } from "@/lib/auth/roles";

export class SettingsForbiddenError extends Error {
  constructor(message = "You don't have permission to change this setting.") {
    super(message);
    this.name = "SettingsForbiddenError";
  }
}

const MANAGE_SETTINGS_ROLES: AppRole[] = ["agency_owner", "agency_admin", "platform_admin"];

export function canManageAgencySettings(
  primaryRole: AppRole | string | null | undefined,
  agencyId: string | null | undefined,
): boolean {
  if (!agencyId) return false;
  if (!primaryRole) return false;
  return MANAGE_SETTINGS_ROLES.includes(primaryRole as AppRole);
}

export function assertCanManageAgencySettings(
  primaryRole: AppRole | string | null | undefined,
  agencyId: string | null | undefined,
): void {
  if (!canManageAgencySettings(primaryRole, agencyId)) {
    throw new SettingsForbiddenError();
  }
}
