import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MyShiftsClient } from "@/components/provider/my-shifts-client";
import { NotLinkedState } from "@/components/provider/not-linked-state";
import { ProviderShell } from "@/components/provider/provider-shell";
import { requireProviderContext } from "@/lib/auth/provider-context";

export default async function MyShiftsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/my-shifts");
  }

  const ctx = await requireProviderContext();
  const userName = session.user.name ?? session.user.email ?? "Provider";

  return (
    <ProviderShell userName={userName} title="My Shifts" subtitle="Invites and scheduled shifts">
      {ctx.professional ? <MyShiftsClient /> : <NotLinkedState />}
    </ProviderShell>
  );
}
