import { Suspense } from "react";
import { auth } from "@/auth";
import { MarketplaceSearchClient } from "@/components/marketplace/marketplace-search-client";
import { buildMarketplaceContinueRequestUrl } from "@/lib/marketplace/marketplace-cart";

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

export default async function MarketplaceSearchPage() {
  const session = await auth();
  const continueRequestHref =
    session?.user?.primaryRole === "facility_user"
      ? "/customer/requests/new"
      : buildMarketplaceContinueRequestUrl();

  return (
    <Suspense fallback={<SearchFallback />}>
      <MarketplaceSearchClient continueRequestHref={continueRequestHref} />
    </Suspense>
  );
}
