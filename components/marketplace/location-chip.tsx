"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/primitives";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import type { GeographicLocation } from "@/lib/geographic-location";
import {
  MARKETPLACE_LOCATION_COOKIE,
  MARKETPLACE_LOCATION_MAX_AGE,
  parseMarketplaceLocationCookie,
  serializeMarketplaceLocationCookie,
  type MarketplaceLocationCookie,
} from "@/lib/marketplace/location-cookie";

function readCookie(): MarketplaceLocationCookie | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${MARKETPLACE_LOCATION_COOKIE}=`));
  if (!match) return null;
  const raw = decodeURIComponent(match.split("=").slice(1).join("="));
  return parseMarketplaceLocationCookie(raw);
}

function writeCookie(location: MarketplaceLocationCookie) {
  const value = encodeURIComponent(serializeMarketplaceLocationCookie(location));
  document.cookie = `${MARKETPLACE_LOCATION_COOKIE}=${value}; path=/; max-age=${MARKETPLACE_LOCATION_MAX_AGE}; samesite=lax`;
}

export function LocationChip() {
  const [location, setLocation] = useState<MarketplaceLocationCookie | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GeographicLocation | null>(null);

  useEffect(() => {
    setLocation(readCookie());
  }, []);

  const save = useCallback((loc: GeographicLocation | null) => {
    if (!loc?.placeId) return;
    const stored: MarketplaceLocationCookie = {
      displayName: loc.displayName,
      placeId: loc.placeId,
      city: loc.city,
      state: loc.state,
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
    writeCookie(stored);
    setLocation(stored);
    setOpen(false);
    window.location.reload();
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(
            location
              ? {
                  ...location,
                  country: "US",
                }
              : null,
          );
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] text-ink-700 hover:bg-ink-50 max-w-[200px] sm:max-w-none"
      >
        <Icon name="map-pin" className="w-3.5 h-3.5 shrink-0 text-ink-500" />
        <span className="truncate">
          {location ? location.displayName : "Set facility location"}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 space-y-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-location-title"
      >
        <h2 id="marketplace-location-title" className="text-[16px] font-medium">
          Your facility location
        </h2>
        <p className="text-[13px] text-ink-600">
          We use this to show healthcare professionals available in your area.
        </p>
        <LocationAutocomplete
          value={draft}
          onChange={setDraft}
          placeholder="Search city, metro, or ZIP"
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="h-9 px-3 text-[13px]" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft?.placeId}
            className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] disabled:opacity-50"
            onClick={() => save(draft)}
          >
            Save location
          </button>
        </div>
      </div>
    </div>
  );
}
