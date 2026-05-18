export const MARKETPLACE_RECENT_SEARCHES_KEY = "marketplace_recent_searches";
const MAX_RECENT = 5;

export type RecentMarketplaceSearch = {
  role: string;
  roleLabel: string;
  locationDisplayName: string;
  searchedAt: string;
};

export function readRecentMarketplaceSearches(): RecentMarketplaceSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MARKETPLACE_RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentMarketplaceSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function saveRecentMarketplaceSearch(entry: Omit<RecentMarketplaceSearch, "searchedAt">): void {
  if (typeof window === "undefined") return;
  const next: RecentMarketplaceSearch = {
    ...entry,
    searchedAt: new Date().toISOString(),
  };
  const existing = readRecentMarketplaceSearches().filter(
    (row) => !(row.role === next.role && row.locationDisplayName === next.locationDisplayName),
  );
  localStorage.setItem(
    MARKETPLACE_RECENT_SEARCHES_KEY,
    JSON.stringify([next, ...existing].slice(0, MAX_RECENT)),
  );
}
