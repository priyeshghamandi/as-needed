"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { MarketplaceSearchResultCard } from "@/components/marketplace/marketplace-search-result-card";
import { SearchPagination } from "@/components/marketplace/search-pagination";
import { Button, Icon } from "@/components/primitives";
import type { GeographicLocation } from "@/lib/geographic-location";
import {
  MARKETPLACE_LOCATION_COOKIE,
  MARKETPLACE_LOCATION_MAX_AGE,
  parseMarketplaceLocationCookie,
  serializeMarketplaceLocationCookie,
  type MarketplaceLocationCookie,
} from "@/lib/marketplace/location-cookie";
import {
  buildMarketplaceContinueRequestUrl,
  MARKETPLACE_CART_MAX,
  readMarketplaceCart,
  toggleCartProfessional,
  writeMarketplaceCart,
  type MarketplaceRequestCart,
} from "@/lib/marketplace/marketplace-cart";
import {
  readRecentMarketplaceSearches,
  saveRecentMarketplaceSearch,
  type RecentMarketplaceSearch,
} from "@/lib/marketplace/recent-searches";
import {
  MARKETPLACE_SHIFT_TYPES,
  MARKETPLACE_SORT_VALUES,
  MARKETPLACE_URGENCY_VALUES,
  marketplaceSearchQueryFromUrl,
  normalizeMarketplaceRoleParam,
} from "@/lib/marketplace/search-params";
import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";
import {
  WORKFORCE_PROFESSIONAL_ROLES,
  WORKFORCE_ROLE_LABELS,
} from "@/lib/validations/workforce-professional";

const PAGE_SIZE = 20;

