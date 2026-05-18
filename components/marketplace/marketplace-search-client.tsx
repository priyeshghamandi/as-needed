"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { MarketplaceSearchResultCard } from "@/components/marketplace/marketplace-search-result-card";
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
  MARKETPLACE_CART_MAX,
  readMarketplaceCart,
  toggleCartProfessional,
  writeMarketplaceCart,
  type MarketplaceRequestCart,
} from "@/lib/marketplace/marketplace-cart";
import {
  MARKETPLACE_URGENCY_VALUES,
  marketplaceSearchQueryFromUrl,
  normalizeMarketplaceRoleParam,
} from "@/lib/marketplace/search-params";
import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";
import {
  WORKFORCE_PROFESSIONAL_ROLES,
  WORKFORCE_ROLE_LABELS,
} from "@/lib/validations/workforce-professional";

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

type SearchResponse = {
  results: MarketplaceSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

export function MarketplaceSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = normalizeMarketplaceRoleParam(searchParams.get("role")) ?? "";
  const initialNeedStart = searchParams.get("needStart") ?? "";
  const initialNeedEnd = searchParams.get("needEnd") ?? "";
  const initialUrgency = searchParams.get("urgency") ?? "";
  const needModeFromUrl = initialNeedStart || initialNeedEnd ? "window" : "urgency";

  const [role, setRole] = useState(initialRole);
  const [location, setLocation] = useState<GeographicLocation | null>(null);
  const [needMode, setNeedMode] = useState<"window" | "urgency">(needModeFromUrl);
  const [needStart, setNeedStart] = useState(initialNeedStart);
  const [needEnd, setNeedEnd] = useState(initialNeedEnd);
  const [urgency, setUrgency] = useState(initialUrgency);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketplaceSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [cart, setCart] = useState<MarketplaceRequestCart | null>(null);

  useEffect(() => {
    const cookie = readLocationCookie();
    if (cookie) setLocation(toGeographicLocation(cookie));
    setCart(readMarketplaceCart());
  }, []);

  const buildPageUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (needMode === "window") {
      if (needStart) params.set("needStart", needStart);
      if (needEnd) params.set("needEnd", needEnd);
    } else if (urgency) {
      params.set("urgency", urgency);
    }
    if (location?.latitude != null && location?.longitude != null) {
      params.set("lat", String(location.latitude));
      params.set("lng", String(location.longitude));
    }
    return `/marketplace/search?${params.toString()}`;
  }, [role, needMode, needStart, needEnd, urgency, location]);

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
    if (needMode === "window" && (!needStart || !needEnd)) {
      setValidationError("Enter an availability window (start and end dates).");
      return;
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

    router.replace(buildPageUrl(), { scroll: false });
  }, [role, location, needMode, needStart, needEnd, urgency, buildPageUrl, router]);

  const selectedIds = useMemo(() => new Set(cart?.professionalIds ?? []), [cart]);

  const syncCart = useCallback(
    (next: MarketplaceRequestCart) => {
      writeMarketplaceCart(next);
      setCart(next);
    },
    [],
  );

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
              locationDisplayName: location?.displayName ?? null,
            };
      const next = toggleCartProfessional(base, result.id);
      syncCart(next);
    },
    [cart, role, needMode, needStart, needEnd, urgency, location, syncCart],
  );

  const cartFull = (cart?.professionalIds.length ?? 0) >= MARKETPLACE_CART_MAX;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-medium tracking-tight">Search professionals</h1>
      <p className="mt-2 text-[15px] text-ink-600 max-w-2xl">
        Find healthcare professionals by role, your facility location, and staffing need.
        Results only include professionals available in your area.
      </p>

      <form
        className="mt-8 rounded-xl border border-ink-200 bg-white p-5 sm:p-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <label className="block space-y-1.5 md:col-span-2">
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
                  onChange={(e) => setNeedStart(e.target.value)}
                  className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-ink-600">End date</span>
                <input
                  type="date"
                  value={needEnd}
                  onChange={(e) => setNeedEnd(e.target.value)}
                  className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
                />
              </label>
            </div>
          ) : (
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full sm:w-64 h-11 rounded-lg border border-ink-200 px-3 text-[14px] bg-white"
            >
              <option value="">Select urgency</option>
              {MARKETPLACE_URGENCY_VALUES.map((u) => (
                <option key={u} value={u}>
                  {u === "asap"
                    ? "ASAP"
                    : u === "this_week"
                      ? "This week"
                      : "Flexible"}
                </option>
              ))}
            </select>
          )}
        </fieldset>

        {validationError ? (
          <p role="alert" className="text-[13px] text-rose-700">
            {validationError}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
          <Icon name="arrow-right" className="w-4 h-4" />
        </Button>
      </form>

      {apiError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
        >
          {apiError}
        </div>
      ) : null}

      {searched && !loading ? (
        <section className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-medium tracking-tight">
              {total === 0
                ? "No professionals found"
                : `${total} professional${total === 1 ? "" : "s"} available in your area`}
            </h2>
            {cart && cart.professionalIds.length > 0 ? (
              <p className="text-[13px] text-ink-600">
                {cart.professionalIds.length} selected (max {MARKETPLACE_CART_MAX})
              </p>
            ) : null}
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
          )}
        </section>
      ) : null}

      {cart && cart.professionalIds.length > 0 ? (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-ink-200 bg-paper/95 backdrop-blur p-4">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[13px] text-ink-700">
              {cart.professionalIds.length} professional
              {cart.professionalIds.length === 1 ? "" : "s"} ready to request
            </p>
            <Button
              as={Link}
              href={`/login?callbackUrl=${encodeURIComponent("/facility/requests")}`}
              variant="primary"
            >
              Continue to request
              <Icon name="arrow-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
