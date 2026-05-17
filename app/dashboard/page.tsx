import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserTable } from "@/drizzle/schema";
import { OpsApp } from "@/components/ops-app";
import { OnboardingBanner } from "@/components/onboarding-banner";
import {
  getDashboardSummary,
  getActiveRequests,
  getAvailableWorkforce,
  getActivityFeed,
} from "@/lib/dashboard/queries";
import {
  getLatestUnreadCritical,
  getUnreadNotificationCount,
} from "@/lib/notifications/unread-count";

export default async function DashboardPage() {
  const session = await auth();
  const primaryRole = session?.user?.primaryRole ?? null;
  const agencyId = session?.user?.agencyId ?? null;
  const userId = session?.user?.id ?? null;

  if (!userId || !agencyId) redirect("/login");

  const [
    agency,
    user,
    summary,
    activeRequests,
    availableWorkforce,
    activityFeed,
    unreadCount,
    criticalRow,
  ] = await Promise.all([
      db
        .select({
          name: AgencyTable.name,
          onboardingCompletedAt: AgencyTable.onboardingCompletedAt,
        })
        .from(AgencyTable)
        .where(eq(AgencyTable.id, agencyId))
        .limit(1)
        .then(([r]) => r ?? null),
      db
        .select({ name: UserTable.name })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
        .limit(1)
        .then(([r]) => r ?? null),
      getDashboardSummary(agencyId),
      getActiveRequests(agencyId),
      getAvailableWorkforce(agencyId),
      getActivityFeed(agencyId),
      getUnreadNotificationCount(userId, agencyId),
      getLatestUnreadCritical(userId, agencyId),
    ]);

  if (!agency) redirect("/login");

  const showBanner =
    !agency.onboardingCompletedAt &&
    (primaryRole === "agency_owner" || primaryRole === "agency_admin");

  const userName = user?.name ?? "Team Member";
  const userInitials = userName
    .split(" ")
    .map((s: string) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const serializedRequests = activeRequests.map((r) => ({
    ...r,
    updatedAt: r.updatedAt.toISOString(),
  }));

  const serializedWorkforce = availableWorkforce.map((p) => ({
    ...p,
    lastShiftAt: p.lastShiftAt ? new Date(p.lastShiftAt).toISOString() : null,
  }));

  const serializedActivity = activityFeed.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <>
      {showBanner && <OnboardingBanner />}
      <OpsApp
        agencyName={agency.name}
        userName={userName}
        userInitials={userInitials}
        primaryRole={primaryRole ?? "staffing_coordinator"}
        unreadCount={unreadCount}
        criticalAlert={
          criticalRow
            ? {
                id: criticalRow.id,
                title: criticalRow.title,
                message: criticalRow.message,
              }
            : null
        }
        summary={summary}
        activeRequests={serializedRequests}
        availableWorkforce={serializedWorkforce}
        activityFeed={serializedActivity}
      />
    </>
  );
}
