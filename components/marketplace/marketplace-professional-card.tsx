import Link from "next/link";
import type { MarketplaceSearchResult } from "@/lib/marketplace/search-results";
import { Icon } from "@/components/primitives";

const SECONDARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-9 px-4 text-[13px] bg-white text-ink-900 hover:bg-ink-50 border border-ink-200";

/** Public professional card for category listings (Module 16). */
export function MarketplaceProfessionalCard({
  result,
}: {
  result: MarketplaceSearchResult;
}) {
  const locationLine = [result.city, result.state].filter(Boolean).join(", ");
  const profileHref = `/marketplace/professionals/${result.publicSlug}`;
  const requestHref = `/login?callbackUrl=${encodeURIComponent(
    `${profileHref}?professionalId=${result.id}`,
  )}`;

  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5 flex flex-col sm:flex-row gap-4">
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

      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-ink-500">{result.roleLabel}</p>
        <h2 className="text-[18px] font-medium tracking-tight">{result.displayName}</h2>
        {result.specialty ? (
          <p className="mt-0.5 text-[13px] text-ink-600">{result.specialty}</p>
        ) : null}
        <p className="mt-1 text-[14px] text-ink-700">{result.headline}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {result.availabilityLabel ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-teal-800 bg-teal-50 border border-teal-200/70 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden />
              {result.availabilityLabel}
            </span>
          ) : null}
          {result.yearsExperienceLabel ? (
            <span className="inline-flex text-[12px] text-ink-600 bg-ink-50 border border-ink-200 rounded-full px-2.5 py-0.5">
              {result.yearsExperienceLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[12px] text-ink-500">
          Staffing via partner agency · {result.agencyName}
          {locationLine ? ` · ${locationLine}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end justify-end gap-2 shrink-0">
        <Link href={profileHref} className={SECONDARY_LINK_CLASS}>
          View profile
          <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </Link>
        <Link href={requestHref} className={SECONDARY_LINK_CLASS}>
          Request professional
        </Link>
      </div>
    </article>
  );
}

/** @deprecated Use MarketplaceProfessionalCard */
export { MarketplaceProfessionalCard as MarketplaceProfessionalListingCard };
