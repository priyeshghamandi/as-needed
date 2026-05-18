"use client";

import Link from "next/link";
import { useState } from "react";
import { AsNeededLogo } from "@/components/public/as-needed-logo";
import { Button, Icon } from "@/components/primitives";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/signup", label: "For agencies" },
] as const;

export function PublicSiteHeader({
  activePath = "/",
}: {
  activePath?: "/" | "/marketplace";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/90 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-14 flex items-center gap-4">
        <AsNeededLogo href="/" />
        <nav
          className="hidden md:flex items-center gap-1 text-[13px] text-ink-700"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full ${
                activePath === link.href ? "bg-ink-100 text-ink-900" : "hover:bg-ink-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline text-[13px] text-ink-700 hover:underline px-2"
          >
            Sign in
          </Link>
          <Button as={Link} href="/signup" size="sm" variant="primary" className="hidden sm:inline-flex">
            Agency signup
          </Button>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-200 hover:bg-ink-50"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <Icon name={mobileOpen ? "x" : "menu"} className="w-4 h-4" />
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <nav
          id="public-mobile-nav"
          className="md:hidden border-t border-ink-200 bg-paper px-4 py-3 space-y-1"
          aria-label="Mobile primary"
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
          <Link
            href="/login"
            className="block rounded-lg px-3 py-2 text-[14px] text-ink-800 hover:bg-ink-100"
            onClick={() => setMobileOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="block rounded-lg px-3 py-2 text-[14px] font-medium text-teal-800 hover:bg-teal-50"
            onClick={() => setMobileOpen(false)}
          >
            Agency signup
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
