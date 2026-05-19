"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

const NAV = [
  { href: "/facility/dashboard", label: "Dashboard" },
  { href: "/facility/requests", label: "Staffing requests" },
] as const;

export function FacilityShell({
  facilityName,
  agencyName,
  userName,
  userInitials,
  title,
  subtitle,
  children,
  headerAction,
}: {
  facilityName: string;
  agencyName: string;
  userName: string;
  userInitials: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <header className="border-b border-ink-200/70 bg-paper/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 h-14 flex items-center gap-4">
          <div className="text-[13px] font-medium tracking-tight text-teal-800">Facility portal</div>
          <nav className="hidden sm:flex items-center gap-1 text-[13px]">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full ${
                    active ? "bg-ink-100 text-ink-900" : "text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-[13px] font-medium leading-tight">{facilityName}</p>
              <p className="text-[11px] text-ink-500">via {agencyName}</p>
            </div>
            <span
              className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 text-[11px] font-mono inline-flex items-center justify-center"
              aria-hidden
            >
              {userInitials}
            </span>
            <span className="hidden lg:inline text-[13px] text-ink-600">{userName}</span>
            <NotificationBell />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 flex-1 w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-[14px] text-ink-600 max-w-2xl">{subtitle}</p>
            ) : null}
          </div>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  );
}
