import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isConsumerRole } from "@/lib/auth/roles";
import { getConsumerCareSite } from "@/lib/consumer/care-site";
import { ConsumerCareOnboarding } from "@/components/consumer/consumer-care-onboarding";

export const metadata = {
  title: "Confirm your care location",
};

export default async function CareOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signup/care");
  }

  if (!session.user.primaryRole || !isConsumerRole(session.user.primaryRole)) {
    redirect("/dashboard?error=forbidden");
  }

  const careSite = await getConsumerCareSite(session.user.id);
  if (careSite) {
    redirect("/marketplace");
  }

  return <ConsumerCareOnboarding userName={session.user.name ?? "there"} />;
}
