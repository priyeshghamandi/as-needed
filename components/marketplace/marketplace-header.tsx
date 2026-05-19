"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Icon } from "@/components/primitives";
import { MarketplaceLogo } from "@/components/marketplace/marketplace-logo";
import { LocationChip } from "@/components/marketplace/location-chip";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace/categories", label: "Categories" },
  { href: "/marketplace/search", label: "Search" },
] as const;

export function MarketplaceHeader({
  showCustomerRequestsLink = false,
  customerRequestsLabel = "My staffing requests",
  signedInUserName = null,
  showCareSignupLink = false,
}: {
  showCustomerRequestsLink?: boolean;
  customerRequestsLabel?: string;
  signedInUserName?: string | null;
  showCareSignupLink?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/90 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-14 flex items-center gap-4">
        <MarketplaceLogo />
        <nav className="hidden md:flex items-center gap-1 text-[13px] text-ink-700" aria-label="Marketplace">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full hover:bg-ink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <LocationChip />
          {signedInUserName ? (
            <span className="hidden lg:inline text-[13px] text-ink-600 max-w-[140px] truncate px-1">
              {signedInUserName}
            </span>
          ) : null}
          {showCustomerRequestsLink ? (
            <Link
              href="/customer/requests"
              className="hidden sm:inline text-[13px] text-ink-700 hover:underline px-2"
            >
              {customerRequestsLabel}
            </Link>
          ) : null}
          {signedInUserName ? (
            <SignOutButton className="hidden sm:inline-flex px-2" />
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-[13px] text-ink-700 hover:underline px-2">
                Log in
              </Link>
              {showCareSignupLink ? (
                <Link
                  href="/signup/care"
                  className="hidden sm:inline text-[13px] text-teal-800 hover:underline px-2"
                >
                  Find home care
                </Link>
              ) : null}
            </>
          )}
          <Button as={Link} href="/signup" size="sm" variant="primary" className="hidden sm:inline-flex">
            For agencies <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-200 hover:bg-ink-50"
            aria-expanded={mobileOpen}
            aria-controls="marketplace-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <Icon name={mobileOpen ? "x" : "menu"} className="w-4 h-4" />
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <nav
          id="marketplace-mobile-nav"
          className="md:hidden border-t border-ink-200 bg-paper px-4 py-3 space-y-1"
          aria-label="Marketplace mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-[14px] text-ink-800 hover:bg-ink-100"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {showCustomerRequestsLink ? (
            <Link
              href="/customer/requests"
              className="block rounded-lg px-3 py-2 text-[14px] text-ink-800 hover:bg-ink-100"
              onClick={() => setMobileOpen(false)}
            >
              {customerRequestsLabel}
            </Link>
          ) : null}
          {signedInUserName ? (
            <div className="px-3 py-2" onClick={() => setMobileOpen(false)}>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2 text-[14px] text-ink-800 hover:bg-ink-100"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              {showCareSignupLink ? (
                <Link
                  href="/signup/care"
                  className="block rounded-lg px-3 py-2 text-[14px] text-teal-800 hover:bg-teal-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Find home care
                </Link>
              ) : null}
            </>
          )}
          <Link
            href="/signup"
            className="block rounded-lg px-3 py-2 text-[14px] font-medium text-teal-800 hover:bg-teal-50"
            onClick={() => setMobileOpen(false)}
          >
            For agencies
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
