import Link from "next/link";
import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";
import { Icon } from "@/components/primitives";

export function MarketplaceSearchResultCard({
  result,
  selected,
  onToggleSelect,
  selectDisabled,
}: {
  result: MarketplaceSearchResult;
  selected: boolean;
  onToggleSelect: () => void;
  selectDisabled: boolean;
}) {
  const locationLine = [result.city, result.state].filter(Boolean).join(", ");

  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5 flex flex-col sm:flex-row gap-4">
      <div className="flex items-start gap-3 sm:flex-col sm:items-center">
        <label className="inline-flex items-center gap-2 text-[13px] text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            disabled={selectDisabled && !selected}
            onChange={onToggleSelect}
            className="rounded border-ink-300"
            aria-label={`Select ${result.displayName}`}
          />
          <span className="sm:hidden">Select</span>
        </label>
        <div
          className="w-14 h-14 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center text-[15px] font-medium shrink-0"
          aria-hidden
        >
          {result.displayName
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("")}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-ink-500">{result.roleLabel}</p>
        <h2 className="text-[18px] font-medium tracking-tight">{result.displayName}</h2>
        <p className="mt-1 text-[14px] text-ink-700">{result.headline}</p>
        {result.availabilityLabel ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-teal-800 bg-teal-50 border border-teal-200/70 rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden />
            {result.availabilityLabel}
          </p>
        ) : null}
        <p className="mt-2 text-[12px] text-ink-500">
          Fulfilled by {result.agencyName}
          {locationLine ? ` · ${locationLine}` : ""}
        </p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0">
        <Link
          href={`/marketplace/professionals/${result.publicSlug}`}
          className="inline-flex items-center gap-1 text-[13px] text-teal-800 hover:underline"
        >
          View profile
          <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
