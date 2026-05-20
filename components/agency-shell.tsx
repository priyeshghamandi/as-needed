"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";
import { AgencySidebar } from "@/components/agency-sidebar";
import { canViewStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

export function AgencyShell({
  agencyName,
  userName,
  userInitials,
  title,
  subtitle,
  children,
  headerAction,
  primaryRole,
  unreadCount = 0,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  primaryRole?: string | null;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [routedBadgeCount, setRoutedBadgeCount] = useState(0);

  useEffect(() => {
    if (!canViewStaffingRequests(primaryRole)) return;
    let cancelled = false;
    fetch("/api/staffing-requests/routed?summary=count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.pendingCount === "number") {
          setRoutedBadgeCount(data.pendingCount);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [primaryRole, pathname]);

  return (
    <div className="h-screen bg-paper text-ink-900 flex overflow-hidden">
      <AgencySidebar
        agencyName={agencyName}
        userName={userName}
        userInitials={userInitials}
        primaryRole={primaryRole}
        routedBadgeCount={routedBadgeCount}
      />
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <header className="shrink-0 z-30 h-14 bg-paper/85 backdrop-blur border-b border-ink-200/70">
          <div className="h-full px-4 md:px-6 flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 md:hidden shrink-0">
              <LogoMark />
              <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="md:hidden">
                <SignOutButton />
              </div>
              <NotificationBell initialCount={unreadCount} />
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 space-y-6 min-w-0 max-w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[22px] md:text-[28px] leading-tight tracking-[-0.01em] font-medium">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-[13px] font-mono text-ink-500">{subtitle}</p>
              ) : null}
            </div>
            {headerAction}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
