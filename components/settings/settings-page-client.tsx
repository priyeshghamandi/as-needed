"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AgencyShell } from "@/components/agency-shell";
import { SettingsProfileTab } from "@/components/settings/settings-profile-tab";
import { SettingsServiceAreaTab } from "@/components/settings/settings-service-area-tab";
import { SettingsTeamTab } from "@/components/settings/settings-team-tab";
import { SettingsPreferencesTab } from "@/components/settings/settings-preferences-tab";
import { parseSettingsTab, type SettingsTab } from "@/lib/settings/tabs";
import type { AgencySettingsDto } from "@/lib/settings/queries";

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: "Profile",
  "service-area": "Service area",
  team: "Team",
  preferences: "Preferences",
};

export function SettingsPageClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  unreadCount,
  canManage,
  settings,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  unreadCount: number;
  canManage: boolean;
  settings: AgencySettingsDto;
}) {
  const searchParams = useSearchParams();
  const tab = parseSettingsTab(searchParams.get("tab"));
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function handleSaved(message: string) {
    setToast(message);
    setDirty(false);
    window.setTimeout(() => setToast(null), 4000);
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="Settings"
      subtitle={agencyName}
      primaryRole={primaryRole}
      unreadCount={unreadCount}
    >
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <nav
          className="lg:col-span-3 flex lg:flex-col gap-1 overflow-x-auto scrollarea pb-1 lg:pb-0"
          role="tablist"
          aria-label="Settings sections"
        >
          {(Object.keys(TAB_LABELS) as SettingsTab[]).map((id) => {
            const active = tab === id;
            return (
              <Link
                key={id}
                href={`/settings?tab=${id}`}
                role="tab"
                aria-selected={active}
                className={`shrink-0 lg:shrink px-3 min-h-11 h-11 lg:h-9 inline-flex items-center rounded-md text-[13px] font-medium transition ${
                  active
                    ? "bg-ink-900 text-paper"
                    : "text-ink-700 hover:bg-ink-100 border border-transparent lg:border-ink-200 lg:bg-white"
                }`}
              >
                {TAB_LABELS[id]}
              </Link>
            );
          })}
        </nav>

        <div
          className="lg:col-span-9 rounded-xl border border-ink-200 bg-white p-5 md:p-6"
          role="tabpanel"
        >
          {tab === "profile" ? (
            <SettingsProfileTab
              profile={settings.profile}
              canManage={canManage}
              onSaved={handleSaved}
              onDirtyChange={setDirty}
            />
          ) : null}
          {tab === "service-area" ? (
            <SettingsServiceAreaTab
              serviceArea={settings.serviceArea}
              canManage={canManage}
              onSaved={handleSaved}
              onDirtyChange={setDirty}
            />
          ) : null}
          {tab === "team" ? (
            <SettingsTeamTab
              members={settings.members}
              pendingInvites={settings.pendingInvites}
              canManage={canManage}
              onSaved={handleSaved}
            />
          ) : null}
          {tab === "preferences" ? (
            <SettingsPreferencesTab
              preferences={settings.preferences}
              canManage={canManage}
              onSaved={handleSaved}
              onDirtyChange={setDirty}
            />
          ) : null}
        </div>
      </div>
    </AgencyShell>
  );
}
