"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/primitives";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { href: "/my-shifts", label: "My Shifts", icon: "calendar-range" },
  { href: "/availability", label: "Availability", icon: "clock" },
  { href: "/notifications", label: "Alerts", icon: "bell" },
] as const;

export function ProviderShell({
  userName,
  title,
  subtitle,
  children,
  unreadCount = 0,
}: {
  userName: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  unreadCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-6 pb-4 border-b border-ink-200/70 bg-paper/95 sticky top-0 z-20">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">
            Healthcare professional
          </div>
          <SignOutButton />
          <NotificationBell initialCount={unreadCount} />
        </div>
        <h1 className="text-[22px] font-medium tracking-tight text-ink-900 mt-1">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-ink-600 mt-0.5">{subtitle}</p>
        ) : (
          <p className="text-sm text-ink-500 mt-0.5">Signed in as {userName}</p>
        )}
      </header>

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800"
                    : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
