"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button } from "@/components/primitives";
import { MarketplaceLogo } from "@/components/marketplace/marketplace-logo";
import { SignOutButton } from "@/components/sign-out-button";

export function CustomerShell({
  facilityName,
  agencyName,
  requestsNavLabel = "My staffing requests",
  userName,
  userInitials,
  title,
  subtitle,
  children,
  headerActionHref,
  headerActionLabel,
}: {
  facilityName: string;
  agencyName?: string | null;
  requestsNavLabel?: string;
  userName: string;
  userInitials: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActionHref?: string;
  headerActionLabel?: string;
}) {
  const nav = [
    { href: "/customer/requests", label: requestsNavLabel },
    { href: "/marketplace", label: "Marketplace" },
  ] as const;
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <header className="border-b border-ink-200/70 bg-paper/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 h-14 flex items-center gap-4">
          <MarketplaceLogo />
          <nav className="hidden sm:flex items-center gap-1 text-[13px]">
            {nav.map((item) => {
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
              {agencyName ? (
                <p className="text-[11px] text-ink-500">via {agencyName}</p>
              ) : (
                <p className="text-[11px] text-ink-500">Home care</p>
              )}
            </div>
            <Avatar initials={userInitials} />
            <span className="hidden lg:inline text-[13px] text-ink-600">{userName}</span>
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
          {headerActionHref && headerActionLabel ? (
            <Button as={Link} href={headerActionHref} variant="primary" size="sm">
              {headerActionLabel}
            </Button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
