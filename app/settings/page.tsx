import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { loadSettingsPageContext } from "@/lib/settings/load-page-context";
import { parseSettingsTab } from "@/lib/settings/tabs";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const tabParam = typeof raw.tab === "string" ? raw.tab : null;
  const tab = parseSettingsTab(tabParam);

  if (tabParam && tabParam !== tab) {
    redirect("/settings?tab=profile");
  }

  const ctx = await loadSettingsPageContext();

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading settings…</div>}>
      <SettingsPageClient
        agencyName={ctx.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        primaryRole={ctx.primaryRole}
        unreadCount={ctx.unreadCount}
        canManage={ctx.canManage}
        settings={ctx.settings}
      />
    </Suspense>
  );
}
