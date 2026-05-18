import { Suspense } from "react";
import { MarketplaceSearchClient } from "@/components/marketplace/marketplace-search-client";

export const metadata = {
  title: "Search professionals",
};

function SearchFallback() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-medium tracking-tight">Search professionals</h1>
      <p className="mt-4 text-[14px] text-ink-500">Loading search…</p>
    </div>
  );
}

export default function MarketplaceSearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <MarketplaceSearchClient />
    </Suspense>
  );
}
