"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon, Avatar } from "@/components/primitives";
import { SignOutButton } from "@/components/sign-out-button";
import { canViewCompliance } from "@/lib/auth/compliance-access-rules";
import { AGENCY_SIDEBAR_NAV } from "@/lib/navigation/agency-sidebar-nav";

const STORAGE_KEY = "agency-sidebar-collapsed";
const EXPANDED_WIDTH = "w-[232px]";
const COLLAPSED_WIDTH = "w-[60px]";

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center shrink-0">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

function resolveActiveNavId(pathname: string, navIds: { id: string; href: string }[]) {
  return (
    [...navIds]
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (n) =>
          pathname === n.href ||
          (n.href !== "/dashboard" && pathname.startsWith(`${n.href}/`)),
      )?.id ?? (pathname.startsWith("/dashboard") ? "dashboard" : "workforce")
  );
}

export function AgencySidebar({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  routedBadgeCount = 0,
  footer,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole?: string | null;
  routedBadgeCount?: number;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const navItems = AGENCY_SIDEBAR_NAV.filter(
    (n) => n.id !== "compliance" || canViewCompliance(primaryRole),
  );
  const activeNav = resolveActiveNavId(pathname, navItems);

  const agencyInitials = agencyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setCollapsed(false);
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const widthClass = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      className={`hidden md:flex ${widthClass} shrink-0 h-full border-r border-ink-200/70 bg-paper flex-col overflow-hidden transition-[width] duration-200 ease-out`}
      data-collapsed={collapsed ? "true" : "false"}
      aria-expanded={!collapsed}
    >
      <div
        className={`border-b border-ink-200/70 shrink-0 ${
          collapsed
            ? "flex flex-col items-center gap-1 py-2 px-1.5"
            : "h-14 flex items-center gap-2 px-4"
        }`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <Icon name="chevrons-right" className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <LogoMark />
        {!collapsed ? (
          <span className="font-semibold tracking-tight text-[15px] truncate">AsNeeded</span>
        ) : null}
        {!collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="ml-auto w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500 shrink-0"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <Icon name="chevrons-left" className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      <div
        className={`mt-3 rounded-lg border border-ink-200 bg-white flex items-center shrink-0 ${
          collapsed ? "mx-2 p-1.5 justify-center" : "mx-3 px-2.5 py-2 gap-2.5"
        }`}
        title={collapsed ? agencyName : undefined}
      >
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px] shrink-0">
          {agencyInitials || "AG"}
        </span>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium tracking-tight truncate">{agencyName}</div>
          </div>
        ) : null}
      </div>

      <nav
        className={`mt-3 flex flex-col gap-px flex-1 min-h-0 overflow-y-auto ${
          collapsed ? "px-1.5 items-center" : "px-2"
        }`}
      >
        {navItems.map((n) => {
          const active = activeNav === n.id;
          const showRoutedBadge = "badge" in n && n.badge === "routed" && routedBadgeCount > 0;
          return (
            <Link
              key={n.id}
              href={n.href}
              title={collapsed ? n.label : undefined}
              className={`group relative flex items-center rounded-md text-[13px] tracking-tight ${
                collapsed ? "justify-center w-10 h-10" : "gap-2.5 px-2.5 h-9"
              } ${
                active ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"
              }`}
            >
              <Icon
                name={n.icon}
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-paper" : "text-ink-500 group-hover:text-ink-800"
                }`}
              />
              {!collapsed ? (
                <>
                  <span className="flex-1 text-left truncate">{n.label}</span>
                  {showRoutedBadge ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-mono inline-flex items-center justify-center shrink-0">
                      {routedBadgeCount > 99 ? "99+" : routedBadgeCount}
                    </span>
                  ) : null}
                </>
              ) : showRoutedBadge ? (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"
                  aria-label={`${routedBadgeCount} pending routed requests`}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={`shrink-0 border-t border-ink-200/70 space-y-1 ${
          collapsed ? "p-2" : "p-3"
        } ${hydrated ? "" : "opacity-0"}`}
      >
        {footer && !collapsed ? <div className="mb-2">{footer}</div> : null}
        <div
          className={`flex items-center text-ink-800 ${
            collapsed ? "justify-center" : "gap-2 px-2 h-9"
          }`}
          title={collapsed ? userName : undefined}
        >
          <Avatar initials={userInitials} tone="teal" size={20} />
          {!collapsed ? (
            <div className="flex-1 text-left text-[12px] tracking-tight truncate min-w-0">
              {userName}
            </div>
          ) : null}
        </div>
        <SignOutButton variant="sidebar" collapsed={collapsed} />
      </div>
    </aside>
  );
}
