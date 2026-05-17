import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { OnboardingApp } from "@/components/onboarding-app";
import { getAgencyServiceAreaForUser } from "@/lib/agency/service-area";
import { getResumeStep } from "@/lib/onboarding/progress";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const primaryRole = session.user.primaryRole;
  if (primaryRole !== "agency_owner" && primaryRole !== "agency_admin") {
    redirect("/dashboard");
  }

  const agencyId = session.user.agencyId;
  if (!agencyId) redirect("/dashboard");

  const agencies = await db
    .select({
      onboardingCompletedAt: AgencyTable.onboardingCompletedAt,
      onboardingCurrentStep: AgencyTable.onboardingCurrentStep,
      onboardingProgress: AgencyTable.onboardingProgress,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  const agency = agencies[0];
  if (!agency) redirect("/dashboard");

  if (agency.onboardingCompletedAt) redirect("/dashboard");

  const progress = agency.onboardingProgress ?? { completedSteps: [], skippedSteps: [] };
  const initialStep = getResumeStep(agency.onboardingCurrentStep ?? "welcome", progress);

  const agencyServiceArea = await getAgencyServiceAreaForUser(session.user.id);

  return <OnboardingApp initialStep={initialStep} agencyServiceArea={agencyServiceArea} />;
}
