import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUnauthorizedRedirect } from "@/lib/auth/redirects";
import { isAgencyRole } from "@/lib/auth/roles";
import { getAgencyShellProps } from "@/lib/agency/shell-props";
import { canManageAgencySettings } from "@/lib/settings/assert-can-manage-settings";
import { canViewAgencySettings } from "@/lib/settings/assert-can-view-settings";
import { getAgencySettingsDto } from "@/lib/settings/queries";
import { getUnreadNotificationCount } from "@/lib/notifications/unread-count";
import type { AgencySettingsDto } from "@/lib/settings/queries";

export async function loadSettingsPageContext(callbackPath = "/settings") {
  const session = await auth();
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId ?? null;
  const primaryRole = session?.user?.primaryRole ?? null;
  const roles = session?.user?.roles ?? [];

  if (!userId) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);

  if (!canViewAgencySettings(primaryRole, agencyId)) {
    redirect(getUnauthorizedRedirect(roles));
  }

  if (!agencyId) redirect("/login");

  const shell = await getAgencyShellProps(userId, agencyId);
  const settings = await getAgencySettingsDto(agencyId);
  if (!settings) redirect("/dashboard");

  const unreadCount = await getUnreadNotificationCount(userId, agencyId);
  const canManage = canManageAgencySettings(primaryRole, agencyId);

  return {
    userId,
    agencyId,
    primaryRole: primaryRole ?? "staffing_coordinator",
    canManage,
    unreadCount,
    settings,
    ...shell,
  };
}

export type SettingsPageContext = Awaited<ReturnType<typeof loadSettingsPageContext>> & {
  settings: AgencySettingsDto;
};
