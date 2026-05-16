"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/primitives";
import type { ServiceArea, ServiceAreaSuggestion } from "@/lib/service-area";

const INPUT_CLASS =
  "w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition";

type ServiceAreaAutocompleteProps = {
  value: ServiceArea | null;
  onChange: (area: ServiceArea | null) => void;
  disabled?: boolean;
};

export function ServiceAreaAutocomplete({
  value,
  onChange,
  disabled = false,
}: ServiceAreaAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ServiceAreaSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [usingMock, setUsingMock] = useState(false);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q.trim())}`);
      const data = (await res.json()) as {
        suggestions?: ServiceAreaSuggestion[];
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
  }, []);

  useEffect(() => {
    if (value || disabled) return;
    const t = setTimeout(() => {
      void fetchSuggestions(query);
    }, 280);
    return () => clearTimeout(t);
  }, [query, value, disabled, fetchSuggestions]);

  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  async function selectSuggestion(s: ServiceAreaSuggestion) {
    setOpen(false);
    setQuery("");
    setSuggestions([]);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(s.placeId)}`);
      if (!res.ok) throw new Error("details failed");
      const data = (await res.json()) as { area: ServiceArea };
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

  const inputDisabled = disabled || !!value || loadingDetails;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          disabled={inputDisabled}
          value={value ? "" : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => {
            if (!value && suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search city, metro, state, or ZIP"
          className={`${INPUT_CLASS} ${inputDisabled ? "bg-ink-50 text-ink-500 cursor-not-allowed" : ""} ${loading || loadingDetails ? "pr-10" : ""}`}
          autoComplete="off"
        />
        {(loading || loadingDetails) && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon name="loader-2" className="w-4 h-4 animate-spin" />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && !value && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-lifted py-1 scrollarea"
        >
          {usingMock && (
            <li className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink-400 border-b border-ink-100">
              Demo suggestions · add GOOGLE_PLACES_API_KEY for live search
            </li>
          )}
          {suggestions.map((s, i) => (
            <li key={s.placeId} role="option" aria-selected={i === highlightIndex}>
              <button
                type="button"
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => void selectSuggestion(s)}
                className={`w-full text-left px-3 py-2.5 transition ${
                  i === highlightIndex ? "bg-teal-50" : "hover:bg-ink-50"
                }`}
              >
                <div className="text-[13px] font-medium tracking-tight text-ink-900">{s.label}</div>
                {s.secondary && (
                  <div className="text-[11px] font-mono text-ink-500 mt-0.5">{s.secondary}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[12px] font-medium tracking-tight max-w-full">
            <Icon name="map-pin" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{value.displayName}</span>
            <button
              type="button"
              onClick={removeSelection}
              disabled={disabled}
              className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-teal-700 hover:bg-teal-100 hover:text-teal-900 disabled:opacity-50"
              aria-label={`Remove ${value.displayName}`}
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}