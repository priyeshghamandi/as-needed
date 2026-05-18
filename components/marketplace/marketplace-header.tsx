"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/primitives";
import { MarketplaceLogo } from "@/components/marketplace/marketplace-logo";
import { LocationChip } from "@/components/marketplace/location-chip";

export function MarketplaceHeader({
  showFacilityRequestsLink = false,
}: {
  showFacilityRequestsLink?: boolean;
}) {

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/90 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-14 flex items-center gap-4">
        <MarketplaceLogo />
        <nav className="hidden md:flex items-center gap-1 text-[13px] text-ink-700">
          <Link
            href="/marketplace/categories"
            className="px-3 py-1.5 rounded-full hover:bg-ink-100"
          >
            Categories
          </Link>
          <Link
            href="/marketplace/search"
            className="px-3 py-1.5 rounded-full hover:bg-ink-100"
          >
            Search
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <LocationChip />
          {showFacilityRequestsLink ? (
            <Link
              href="/facility"
              className="hidden sm:inline text-[13px] text-ink-700 hover:underline px-2"
            >
              My staffing requests
            </Link>
          ) : null}
          <Link href="/login" className="text-[13px] text-ink-700 hover:underline px-2">
            Log in
          </Link>
          <Button as={Link} href="/signup" size="sm" variant="primary">
            For agencies <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
