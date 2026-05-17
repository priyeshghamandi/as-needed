import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AvailabilityClient } from "@/components/provider/availability-client";
import { NotLinkedState } from "@/components/provider/not-linked-state";
import { ProviderShell } from "@/components/provider/provider-shell";
import { requireProviderContext } from "@/lib/auth/provider-context";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/availability");
  }

  const ctx = await requireProviderContext();
  const userName = session.user.name ?? session.user.email ?? "Provider";

  return (
    <ProviderShell userName={userName} title="Availability" subtitle="When you are available to work">
      {ctx.professional ? <AvailabilityClient /> : <NotLinkedState />}
    </ProviderShell>
  );
}
