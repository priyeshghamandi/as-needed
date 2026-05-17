import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserTable } from "@/drizzle/schema";
import { isAgencyRole, isFacilityRole, isProviderRole } from "@/lib/auth/roles";
import { getUnreadNotificationCount } from "@/lib/notifications/unread-count";

export async function loadNotificationsPageContext(callbackPath = "/notifications") {
  const session = await auth();
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId ?? null;
  const primaryRole = session?.user?.primaryRole ?? null;
  const roles = session?.user?.roles ?? [];

  if (!userId) redirect(`/login?callbackUrl=${callbackPath}`);

  const allowed = roles.some(
    (r) =>
      isAgencyRole(r.role) || isProviderRole(r.role) || isFacilityRole(r.role),
  );
  if (!allowed) redirect("/login");

  const isAgency = roles.some((r) => isAgencyRole(r.role));
  const isProvider = roles.some((r) => isProviderRole(r.role));

  let agencyName = "AsNeeded";
  if (agencyId && isAgency) {
    const agency = await db
      .select({ name: AgencyTable.name })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1)
      .then(([r]) => r ?? null);
    if (agency) agencyName = agency.name;
  }

  const user = await db
    .select({ name: UserTable.name })
    .from(UserTable)
    .where(eq(UserTable.id, userId))
    .limit(1)
    .then(([r]) => r ?? null);

  const userName = user?.name ?? "User";
  const userInitials = userName
    .split(" ")
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unreadCount = await getUnreadNotificationCount(userId, agencyId);

  return {
    userId,
    agencyId,
    agencyName,
    userName,
    userInitials,
    primaryRole: primaryRole ?? "staffing_coordinator",
    unreadCount,
    isAgency,
    isProvider,
  };
}
