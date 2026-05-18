"use client";

import Link from "next/link";
import { MarketplaceLocationPrompt } from "@/components/marketplace/marketplace-location-prompt";
import { Icon } from "@/components/primitives";
import type { MarketplaceCategory } from "@/lib/marketplace/categories";

const TRUST_SIGNALS = [
  {
    title: "Location-first discovery",
    body: "Search and category listings only show professionals available in your facility area.",
  },
  {
    title: "Agency-mediated fulfillment",
    body: "You request staffing — licensed agencies coordinate contracts, scheduling, and shifts.",
  },
  {
    title: "Compliance-aware visibility",
    body: "Agencies control which professionals appear on the marketplace and keep credentials current.",
  },
];

const FAQ = [
  {
    q: "Who fulfills staffing requests?",
    a: "Licensed healthcare staffing agencies employ and coordinate professionals. Agency coordinators review each request and confirm fulfillment.",
  },
  {
    q: "Am I hiring professionals directly?",
    a: "No. You request professionals through the platform. Agencies handle contracts, scheduling, and coordination.",
  },
  {
    q: "Can I message professionals directly?",
    a: "Not in the current release. You coordinate through agency coordinators assigned to your request.",
  },
  {
    q: "How accurate is availability shown?",
    a: "Public profiles show approximate availability only — not exact schedules. Final confirmation comes from the agency.",
  },
  {
    q: "Which regions are supported?",
    a: "You only see professionals available in your selected facility location and the agency service areas that cover it.",
  },
];

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";

const SECONDARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-white text-ink-900 hover:bg-ink-50 border border-ink-200";

export function MarketplaceHome({ categories }: { categories: MarketplaceCategory[] }) {
  return (
    <>
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-grid opacity-50" aria-hidden />
        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-8">
          <p className="text-[11px] font-mono uppercase tracking-wider text-teal-700">
            Healthcare staffing marketplace
          </p>
          <h1 className="mt-4 text-[44px] sm:text-[56px] leading-[1.05] tracking-tight font-medium text-ink-900 max-w-[720px]">
            Find healthcare professionals for your facility —{" "}
            <span className="font-serif italic text-teal-800">fulfilled by agencies.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-600 max-w-[560px]">
            Search by role and location, browse category listings, view public profiles, and
            submit staffing requests. Agency coordinators confirm fulfillment or suggest
            alternatives.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace/search" className={PRIMARY_LINK_CLASS}>
              Search by role and location
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
            <Link href="/marketplace/categories" className={SECONDARY_LINK_CLASS}>
              Browse categories
            </Link>
          </div>
          <MarketplaceLocationPrompt />
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_SIGNALS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-ink-200 bg-white p-5"
            >
              <h2 className="text-[15px] font-medium tracking-tight">{item.title}</h2>
              <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">
            Popular roles
          </h2>
          <Link href="/marketplace/categories" className="text-[13px] text-teal-800 hover:underline">
            View all categories →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace/categories/${cat.slug}`}
              className="rounded-xl border border-ink-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition"
            >
              <span className="text-[15px] font-medium tracking-tight">{cat.name}</span>
              {cat.description ? (
                <span className="mt-2 block text-[12px] text-ink-600 line-clamp-2">
                  {cat.description}
                </span>
              ) : null}
              <span className="mt-2 block text-[12px] text-teal-800">View professionals →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 border-y border-ink-200/80 py-14">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <h2 className="text-[22px] font-medium tracking-tight">How it works</h2>
          <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Discover",
                body: "Set your facility location, then search or browse by role. Only geo-eligible professionals appear.",
              },
              {
                step: "2",
                title: "Request professional",
                body: "View public profiles and select preferred professionals for a staffing request — not a direct hire.",
              },
              {
                step: "3",
                title: "Agency fulfills",
                body: "The owning agency reviews your request, confirms or suggests an alternative, and coordinates the shift.",
              },
            ].map((item) => (
              <li key={item.step} className="space-y-2">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-ink-900 text-paper text-[13px] font-mono">
                  {item.step}
                </span>
                <h3 className="text-[16px] font-medium">{item.title}</h3>
                <p className="text-[14px] text-ink-600 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-12">
        <div className="rounded-xl border border-ink-200 bg-ink-900 text-paper p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-teal-300">
              For staffing agencies
            </p>
            <h2 className="mt-2 text-[20px] font-medium tracking-tight">
              Run workforce, compliance, and fulfillment operations
            </h2>
            <p className="mt-2 text-[14px] text-ink-300 max-w-lg">
              Manage professionals, control marketplace visibility, and coordinate staffing
              requests from facilities in your service area.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-teal-700 text-white hover:bg-teal-800 border border-teal-700 shrink-0"
          >
            Agency signup
            <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16">
        <h2 className="text-[22px] font-medium tracking-tight mb-6">Common questions</h2>
        <dl className="space-y-4 max-w-[720px]">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-ink-200 bg-white p-5"
            >
              <dt className="text-[15px] font-medium">{item.q}</dt>
              <dd className="mt-2 text-[14px] text-ink-600 leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
