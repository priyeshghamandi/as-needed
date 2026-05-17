"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Avatar } from "@/components/primitives";
import { canViewCompliance } from "@/lib/auth/compliance-access-rules";

const NAV = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "layout-grid" },
  { id: "requests", href: "/staffing-requests", label: "Staffing Requests", icon: "clipboard-list" },
  { id: "workforce", href: "/workforce", label: "Workforce", icon: "users" },
  { id: "facilities", href: "/facilities", label: "Facilities", icon: "building-2" },
  { id: "shifts", href: "/shifts", label: "Shifts", icon: "calendar-range" },
  { id: "compliance", href: "/compliance", label: "Compliance", icon: "shield-check" },
  { id: "messages", href: "/messages", label: "Messages", icon: "message-circle" },
  { id: "reports", href: "/reports", label: "Reports", icon: "bar-chart-3" },
  { id: "settings", href: "/settings", label: "Settings", icon: "settings-2" },
];

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
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  primaryRole?: string | null;
}) {
  const pathname = usePathname();
  const navItems = NAV.filter(
    (n) => n.id !== "compliance" || canViewCompliance(primaryRole),
  );
  const agencyInitials = agencyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  const activeNav =
    NAV.find(
      (n) => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(`${n.href}/`)),
    )?.id ?? (pathname.startsWith("/dashboard") ? "dashboard" : "workforce");

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex overflow-x-hidden">
      <aside className="hidden md:flex w-[232px] shrink-0 h-screen sticky top-0 border-r border-ink-200/70 bg-paper flex-col">
        <div className="px-4 h-14 flex items-center gap-2 border-b border-ink-200/70">
          <LogoMark />
          <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
        </div>
        <div className="mx-3 mt-3 px-2.5 py-2 rounded-lg border border-ink-200 bg-white flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px] shrink-0">
            {agencyInitials || "AG"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium tracking-tight truncate">{agencyName}</div>
          </div>
        </div>
        <nav className="px-2 mt-3 flex flex-col gap-px">
          {navItems.map((n) => {
            const active = activeNav === n.id;
            return (
              <Link
                key={n.id}
                href={n.href}
                className={`group flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight ${
                  active ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"
                }`}
              >
                <Icon
                  name={n.icon}
                  className={`w-4 h-4 ${active ? "text-paper" : "text-ink-500 group-hover:text-ink-800"}`}
                />
                <span className="flex-1 text-left">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <div className="w-full flex items-center gap-2 px-2 h-9 rounded-md text-[13px] text-ink-800">
            <Avatar initials={userInitials} tone="teal" size={20} />
            <div className="flex-1 text-left text-[12px] tracking-tight truncate">{userName}</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 bg-paper/85 backdrop-blur border-b border-ink-200/70">
          <div className="h-full px-4 md:px-6 flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 md:hidden shrink-0">
              <LogoMark />
              <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
            </div>
          </div>
        </header>
        <main className="px-4 md:px-6 py-6 space-y-6 min-w-0 max-w-full">
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
