import { OnboardingApp } from "@/components/onboarding-app";
import { auth } from "@/auth";
import { getAgencyServiceAreaForUser } from "@/lib/agency/service-area";

export default async function OnboardingPage() {
  const session = await auth();
  const agencyServiceArea = session?.user?.id
    ? await getAgencyServiceAreaForUser(session.user.id)
    : null;

  return <OnboardingApp agencyServiceArea={agencyServiceArea} />;
}
