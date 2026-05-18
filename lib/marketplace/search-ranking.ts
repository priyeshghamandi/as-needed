import type { ApproximateAvailability } from "@/lib/marketplace/approximate-availability";
import type { MARKETPLACE_URGENCY_VALUES } from "@/lib/marketplace/search-params";

const AVAILABILITY_SCORE: Record<ApproximateAvailability | "none", number> = {
  likely_available: 3,
  available_this_week: 2,
  recently_active: 1,
  none: 0,
};

export type RankableSearchResult = {
  approximateAvailability: ApproximateAvailability | null;
};

export function rankMarketplaceResults<T extends RankableSearchResult>(
  results: T[],
  options: {
    urgency?: (typeof MARKETPLACE_URGENCY_VALUES)[number] | null;
    sort?: "relevance" | "recently_active";
  },
): T[] {
  const sort = options.sort ?? "relevance";

  return [...results].sort((a, b) => {
    const score = (item: T) => {
      const base =
        AVAILABILITY_SCORE[item.approximateAvailability ?? "none"] ?? 0;
      if (options.urgency === "asap" && item.approximateAvailability === "recently_active") {
        return base + 0.5;
      }
      return base;
    };

    if (sort === "recently_active") {
      const aRecent = a.approximateAvailability === "recently_active" ? 1 : 0;
      const bRecent = b.approximateAvailability === "recently_active" ? 1 : 0;
      if (bRecent !== aRecent) return bRecent - aRecent;
    }

    return score(b) - score(a);
  });
}
