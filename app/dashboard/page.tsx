import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { OpsApp } from "@/components/ops-app";
import { OnboardingBanner } from "@/components/onboarding-banner";

export default async function DashboardPage() {
  const session = await auth();
  const primaryRole = session?.user?.primaryRole;
  const agencyId = session?.user?.agencyId;

  let showBanner = false;

  if (agencyId && (primaryRole === "agency_owner" || primaryRole === "agency_admin")) {
    const agencies = await db
      .select({ onboardingCompletedAt: AgencyTable.onboardingCompletedAt })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    showBanner = !agencies[0]?.onboardingCompletedAt;
  }

  return (
    <>
      {showBanner && <OnboardingBanner />}
      <OpsApp />
    </>
  );
}
