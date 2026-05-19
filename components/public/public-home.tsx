import Link from "next/link";
import { Icon } from "@/components/primitives";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";

const SECONDARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-white text-ink-900 hover:bg-ink-50 border border-ink-200";

const AUDIENCE_CARDS = [
  {
    eyebrow: "For home care",
    title: "Find in-home nursing and aide support",
    body: "Sign up with your home address, browse eligible professionals, and request agency-coordinated care — no agency invite required.",
    href: "/signup/care",
    cta: "Find home care",
    tone: "teal" as const,
  },
  {
    eyebrow: "For facilities",
    title: "Request staffing through the marketplace",
    body: "Invited facility contacts browse geo-eligible professionals and submit agency-mediated staffing requests.",
    href: "/marketplace",
    cta: "Explore marketplace",
    tone: "paper" as const,
  },
  {
    eyebrow: "For agencies",
    title: "Run workforce, compliance, and fulfillment",
    body: "Coordinate professionals, route customer requests, confirm fulfillment, and propose suggested alternatives.",
    href: "/signup",
    cta: "Agency signup",
    tone: "ink" as const,
  },
];

const PLATFORM_PILLARS = [
  {
    title: "Operations console",
    body: "Staffing requests, shifts, matching, and fulfillment review in one agency workspace.",
  },
  {
    title: "Compliance-aware workforce",
    body: "Credential tracking and marketplace visibility rules keep public listings current.",
  },
  {
    title: "Agency-mediated fulfillment",
    body: "Facilities request professionals; coordinators confirm, decline, or suggest alternatives.",
  },
];

export function PublicHome() {
  return (
    <>
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-grid opacity-50" aria-hidden />
        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-8">
          <p className="text-[11px] font-mono uppercase tracking-wider text-teal-700">
            Healthcare staffing platform
          </p>
          <h1 className="mt-4 text-[44px] sm:text-[56px] leading-[1.05] tracking-tight font-medium text-ink-900 max-w-[760px]">
            Run healthcare staffing operations —{" "}
            <span className="font-serif italic text-teal-800">with a marketplace built in.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-600 max-w-[600px]">
            AsNeeded connects agencies, facilities, and healthcare professionals. Agencies operate
            fulfillment from a live console; facilities discover professionals and submit staffing
            requests fulfilled by licensed coordinators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={PRIMARY_LINK_CLASS}>
              Agency signup
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
            <Link href="/signup/care" className={SECONDARY_LINK_CLASS}>
              Find home care
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AUDIENCE_CARDS.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border p-6 ${
                card.tone === "teal"
                  ? "border-teal-200 bg-teal-50/40"
                  : "border-ink-200 bg-white"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-500">
                {card.eyebrow}
              </p>
              <h2 className="mt-2 text-[20px] font-medium tracking-tight">{card.title}</h2>
              <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">{card.body}</p>
              <Link
                href={card.href}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-teal-800 hover:underline"
              >
                {card.cta}
                <Icon name="arrow-right" className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 border-y border-ink-200/80 py-14">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <h2 className="text-[22px] font-medium tracking-tight">One platform, two surfaces</h2>
          <p className="mt-2 text-[14px] text-ink-600 max-w-[640px]">
            The operations console and public marketplace share workforce data, eligibility rules,
            and fulfillment status — without mixing agency tools into the facility experience.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLATFORM_PILLARS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-ink-200 bg-white p-5"
              >
                <h3 className="text-[15px] font-medium tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16">
        <div className="rounded-xl border border-ink-200 bg-ink-900 text-paper p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-teal-300">
              Already working with an agency?
            </p>
            <h2 className="mt-2 text-[20px] font-medium tracking-tight">
              Sign in to your operations console
            </h2>
            <p className="mt-2 text-[14px] text-ink-300 max-w-lg">
              Agency coordinators and facility users can sign in to continue staffing work in
              progress.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-white text-ink-900 hover:bg-ink-50 border border-white shrink-0"
          >
            Sign in
            <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
