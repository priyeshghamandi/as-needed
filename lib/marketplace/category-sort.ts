import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";

const AVAILABILITY_SORT_ORDER: Record<string, number> = {
  recently_active: 0,
  available_this_week: 1,
  likely_available: 2,
  none: 3,
};

/** Category default: recently_active first, then name ascending. */
export function sortCategoryProfessionals(
  results: MarketplaceSearchResult[],
): MarketplaceSearchResult[] {
  return [...results].sort((a, b) => {
    const aKey = a.approximateAvailability ?? "none";
    const bKey = b.approximateAvailability ?? "none";
    const aOrder = AVAILABILITY_SORT_ORDER[aKey] ?? 3;
    const bOrder = AVAILABILITY_SORT_ORDER[bKey] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.displayName.localeCompare(b.displayName);
  });
}
