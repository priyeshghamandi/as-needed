"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/primitives";
import type {
  GeographicLocation,
  GeographicLocationSuggestion,
} from "@/lib/geographic-location";
import {
  appendServiceAreaParams,
  hasServiceAreaRestriction,
  type ServiceAreaRestrictionInput,
} from "@/lib/places/query-params";
import { OUT_OF_SERVICE_AREA_MESSAGE } from "@/lib/places/service-area-bounds";

const INPUT_BASE =
  "w-full rounded-lg border border-ink-200 bg-white tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition";

const SIZE_STYLES = {
  default: "h-11 px-3.5 text-[14px]",
  compact: "h-9 px-2.5 text-[12px]",
} as const;

const PILL_STYLES = {
  default: "h-8 pl-3 pr-1.5 text-[12px]",
  compact: "h-7 pl-2 pr-1 text-[11px]",
} as const;

export type LocationAutocompleteProps = ServiceAreaRestrictionInput & {
  value: GeographicLocation | null;
  onChange: (location: GeographicLocation | null) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
  helperText?: string;
};

function buildPlacesUrl(
  path: string,
  base: Record<string, string>,
  restriction: ServiceAreaRestrictionInput,
): string {
  const params = new URLSearchParams(base);
  appendServiceAreaParams(params, restriction);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function LocationAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = "Search city, metro, or ZIP",
  size = "default",
  className = "",
  helperText,
  restrictedToServiceArea = false,
  serviceAreaCenterLat,
  serviceAreaCenterLng,
  serviceAreaRadiusMiles,
}: LocationAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const restriction: ServiceAreaRestrictionInput = {
    restrictedToServiceArea,
    serviceAreaCenterLat,
    serviceAreaCenterLng,
    serviceAreaRadiusMiles,
  };

  const isRestricted = hasServiceAreaRestriction(restriction);
  const restrictionReady = !restrictedToServiceArea || isRestricted;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeographicLocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [usingMock, setUsingMock] = useState(false);
  const [areaError, setAreaError] = useState<string | null>(null);

  const resolvedHelperText =
    helperText ??
    (restrictedToServiceArea
      ? "Search within your agency's service area."
      : undefined);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!restrictionReady) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      if (q.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      setAreaError(null);
      try {
        const url = buildPlacesUrl(
          "/api/places/autocomplete",
          { q: q.trim() },
          restriction,
        );
        const res = await fetch(url);
        const data = (await res.json()) as {
          suggestions?: GeographicLocationSuggestion[];
          source?: string;
        };
        setSuggestions(data.suggestions ?? []);
        setUsingMock(data.source === "mock");
        setOpen((data.suggestions?.length ?? 0) > 0);
        setHighlightIndex(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [restriction, restrictionReady],
  );

  useEffect(() => {
    if (value || disabled || !restrictionReady) return;
    const t = setTimeout(() => {
      void fetchSuggestions(query);
    }, 280);
    return () => clearTimeout(t);
  }, [query, value, disabled, restrictionReady, fetchSuggestions]);

  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  async function selectSuggestion(s: GeographicLocationSuggestion) {
    setOpen(false);
    setQuery("");
    setSuggestions([]);
    setLoadingDetails(true);
    setAreaError(null);
    try {
      const url = buildPlacesUrl(
        "/api/places/details",
        { placeId: s.placeId },
        restriction,
      );
      const res = await fetch(url);
      const data = (await res.json()) as {
        area?: GeographicLocation;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (res.status === 422 && data.code === "OUT_OF_SERVICE_AREA") {
          setAreaError(data.error ?? OUT_OF_SERVICE_AREA_MESSAGE);
          onChange(null);
          return;
        }
        throw new Error("details failed");
      }

      if (!data.area) {
        throw new Error("missing area");
      }

      if (isRestricted) {
        const validateRes = await fetch("/api/places/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: data.area,
            centerLat: serviceAreaCenterLat,
            centerLng: serviceAreaCenterLng,
            radiusMiles: serviceAreaRadiusMiles,
          }),
        });
        if (!validateRes.ok) {
          const validateData = (await validateRes.json()) as { error?: string };
          setAreaError(validateData.error ?? OUT_OF_SERVICE_AREA_MESSAGE);
          onChange(null);
          return;
        }
      }

      onChange(data.area);
    } catch {
      onChange(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  function removeSelection() {
    onChange(null);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setAreaError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      const idx = highlightIndex >= 0 ? highlightIndex : 0;
      void selectSuggestion(suggestions[idx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputDisabled =
    disabled || !!value || loadingDetails || (restrictedToServiceArea && !restrictionReady);
  const inputClass = `${INPUT_BASE} ${SIZE_STYLES[size]} ${inputDisabled ? "bg-ink-50 text-ink-500 cursor-not-allowed" : areaError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""} ${loading || loadingDetails ? "pr-9" : ""}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {resolvedHelperText && (
        <p className="mb-1 text-[10px] font-mono text-ink-500">{resolvedHelperText}</p>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-invalid={areaError ? true : undefined}
          aria-describedby={areaError ? `${listId}-error` : undefined}
          disabled={inputDisabled}
          value={value ? "" : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setAreaError(null);
            if (value) onChange(null);
          }}
          onFocus={() => {
            if (!value && suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            restrictedToServiceArea && !restrictionReady
              ? "Service area unavailable"
              : placeholder
          }
          className={inputClass}
          autoComplete="off"
        />
        {(loading || loadingDetails) && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon
              name="loader-2"
              className={size === "compact" ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"}
            />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && !value && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full min-w-[220px] max-h-56 overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-lifted py-1 scrollarea"
        >
          {usingMock && (
            <li className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink-400 border-b border-ink-100">
              Demo suggestions · add GOOGLE_PLACES_API_KEY for live search
              {isRestricted ? " · within service area" : ""}
            </li>
          )}
          {suggestions.map((s, i) => (
            <li key={s.placeId} role="option" aria-selected={i === highlightIndex}>
              <button
                type="button"
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => void selectSuggestion(s)}
                className={`w-full text-left px-3 py-2 transition ${
                  size === "compact" ? "py-1.5" : "py-2.5"
                } ${i === highlightIndex ? "bg-teal-50" : "hover:bg-ink-50"}`}
              >
                <div
                  className={`font-medium tracking-tight text-ink-900 ${size === "compact" ? "text-[12px]" : "text-[13px]"}`}
                >
                  {s.label}
                </div>
                {s.secondary && (
                  <div
                    className={`font-mono text-ink-500 mt-0.5 ${size === "compact" ? "text-[10px]" : "text-[11px]"}`}
                  >
                    {s.secondary}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-medium tracking-tight max-w-full ${PILL_STYLES[size]}`}
          >
            <Icon
              name="map-pin"
              className={size === "compact" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"}
            />
            <span className="truncate">{value.displayName}</span>
            <button
              type="button"
              onClick={removeSelection}
              disabled={disabled}
              className={`shrink-0 rounded-full inline-flex items-center justify-center text-teal-700 hover:bg-teal-100 hover:text-teal-900 disabled:opacity-50 ${
                size === "compact" ? "w-5 h-5" : "w-6 h-6"
              }`}
              aria-label={`Remove ${value.displayName}`}
            >
              <Icon name="x" className={size === "compact" ? "w-3 h-3" : "w-3.5 h-3.5"} />
            </button>
          </span>
        </div>
      )}

      {areaError && (
        <p
          id={`${listId}-error`}
          className="mt-1.5 text-[11px] font-mono text-rose-600"
          role="alert"
        >
          {areaError}
        </p>
      )}
    </div>
  );
}