function readLocationCookie(): MarketplaceLocationCookie | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${MARKETPLACE_LOCATION_COOKIE}=`));
  if (!match) return null;
  const raw = decodeURIComponent(match.split("=").slice(1).join("="));
  return parseMarketplaceLocationCookie(raw);
}

function writeLocationCookie(location: MarketplaceLocationCookie) {
  const value = encodeURIComponent(serializeMarketplaceLocationCookie(location));
  document.cookie = `${MARKETPLACE_LOCATION_COOKIE}=${value}; path=/; max-age=${MARKETPLACE_LOCATION_MAX_AGE}; samesite=lax`;
}

function toGeographicLocation(loc: MarketplaceLocationCookie): GeographicLocation {
  return { ...loc, country: "US" };
}

function todayIsoDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const SHIFT_TYPE_LABELS: Record<(typeof MARKETPLACE_SHIFT_TYPES)[number], string> = {
  day: "Day",
  night: "Night",
  weekend: "Weekend",
  on_call: "On call",
};

type SearchResponse = {
  results: MarketplaceSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

export function MarketplaceSearchClient({
  continueRequestHref = buildMarketplaceContinueRequestUrl(),
}: {
  continueRequestHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = normalizeMarketplaceRoleParam(searchParams.get("role")) ?? "";
  const initialNeedStart = searchParams.get("needStart") ?? "";
  const initialNeedEnd = searchParams.get("needEnd") ?? "";
  const initialUrgency = searchParams.get("urgency") ?? "";
  const initialShiftType = searchParams.get("shiftType") ?? "";
  const initialSort =
    (searchParams.get("sort") as (typeof MARKETPLACE_SORT_VALUES)[number] | null) ?? "relevance";
  const needModeFromUrl = initialNeedStart || initialNeedEnd ? "window" : "urgency";

  const [role, setRole] = useState(initialRole);
  const [location, setLocation] = useState<GeographicLocation | null>(null);
  const [needMode, setNeedMode] = useState<"window" | "urgency">(needModeFromUrl);
  const [needStart, setNeedStart] = useState(initialNeedStart);
  const [needEnd, setNeedEnd] = useState(initialNeedEnd);
  const [urgency, setUrgency] = useState(initialUrgency);
  const [shiftType, setShiftType] = useState(initialShiftType);
  const [sort, setSort] = useState<(typeof MARKETPLACE_SORT_VALUES)[number]>(initialSort);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketplaceSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [cart, setCart] = useState<MarketplaceRequestCart | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentMarketplaceSearch[]>([]);

  const minStartDate = useMemo(() => todayIsoDateLocal(), []);

  useEffect(() => {
    const cookie = readLocationCookie();
    if (cookie) setLocation(toGeographicLocation(cookie));
    setCart(readMarketplaceCart());
    setRecentSearches(readRecentMarketplaceSearches());
  }, []);

  const buildPageUrl = useCallback(
    (overrides?: { sort?: string; page?: number }) => {
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      if (needMode === "window") {
        if (needStart) params.set("needStart", needStart);
        if (needEnd) params.set("needEnd", needEnd);
      } else if (urgency) {
        params.set("urgency", urgency);
      }
      if (shiftType) params.set("shiftType", shiftType);
      const activeSort = overrides?.sort ?? sort;
      if (activeSort && activeSort !== "relevance") params.set("sort", activeSort);
      const activePage = overrides?.page ?? 1;
      if (activePage > 1) params.set("page", String(activePage));
      if (location?.latitude != null && location?.longitude != null) {
        params.set("lat", String(location.latitude));
        params.set("lng", String(location.longitude));
      }
      return `/marketplace/search?${params.toString()}`;
    },
    [role, needMode, needStart, needEnd, urgency, shiftType, sort, location],
  );

  const fetchResults = useCallback(async (apiUrl: string) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const data = (await res.json()) as SearchResponse & { error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Search failed");
        setResults([]);
        setTotal(0);
        setSearched(true);
        return;
      }
      setResults(data.results);
      setTotal(data.total);
      setPage(data.page);
      setSearched(true);
    } catch {
      setApiError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = marketplaceSearchQueryFromUrl(searchParams);
    const normalizedRole = normalizeMarketplaceRoleParam(query.role);
    if (normalizedRole) setRole(normalizedRole);
    if (query.needStart) {
      setNeedStart(query.needStart);
      setNeedMode("window");
    }
    if (query.needEnd) setNeedEnd(query.needEnd);
    if (query.urgency) {
      setUrgency(query.urgency);
      setNeedMode("urgency");
    }
    if (query.shiftType) setShiftType(query.shiftType);
    setSort(query.sort);

    const hasRole = Boolean(normalizedRole);
    const hasNeed = Boolean(query.needStart && query.needEnd) || Boolean(query.urgency);
    const cookie = readLocationCookie();
    const hasLocation = Boolean(query.lat && query.lng) || Boolean(cookie?.placeId);

    if (!hasRole || !hasNeed || !hasLocation) return;

    const apiParams = new URLSearchParams(searchParams.toString());
    if (!apiParams.get("lat") && cookie) {
      apiParams.set("lat", String(cookie.latitude));
      apiParams.set("lng", String(cookie.longitude));
    }

    void fetchResults(`/api/marketplace/search?${apiParams.toString()}`);
  }, [searchParams, fetchResults]);

  const handleSubmit = useCallback(() => {
    setValidationError(null);
    setApiError(null);

    if (!role) {
      setValidationError("Select a role to search.");
      return;
    }
    if (!location?.placeId) {
      setValidationError("Set your facility location to search.");
      return;
    }
    if (needMode === "window") {
      if (!needStart || !needEnd) {
        setValidationError("Enter an availability window (start and end dates).");
        return;
      }
      if (needStart < minStartDate) {
        setValidationError("Start date cannot be in the past.");
        return;
      }
      if (needEnd < needStart) {
        setValidationError("End date must be on or after the start date.");
        return;
      }
    }
    if (needMode === "urgency" && !urgency) {
      setValidationError("Select staffing urgency.");
      return;
    }

    writeLocationCookie({
      displayName: location.displayName,
      placeId: location.placeId,
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    saveRecentMarketplaceSearch({
      role,
      roleLabel: WORKFORCE_ROLE_LABELS[role as keyof typeof WORKFORCE_ROLE_LABELS] ?? role,
      locationDisplayName: location.displayName,
    });
    setRecentSearches(readRecentMarketplaceSearches());

    router.replace(buildPageUrl({ page: 1 }), { scroll: false });
  }, [role, location, needMode, needStart, needEnd, urgency, minStartDate, buildPageUrl, router]);

  const handleSortChange = useCallback(
    (nextSort: (typeof MARKETPLACE_SORT_VALUES)[number]) => {
      setSort(nextSort);
      const params = new URLSearchParams(searchParams.toString());
      if (nextSort === "relevance") params.delete("sort");
      else params.set("sort", nextSort);
      params.delete("page");
      router.replace(`/marketplace/search?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const selectedIds = useMemo(() => new Set(cart?.professionalIds ?? []), [cart]);

  const syncCart = useCallback((next: MarketplaceRequestCart) => {
    writeMarketplaceCart(next);
    setCart(next);
  }, []);

  const handleToggleSelect = useCallback(
    (result: MarketplaceSearchResult) => {
      if (!role) return;
      const base: MarketplaceRequestCart =
        cart && cart.role === role
          ? cart
          : {
              professionalIds: [],
              role,
              needStart: needMode === "window" ? needStart : null,
              needEnd: needMode === "window" ? needEnd : null,
              urgency: needMode === "urgency" ? urgency : null,
              shiftType: shiftType || null,
              locationDisplayName: location?.displayName ?? null,
            };
      const next = toggleCartProfessional(base, result.id);
      syncCart(next);
    },
    [cart, role, needMode, needStart, needEnd, urgency, shiftType, location, syncCart],
  );

  const cartFull = (cart?.professionalIds.length ?? 0) >= MARKETPLACE_CART_MAX;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const continueHref = continueRequestHref;

  const searchForm = (
    <form
      className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-ink-800">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px] bg-white"
            required
          >
            <option value="">Select role</option>
            {WORKFORCE_PROFESSIONAL_ROLES.map((r) => (
              <option key={r} value={r}>
                {WORKFORCE_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-ink-800">Facility location</span>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="City, metro, or ZIP"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-[13px] font-medium text-ink-800">Staffing need</legend>
        <div className="flex flex-wrap gap-4 text-[13px]">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="needMode"
              checked={needMode === "window"}
              onChange={() => setNeedMode("window")}
            />
            Availability window
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="needMode"
              checked={needMode === "urgency"}
              onChange={() => setNeedMode("urgency")}
            />
            Urgency
          </label>
        </div>

        {needMode === "window" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-[12px] text-ink-600">Start date</span>
              <input
                type="date"
                value={needStart}
                min={minStartDate}
                onChange={(e) => setNeedStart(e.target.value)}
                className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] text-ink-600">End date</span>
              <input
                type="date"
                value={needEnd}
                min={needStart || minStartDate}
                onChange={(e) => setNeedEnd(e.target.value)}
                className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
              />
            </label>
          </div>
        ) : (
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px] bg-white"
          >
            <option value="">Select urgency</option>
            {MARKETPLACE_URGENCY_VALUES.map((u) => (
              <option key={u} value={u}>
                {u === "asap" ? "ASAP" : u === "this_week" ? "This week" : "Flexible"}
              </option>
            ))}
          </select>
        )}
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-ink-800">
          Shift type <span className="font-normal text-ink-500">(optional)</span>
        </span>
        <select
          value={shiftType}
          onChange={(e) => setShiftType(e.target.value)}
          className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px] bg-white"
        >
          <option value="">Any shift</option>
          {MARKETPLACE_SHIFT_TYPES.map((s) => (
            <option key={s} value={s}>
              {SHIFT_TYPE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {validationError ? (
        <p role="alert" className="text-[13px] text-rose-700">
          {validationError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Searching…" : "Search"}
        <Icon name="arrow-right" className="w-4 h-4" />
      </Button>
    </form>
  );

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-medium tracking-tight">Search professionals</h1>
      <p className="mt-2 text-[15px] text-ink-600 max-w-2xl">
        Find healthcare professionals by role, your facility location, and staffing need. Results
        only include professionals available in your area.
      </p>

      {recentSearches.length > 0 ? (
        <div className="mt-6">
          <p className="text-[12px] font-medium text-ink-600 uppercase tracking-wide">
            Recent searches
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recentSearches.map((entry) => (
              <li key={`${entry.role}-${entry.locationDisplayName}-${entry.searchedAt}`}>
                <button
                  type="button"
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] text-ink-700 hover:border-teal-300 hover:text-teal-900"
                  onClick={() => {
                    setRole(entry.role);
                    router.push(
                      `/marketplace/search?role=${encodeURIComponent(entry.role)}&urgency=flexible`,
                    );
                  }}
                >
                  {entry.roleLabel} · {entry.locationDisplayName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-8 lg:items-start">
        <div className="lg:sticky lg:top-24">{searchForm}</div>

        <div className="mt-8 lg:mt-0 min-w-0">
          {apiError ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
            >
              {apiError}
            </div>
          ) : null}

          {loading ? (
            <p className="text-[14px] text-ink-600 py-8">Loading results…</p>
          ) : null}

          {searched && !loading ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-medium tracking-tight">
                  {total === 0
                    ? "No professionals found"
                    : `${total} professional${total === 1 ? "" : "s"} available in your area`}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {total > 0 ? (
                    <label className="inline-flex items-center gap-2 text-[13px] text-ink-700">
                      <span className="text-ink-600">Sort</span>
                      <select
                        value={sort}
                        onChange={(e) =>
                          handleSortChange(
                            e.target.value as (typeof MARKETPLACE_SORT_VALUES)[number],
                          )
                        }
                        className="h-9 rounded-lg border border-ink-200 px-2 bg-white text-[13px]"
                        aria-label="Sort results"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="recently_active">Recently active</option>
                      </select>
                    </label>
                  ) : null}
                  {cart && cart.professionalIds.length > 0 ? (
                    <p className="text-[13px] text-ink-600">
                      {cart.professionalIds.length} selected (max {MARKETPLACE_CART_MAX})
                    </p>
                  ) : null}
                </div>
              </div>

              {total === 0 ? (
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-6 text-[14px] text-ink-700">
                  Try a different role, broader availability dates, or confirm your facility location
                  matches the agency service area. You can also{" "}
                  <Link href="/marketplace/categories" className="text-teal-800 hover:underline">
                    browse categories
                  </Link>
                  .
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {results.map((result) => (
                      <li key={result.id}>
                        <MarketplaceSearchResultCard
                          result={result}
                          selected={selectedIds.has(result.id)}
                          selectDisabled={cartFull}
                          onToggleSelect={() => handleToggleSelect(result)}
                        />
                      </li>
                    ))}
                  </ul>
                  <SearchPagination
                    basePath="/marketplace/search"
                    searchParams={searchParams}
                    page={page}
                    totalPages={totalPages}
                  />
                </>
              )}
            </section>
          ) : !searched && !loading ? (
            <p className="text-[14px] text-ink-500 py-8">
              Enter role, location, and staffing need, then search to see professionals in your area.
            </p>
          ) : null}
        </div>
      </div>

      {cart && cart.professionalIds.length > 0 ? (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-ink-200 bg-paper/95 backdrop-blur p-4">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[13px] text-ink-700">
              {cart.professionalIds.length} professional
              {cart.professionalIds.length === 1 ? "" : "s"} ready to request
            </p>
            <Link
              href={continueHref}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-teal-800 text-white text-[14px] font-medium hover:bg-teal-900"
            >
              Continue to request
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
