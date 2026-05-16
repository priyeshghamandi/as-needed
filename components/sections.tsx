"use client";

import { useState } from "react";
import {
  Icon,
  Button,
  Badge,
  Dot,
  Eyebrow,
  SectionLabel,
  Avatar,
  AvatarStack,
} from "@/components/primitives";
import { HeroDashboard } from "@/components/dashboard";

// ────────────────────────────────────────────────────────────────────────────
// Top nav
// ────────────────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/80 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-8 h-14 flex items-center gap-8">
        <a className="flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 ml-1 px-1.5 py-0.5 border border-ink-200 rounded">ops</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 text-[13px] text-ink-700">
          {["Platform","For agencies","For professionals","For facilities","Pricing","Company"].map(l => (
            <a key={l} className="px-3 py-1.5 rounded-full hover:bg-ink-100 cursor-pointer">{l}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a className="text-[13px] text-ink-700 hover:underline px-2">Sign in</a>
          <Button as="a" href="/signup" size="sm" variant="primary">
            Sign up now <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Hero
// ────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-14 pb-24 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-x-0 top-0 h-[680px] bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[680px] bg-gradient-to-b from-paper/0 via-paper/60 to-paper" aria-hidden />

      <div className="relative max-w-[1240px] mx-auto px-8">
        {/* Eyebrow */}
        <div className="flex items-center justify-between">
          <Eyebrow>01 · Operational platform</Eyebrow>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-ink-500">
            <Dot tone="green" pulse />
            <span>14,820 shifts coordinated this week</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 mt-8">
          <div className="col-span-12 lg:col-span-7">
            <h1 className="text-[64px] leading-[1.02] tracking-[-0.02em] font-medium text-ink-900">
              Run your healthcare<br/>
              staffing operations<br/>
              <span className="font-serif italic text-teal-800">in real time.</span>
            </h1>
            <p className="mt-6 text-[18px] leading-[1.5] text-ink-600 max-w-[600px]">
              Coordinate RN availability, fulfill staffing requests faster, manage compliance,
              and keep agencies, healthcare professionals, and facilities connected — from one
              operational platform.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button as="a" href="/signup" size="lg" variant="primary">
                Sign up now <Icon name="arrow-right" className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="secondary">
                <Icon name="play-circle" className="w-4 h-4" /> See platform overview
              </Button>
            </div>

            {/* Connection strip */}
            <div className="mt-10 flex items-center gap-3 text-[12px] font-mono text-ink-600">
              <RoleChip icon="building-2" label="Facility" tone="ink" />
              <ArrowFlow />
              <RoleChip icon="briefcase-medical" label="Agency" tone="teal" emphasized />
              <ArrowFlow />
              <RoleChip icon="stethoscope" label="Professional" tone="ink" />
            </div>
            <div className="mt-3 text-[11px] font-mono text-ink-500">
              One operational backbone for all three.
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 hidden lg:block">
            <HeroSideStats />
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 rise-in">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function RoleChip({ icon, label, tone = "ink", emphasized = false }: { icon: string; label: string; tone?: "ink" | "teal"; emphasized?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 h-9 rounded-full border ${
      emphasized ? "bg-teal-700 text-white border-teal-700" : "bg-white text-ink-800 border-ink-200"
    }`}>
      <Icon name={icon} className="w-3.5 h-3.5" />
      <span className="tracking-tight">{label}</span>
    </div>
  );
}

function ArrowFlow() {
  return (
    <svg width="36" height="10" viewBox="0 0 36 10" fill="none" className="text-ink-400">
      <line x1="0" y1="5" x2="30" y2="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M28 1 L34 5 L28 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function HeroSideStats() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
        <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Median time-to-fill</div>
        <div className="flex items-baseline gap-2 mt-1">
          <div className="text-[44px] font-semibold tracking-tight tabular-nums">11<span className="text-ink-400">m</span></div>
          <Badge tone="green">−42% vs phone</Badge>
        </div>
        <Sparkline />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Fill rate</div>
          <div className="text-[28px] font-semibold tracking-tight">93<span className="text-ink-400 text-[18px]">%</span></div>
          <div className="text-[10px] font-mono text-emerald-700">+6 pts WoW</div>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">No-shows</div>
          <div className="text-[28px] font-semibold tracking-tight">1.4<span className="text-ink-400 text-[18px]">%</span></div>
          <div className="text-[10px] font-mono text-emerald-700">−3.1 pts</div>
        </div>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-ink-900 text-paper p-5 shadow-card">
        <div className="text-[11px] font-mono uppercase tracking-wider text-paper/50">Active right now</div>
        <div className="mt-2 flex items-center gap-3">
          <Dot tone="green" pulse />
          <div>
            <div className="text-[15px] tracking-tight">A. Martinez accepted ICU shift</div>
            <div className="text-[11px] font-mono text-paper/60">Mercy Mt. Sinai · 19:00 · 12s ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline() {
  const pts = [22,18,17,19,15,14,12,13,11,10,11,11];
  const w = 220, h = 44, max = Math.max(...pts), min = Math.min(...pts);
  const path = pts.map((v,i) => `${i===0?"M":"L"} ${(i/(pts.length-1))*w} ${h - ((v-min)/(max-min))*h}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-3 text-teal-700">
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="currentColor" opacity="0.08" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Logo bar / trust
// ────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  const names = [
    "Mercy Mt. Sinai", "Bayview Care", "Pinegrove SNF", "Northridge Health",
    "Ridgecrest Medical", "Coastline Hospice", "Summit Pediatrics", "Lakeshore Rehab"
  ];
  return (
    <section className="border-y border-ink-200/70 bg-white">
      <div className="max-w-[1240px] mx-auto px-8 py-6 flex items-center gap-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink-500 whitespace-nowrap">
          Trusted by staffing operations at
        </div>
        <div className="flex-1 overflow-hidden mask-fade">
          <div className="flex gap-10 marquee-track w-max">
            {[...names, ...names].map((n, i) => (
              <div key={i} className="flex items-center gap-2 text-ink-500">
                <span className="w-5 h-5 rounded bg-ink-200/70 inline-flex items-center justify-center text-[10px] font-mono text-ink-700">+</span>
                <span className="text-[14px] tracking-tight whitespace-nowrap">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`.mask-fade { mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%); }`}</style>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Operational chaos
// ────────────────────────────────────────────────────────────────────────────
function Problems() {
  const items = [
    { icon: "phone-call",     title: "Endless calls and texts",        sub: "Coordinators chasing 30+ RNs to fill one shift." },
    { icon: "calendar-x-2",   title: "Last-minute cancellations",      sub: "No structured way to recover and rebook." },
    { icon: "eye-off",        title: "No visibility into availability",sub: "Static spreadsheets, stale data, blind dispatch." },
    { icon: "clipboard-list", title: "Manual coordination",            sub: "Whiteboards, group chats, and sticky notes." },
    { icon: "shield-alert",   title: "Compliance uncertainty",         sub: "Credentials missed until audit, not before." },
    { icon: "timer-off",      title: "Slow shift fulfillment",         sub: "Hours-long fill times for predictable shifts." },
    { icon: "siren",          title: "Staffing emergencies",           sub: "5am scrambles every weekend, every weekend." },
  ];
  return (
    <section className="relative py-28">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="02" label="The current state" />
        <div className="mt-6 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-7 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
            Healthcare staffing is run on
            <span className="font-serif italic text-ink-500"> phone calls, group texts, </span>
            and best guesses.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[16px] text-ink-600 leading-relaxed lg:max-w-md">
            Agencies are coordinating people, shifts, and credentials in real time —
            with tools that weren't built for it. The chaos is operational, not strategic.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-3">
          {items.map((it, i) => (
            <div
              key={i}
              className={`col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-teal-300 ${
                i === 6 ? "lg:col-span-3" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-md bg-rose-50 text-rose-700 inline-flex items-center justify-center">
                  <Icon name={it.icon} className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[14px] font-medium tracking-tight">{it.title}</div>
                  <div className="mt-1 text-[12px] text-ink-500 leading-relaxed">{it.sub}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-span-12 lg:col-span-3 rounded-xl border border-dashed border-teal-400 bg-teal-50/40 p-5 flex flex-col justify-between">
            <div>
              <Eyebrow>The fix</Eyebrow>
              <div className="mt-2 text-[15px] tracking-tight font-medium leading-snug">
                One operational platform that holds it all together.
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-mono text-teal-800">
              See how AsNeeded does it <Icon name="arrow-right" className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Platform overview — Facilities → Agencies → Professionals
// ────────────────────────────────────────────────────────────────────────────
function PlatformOverview() {
  return (
    <section className="relative py-28 bg-white border-y border-ink-200/70">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-12 items-end">
          <div className="col-span-12 lg:col-span-7">
            <SectionLabel index="03" label="Platform overview" />
            <h2 className="mt-4 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
              A centralized workforce coordination system
              <span className="font-serif italic text-teal-800"> for healthcare staffing agencies.</span>
            </h2>
          </div>
          <p className="col-span-12 lg:col-span-5 text-[16px] text-ink-600 leading-relaxed">
            Facilities submit demand. Agencies orchestrate the response. Professionals deliver
            the care. Every signal flows through one system of record — in real time.
          </p>
        </div>

        <OrchestrationDiagram />
      </div>
    </section>
  );
}

function OrchestrationDiagram() {
  return (
    <div className="mt-16 relative">
      <svg
        viewBox="0 0 1140 360"
        className="w-full h-[360px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0f7975" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#0f7975" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0f7975" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Connectors */}
        <path d="M 240 180 C 380 180, 380 100, 570 100" stroke="url(#line)" strokeWidth="1.5" fill="none" className="dash-flow" />
        <path d="M 240 180 C 380 180, 380 180, 570 180" stroke="url(#line)" strokeWidth="1.5" fill="none" />
        <path d="M 240 180 C 380 180, 380 260, 570 260" stroke="url(#line)" strokeWidth="1.5" fill="none" className="dash-flow" />
        <path d="M 700 100 C 820 100, 820 180, 900 180" stroke="url(#line)" strokeWidth="1.5" fill="none" className="dash-flow" />
        <path d="M 700 180 C 820 180, 820 180, 900 180" stroke="url(#line)" strokeWidth="1.5" fill="none" />
        <path d="M 700 260 C 820 260, 820 180, 900 180" stroke="url(#line)" strokeWidth="1.5" fill="none" className="dash-flow" />
      </svg>

      {/* Layer columns positioned absolutely on top of svg */}
      <div className="absolute inset-0 grid grid-cols-3 items-stretch">
        <ColumnGroup
          title="Facilities"
          subtitle="Hospitals, SNFs, clinics"
          icon="building-2"
          tone="ink"
          rows={[
            { label: "Mercy Mt. Sinai · ICU", meta: "needs 3 RN · tonight" },
            { label: "Bayview Care · Med-Surg", meta: "needs 4 RN · tomorrow" },
            { label: "Pinegrove SNF · Floor 2", meta: "needs 2 CNA · tomorrow" },
          ]}
        />
        <ColumnGroup
          title="Agency operations"
          subtitle="Coordinators, recruiters, compliance"
          icon="briefcase-medical"
          tone="teal"
          emphasized
          rows={[
            { label: "Auto-match · 7 candidates", meta: "compliance ✓" },
            { label: "Offers sent · 5 push, 2 sms", meta: "live · 18:54" },
            { label: "Cancellation recovery", meta: "queue · 2" },
          ]}
        />
        <ColumnGroup
          title="Healthcare professionals"
          subtitle="RNs, CNAs, EMTs"
          icon="stethoscope"
          tone="ink"
          rows={[
            { label: "A. Martinez · RN ICU", meta: "available · 3.2 mi" },
            { label: "K. Park · CNA", meta: "available · 5.8 mi" },
            { label: "S. Nguyen · RN ICU", meta: "available · 7.1 mi" },
          ]}
        />
      </div>
    </div>
  );
}

function ColumnGroup({ title, subtitle, icon, tone, emphasized = false, rows }: any) {
  return (
    <div className="px-2 flex flex-col">
      <div className={`rounded-xl px-4 py-3 ${emphasized ? "bg-teal-700 text-white shadow-lifted" : "bg-paper border border-ink-200"}`}>
        <div className="flex items-center gap-2">
          <Icon name={icon} className="w-4 h-4" />
          <div className="text-[13px] font-medium tracking-tight">{title}</div>
        </div>
        <div className={`text-[11px] font-mono ${emphasized ? "text-paper/70" : "text-ink-500"}`}>{subtitle}</div>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r: any, i: number) => (
          <div key={i} className="rounded-lg border border-ink-200 bg-white px-3 py-2">
            <div className="text-[12px] tracking-tight font-medium">{r.label}</div>
            <div className="text-[10px] font-mono text-ink-500 flex items-center gap-1.5">
              <Dot tone={emphasized ? "teal" : "ink"} />
              {r.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Multi-user experience
// ────────────────────────────────────────────────────────────────────────────
function MultiUser() {
  const [active, setActive] = useState<"agencies" | "professionals" | "facilities">("agencies");
  const tabs = [
    { id: "agencies",      label: "Agencies",                 icon: "briefcase-medical" },
    { id: "professionals", label: "Healthcare professionals", icon: "stethoscope" },
    { id: "facilities",    label: "Facilities",               icon: "building-2" },
  ] as const;
  const content: Record<string, any> = {
    agencies: {
      headline: "The control center for staffing operations.",
      sub: "Run an operations desk with the precision of a logistics platform — workforce visibility, request pipeline, fulfillment, and compliance in one place.",
      bullets: ["Manage staffing operations", "Coordinate workforce", "Monitor fulfillment", "Improve fill rates"],
      preview: <AgencyPreview />,
    },
    professionals: {
      headline: "Built for life on shift.",
      sub: "RNs, CNAs, and EMTs see the right shifts, manage availability, and keep credentials current — without phone tag or text threads.",
      bullets: ["Update availability", "Accept shifts", "Manage schedules", "Upload credentials"],
      preview: <RnPreview />,
    },
    facilities: {
      headline: "A direct line into your staffing pipeline.",
      sub: "Submit requests, track fulfillment in real time, and see exactly who's walking through the door — with full coordination history.",
      bullets: ["Request staffing", "Track fulfillment", "View assigned staff", "Reduce staffing gaps"],
      preview: <FacilityPreview />,
    },
  };
  const c = content[active];
  return (
    <section className="py-28">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="04" label="Built for everyone in the loop" />
        <div className="mt-4 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-7 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
            One platform.
            <span className="font-serif italic text-teal-800"> Three ways </span>
            to use it.
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="mt-10 inline-flex items-center gap-1 p-1 rounded-full border border-ink-200 bg-white">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-[13px] tracking-tight ${
                active === t.id ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-50"
              }`}
            >
              <Icon name={t.icon} className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-5">
            <h3 className="text-[28px] leading-[1.15] tracking-[-0.01em] font-medium">{c.headline}</h3>
            <p className="mt-3 text-[15px] text-ink-600 leading-relaxed">{c.sub}</p>
            <ul className="mt-6 space-y-2.5">
              {c.bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-[14px] tracking-tight">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 inline-flex items-center justify-center">
                    <Icon name="check" className="w-3 h-3" strokeWidth={2.5} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button variant="secondary" size="md">
                Explore the {tabs.find(t => t.id === active)!.label.toLowerCase()} experience
                <Icon name="arrow-right" className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <div key={active} className="rise-in">{c.preview}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewFrame({ chrome, children }: { chrome: string; children: any }) {
  return (
    <div className="rounded-2xl bg-white shadow-lifted ring-1 ring-ink-900/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-9 border-b border-ink-100 bg-ink-50/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        </div>
        <div className="ml-3 text-[11px] font-mono text-ink-500">{chrome}</div>
        <div className="ml-auto text-[11px] font-mono text-ink-500 inline-flex items-center gap-1.5">
          <Dot tone="green" pulse /> live
        </div>
      </div>
      {children}
    </div>
  );
}

function AgencyPreview() {
  return (
    <PreviewFrame chrome="app.asneeded.health · operations">
      <div className="grid grid-cols-2 gap-px bg-ink-100">
        <div className="bg-white p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Open requests</div>
          <div className="text-[28px] font-semibold tracking-tight tabular-nums">18</div>
          <div className="mt-3 space-y-2">
            {[
              { f: "Mercy ICU",     n: "3 RN",  pct: 67, tone: "amber" },
              { f: "Bayview MS",    n: "4 RN",  pct: 100, tone: "green" },
              { f: "Pinegrove F2",  n: "2 CNA", pct: 50, tone: "amber" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <div className="w-24 truncate">{r.f}</div>
                <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.tone === "green" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${r.pct}%` }} />
                </div>
                <div className="font-mono text-[10px] text-ink-500 w-12 text-right">{r.n}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Coordinator activity</div>
          <ul className="mt-3 space-y-2">
            <ActivityRow who="L. Mahoney" what="auto-matched 7 RNs · REQ-2841" tone="teal" t="just now" />
            <ActivityRow who="R. Tan"      what="recovered cancellation · ER night" tone="amber" t="2m ago" />
            <ActivityRow who="E. Vargas"   what="approved compliance docs · A.M." tone="green" t="6m ago" />
            <ActivityRow who="L. Mahoney"  what="confirmed shift · Mercy ICU" tone="teal" t="9m ago" />
          </ul>
        </div>
      </div>
    </PreviewFrame>
  );
}

function ActivityRow({ who, what, tone, t }: any) {
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <Dot tone={tone} pulse={tone === "teal"} />
      <div className="flex-1 truncate"><span className="font-medium tracking-tight">{who}</span> <span className="text-ink-500">{what}</span></div>
      <div className="font-mono text-[10px] text-ink-500">{t}</div>
    </li>
  );
}

function RnPreview() {
  return (
    <PreviewFrame chrome="rn.asneeded.health · my shifts">
      <div className="bg-paper p-6">
        <div className="mx-auto max-w-[320px] rounded-[28px] bg-ink-900 p-2 shadow-deep">
          <div className="rounded-[22px] bg-white overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Hello,</div>
                  <div className="text-[18px] font-semibold tracking-tight">A. Martinez, RN</div>
                </div>
                <Avatar initials="AM" tone="teal" size={36} />
              </div>
            </div>
            <div className="px-5 pb-3">
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono text-teal-700 uppercase tracking-wider">New offer</div>
                  <Badge tone="teal">2 min</Badge>
                </div>
                <div className="text-[14px] font-medium tracking-tight mt-1">Mercy Mt. Sinai · ICU</div>
                <div className="text-[12px] font-mono text-ink-700">Tonight · 19:00 – 07:00 · $74/hr</div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 h-9 rounded-full bg-teal-700 text-white text-[12px] font-medium">Accept</button>
                  <button className="h-9 px-3 rounded-full border border-ink-200 text-[12px]">Decline</button>
                </div>
              </div>
            </div>
            <div className="px-5 pt-2 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2">This week</div>
              {[
                { d: "Wed 8", t: "Mercy Mt. Sinai · ICU",   s: "19:00–07:00", state: "Confirmed" },
                { d: "Fri 10", t: "Bayview Care · Med-Surg", s: "07:00–19:00", state: "Confirmed" },
                { d: "Sat 11", t: "Available · ICU",         s: "all day",      state: "Open" },
              ].map((r, i) => (
                <div key={i} className="py-2 border-t border-ink-100 first:border-0 flex items-center gap-3">
                  <div className="w-12 text-center">
                    <div className="text-[10px] font-mono uppercase text-ink-500">{r.d.split(" ")[0]}</div>
                    <div className="text-[16px] font-semibold leading-none tabular-nums">{r.d.split(" ")[1]}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium tracking-tight truncate">{r.t}</div>
                    <div className="text-[10px] font-mono text-ink-500">{r.s}</div>
                  </div>
                  <Badge tone={r.state === "Confirmed" ? "green" : "neutral"}>{r.state}</Badge>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-ink-100 bg-ink-50/60 flex items-center justify-around text-ink-500">
              {["home","calendar","shield-check","user"].map(i => <Icon key={i} name={i} className="w-5 h-5" />)}
            </div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function FacilityPreview() {
  return (
    <PreviewFrame chrome="facility.asneeded.health · staffing">
      <div className="bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Mercy Mt. Sinai</div>
            <div className="text-[18px] font-semibold tracking-tight">Tonight · ICU</div>
          </div>
          <Badge tone="amber">2 of 3 filled</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { name: "A. Martinez", role: "RN · ICU",     state: "Confirmed", tone: "teal" },
            { name: "S. Nguyen",   role: "RN · ICU",     state: "Confirmed", tone: "violet" },
            { name: "Pending…",    role: "RN · ICU",     state: "Matching",  tone: "ink" },
          ].map((p, i) => (
            <div key={i} className="rounded-lg border border-ink-200 bg-paper/40 p-3">
              <Avatar initials={p.name === "Pending…" ? "?" : p.name.split(" ").map(s => s[0]).join("")} tone={p.tone as any} size={28} />
              <div className="mt-2 text-[12px] font-medium tracking-tight truncate">{p.name}</div>
              <div className="text-[10px] font-mono text-ink-500">{p.role}</div>
              <div className="mt-2 text-[10px] font-mono inline-flex items-center gap-1.5 text-ink-700">
                <Dot tone={p.state === "Matching" ? "teal" : "green"} pulse={p.state === "Matching"} />
                {p.state}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-ink-200 bg-paper/40 p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2">Coordination thread</div>
          <ul className="space-y-2 text-[12px]">
            <li><span className="font-mono text-ink-500">18:42</span> · request submitted · 3 RN · tonight</li>
            <li><span className="font-mono text-ink-500">18:46</span> · Apex Staffing matched 7 candidates</li>
            <li><span className="font-mono text-ink-500">18:54</span> · A. Martinez accepted</li>
            <li><span className="font-mono text-ink-500">19:01</span> · S. Nguyen accepted</li>
          </ul>
        </div>
      </div>
    </PreviewFrame>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Feature grid
// ────────────────────────────────────────────────────────────────────────────
function FeatureGrid() {
  const features = [
    { icon: "radar",            title: "Real-time availability board",    sub: "See every available professional, by role and proximity, the moment a request comes in.", visual: <FxBoard /> },
    { icon: "git-merge",        title: "Staffing request pipeline",       sub: "Every facility request flows through a single queue with state, owner, and SLA.",          visual: <FxPipeline /> },
    { icon: "shield-check",     title: "Compliance-aware matching",       sub: "Only credentialed, current professionals surface for each request — automatically.",     visual: <FxCompliance /> },
    { icon: "calendar-check",   title: "Shift coordination",              sub: "Push, SMS, voice — confirmation flows that actually close the loop.",                    visual: <FxShift /> },
    { icon: "rotate-ccw",       title: "Cancellation recovery",           sub: "Auto-rebook through ranked alternates the moment a cancellation hits.",                  visual: <FxRecovery /> },
    { icon: "building-2",       title: "Facility portal",                 sub: "A live view for every facility — submit, track, communicate, no phone calls.",           visual: <FxFacility /> },
    { icon: "smartphone",       title: "Mobile professional experience",  sub: "RNs see the right shifts, accept in one tap, and keep credentials current.",             visual: <FxMobile /> },
    { icon: "bar-chart-3",      title: "Operations dashboard",            sub: "Fill rates, time-to-fill, recoveries, no-shows — for every coordinator.",                visual: <FxOps /> },
  ];
  return (
    <section className="py-28 bg-white border-y border-ink-200/70">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="05" label="Capabilities" />
        <div className="mt-4 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-7 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
            Eight capabilities. One
            <span className="font-serif italic text-teal-800"> coordinated </span>
            system.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[16px] text-ink-600 leading-relaxed">
            Each module is built to operate live — together they turn an agency from a callback
            shop into a coordinated workforce platform.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-3">
          {features.map((f, i) => (
            <FeatureCard key={i} f={f} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, idx }: any) {
  const big = idx === 0 || idx === 4;
  return (
    <div className={`rounded-xl border border-ink-200 bg-paper/40 overflow-hidden hover:border-teal-300 transition-colors flex flex-col ${
      big ? "col-span-12 lg:col-span-6" : "col-span-12 sm:col-span-6 lg:col-span-3"
    }`}>
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-500">
          <span className="text-teal-700 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
          <span className="block w-3 h-px bg-ink-300" />
          <Icon name={f.icon} className="w-3.5 h-3.5" />
        </div>
        <div className="mt-3 text-[16px] font-medium tracking-tight">{f.title}</div>
        <div className="mt-1 text-[13px] text-ink-600 leading-relaxed">{f.sub}</div>
      </div>
      <div className="mt-2 px-5 pb-5">{f.visual}</div>
    </div>
  );
}

// Tiny visuals for each feature card
function FxBoard() {
  const cells = Array.from({ length: 30 }).map((_, i) => {
    const r = (i * 3 + 1) % 5;
    return r === 0 ? "bg-emerald-500" : r === 1 ? "bg-teal-400" : r === 2 ? "bg-amber-400" : "bg-ink-200";
  });
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3">
      <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 mb-2">
        <span>Workforce · 30 of 142</span>
        <span><Dot tone="green" pulse /> 18 available</span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {cells.map((c, i) => <span key={i} className={`block h-4 rounded-sm ${c}`} />)}
      </div>
    </div>
  );
}
function FxPipeline() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3 grid grid-cols-4 gap-2 text-[10px] font-mono">
      {["New","Matching","Offered","Filled"].map((s,i) => (
        <div key={s} className="border border-ink-100 rounded p-2">
          <div className="text-ink-500 uppercase tracking-wider">{s}</div>
          <div className="mt-1 text-[16px] font-semibold text-ink-900 tabular-nums">{[6,5,4,3][i]}</div>
        </div>
      ))}
    </div>
  );
}
function FxCompliance() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3 space-y-1.5 text-[11px] font-mono">
      {[
        { l: "BLS", s: "Current", t: "green" },
        { l: "TB",  s: "Current", t: "green" },
        { l: "I-9", s: "8d left",  t: "amber" },
        { l: "Lic.",s: "Expired",  t: "red" },
      ].map((r,i) => (
        <div key={i} className="flex items-center gap-2">
          <Icon name="shield-check" className="w-3 h-3" />
          <span className="w-10 text-ink-700">{r.l}</span>
          <span className="flex-1 h-1 rounded-full bg-ink-100 overflow-hidden">
            <span className={`block h-full ${r.t === "green" ? "bg-emerald-500" : r.t === "amber" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: r.t === "green" ? "92%" : r.t === "amber" ? "60%" : "12%" }} />
          </span>
          <span className="text-ink-500 w-14 text-right">{r.s}</span>
        </div>
      ))}
    </div>
  );
}
function FxShift() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3 text-[11px]">
      <div className="font-mono text-ink-500 mb-2">Confirmation flow</div>
      {["Push sent","Read","Accepted","Confirmed"].map((s, i) => (
        <div key={s} className="flex items-center gap-2 py-0.5">
          <span className={`w-2 h-2 rounded-full ${i < 3 ? "bg-teal-700" : "bg-ink-200"}`} />
          <span className={i < 3 ? "text-ink-800" : "text-ink-400"}>{s}</span>
        </div>
      ))}
    </div>
  );
}
function FxRecovery() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3">
      <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 mb-2">
        <span>Cancellation · Mercy ICU</span>
        <Badge tone="amber">recovering</Badge>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <Avatar initials="JR" tone="rose" size={22} />
        <div className="line-through text-ink-400">J. Reyes</div>
        <Icon name="arrow-right" className="w-3 h-3 text-ink-400" />
        <Avatar initials="AM" tone="teal" size={22} />
        <div className="font-medium">A. Martinez</div>
      </div>
      <div className="mt-2 text-[10px] font-mono text-emerald-700">auto-rebooked · 38s</div>
    </div>
  );
}
function FxFacility() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3 text-[11px] font-mono">
      <div className="text-ink-500 mb-2">Live status · 4 facilities</div>
      {[
        { f: "Mercy", c: "92%", t: "green" },
        { f: "Bayview", c: "78%", t: "amber" },
        { f: "Pinegrove", c: "100%", t: "green" },
        { f: "Northridge", c: "61%", t: "amber" },
      ].map(r => (
        <div key={r.f} className="flex items-center justify-between py-0.5">
          <span>{r.f}</span>
          <span className={r.t === "green" ? "text-emerald-700" : "text-amber-700"}>{r.c}</span>
        </div>
      ))}
    </div>
  );
}
function FxMobile() {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3">
      <div className="rounded-lg bg-teal-50 border border-teal-200 p-2 text-[11px]">
        <div className="font-medium tracking-tight">New offer · ICU</div>
        <div className="font-mono text-ink-500">Tonight · 19–07 · $74/hr</div>
        <div className="mt-1.5 flex gap-1.5">
          <span className="flex-1 h-6 rounded-full bg-teal-700 text-white inline-flex items-center justify-center text-[10px] font-medium">Accept</span>
          <span className="h-6 px-2 rounded-full border border-ink-200 inline-flex items-center text-[10px]">Decline</span>
        </div>
      </div>
    </div>
  );
}
function FxOps() {
  const bars = [42,58,49,71,63,82,77];
  return (
    <div className="rounded-md border border-ink-200 bg-white p-3">
      <div className="flex items-center justify-between text-[10px] font-mono text-ink-500">
        <span>Fill rate · 7 days</span>
        <span className="text-emerald-700">+6 pts</span>
      </div>
      <div className="mt-2 flex items-end gap-1 h-12">
        {bars.map((b,i) => <span key={i} className="flex-1 bg-teal-700/80 rounded-sm" style={{ height: `${b}%` }} />)}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Workflow
// ────────────────────────────────────────────────────────────────────────────
function Workflow() {
  const steps = [
    { t: "Facility request",   d: "Submitted via portal · classified by role and shift.",   icon: "building-2",       chip: "REQ-2841" },
    { t: "Agency coordination",d: "Routed to coordinator queue · SLA timer starts.",        icon: "users",            chip: "L. Mahoney" },
    { t: "RN matching",        d: "Compliance-aware match across available workforce.",      icon: "wand-2",           chip: "7 matched" },
    { t: "Shift confirmation", d: "Push, SMS, voice — confirmation closes the loop.",        icon: "calendar-check",   chip: "A. Martinez" },
    { t: "Live monitoring",    d: "ETA, check-in, on-site status visible to facility.",      icon: "activity",         chip: "ETA 19:00" },
    { t: "Completion",         d: "Hours captured · payroll-ready · loop closed.",            icon: "check-circle-2",   chip: "12h logged" },
  ];
  return (
    <section className="py-28 bg-ink-950 text-paper">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="06" label="Workflow" />
        <div className="mt-4 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-8 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium text-paper">
            From facility request to completed shift —
            <span className="font-serif italic text-teal-300"> one continuous flow.</span>
          </h2>
          <p className="col-span-12 lg:col-span-4 text-[15px] text-paper/70 leading-relaxed">
            Every shift moves through six coordinated states. AsNeeded handles handoffs and
            timing; coordinators stay in control.
          </p>
        </div>

        <div className="mt-14 relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1140 240" preserveAspectRatio="none">
            <line x1="40" y1="60" x2="1100" y2="60" stroke="rgba(124,205,199,0.5)" strokeWidth="1.2" strokeDasharray="4 4" />
          </svg>
          <ol className="relative grid grid-cols-6 gap-3">
            {steps.map((s, i) => (
              <li key={i} className="">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-paper text-ink-900 inline-flex items-center justify-center">
                    <Icon name={s.icon} className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="mt-4 text-[14px] font-medium tracking-tight">{s.t}</div>
                <div className="mt-1 text-[12px] text-paper/60 leading-snug">{s.d}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono px-2 h-5 rounded-full border border-paper/15 text-paper/70">
                  <Dot tone="teal" pulse={i === 3} />
                  {s.chip}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-3 text-[11px] font-mono">
          {[
            { l: "Median TTF", v: "11m" },
            { l: "Cancellation recovery", v: "< 90s" },
            { l: "Comms channels", v: "Push · SMS · Voice" },
            { l: "Compliance gates", v: "Per-state, per-role" },
          ].map((m,i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-paper/10 p-4">
              <div className="text-paper/50 uppercase tracking-wider">{m.l}</div>
              <div className="mt-1 text-[18px] text-paper font-sans tracking-tight">{m.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Metrics / outcomes
// ────────────────────────────────────────────────────────────────────────────
function Metrics() {
  const m = [
    { v: "42%",  l: "faster time-to-fill",   sub: "vs. phone-and-text coordination" },
    { v: "+9 pts", l: "higher fill rate",      sub: "across multi-facility deployments" },
    { v: "−63%", l: "no-show incidents",      sub: "with confirmation + reminder flows" },
    { v: "100%", l: "compliance visibility",   sub: "per-role, per-state credentials" },
    { v: "−4 hrs/day", l: "coordinator overhead", sub: "reclaimed back to operations" },
    { v: "3.2×", l: "more reliable staffing",  sub: "predictability score, weighted" },
  ];
  return (
    <section className="py-28">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="07" label="Operational outcomes" />
        <div className="mt-4 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-8 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
            Numbers from agencies who switched
            <span className="font-serif italic text-teal-800"> off phones </span>
            and onto AsNeeded.
          </h2>
          <p className="col-span-12 lg:col-span-4 text-[15px] text-ink-600 leading-relaxed">
            Indicative ranges from agencies running 1k–10k+ shifts per month. Full case studies
            available on request.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-12 gap-3">
          {m.map((x, i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-ink-200 bg-white p-6">
              <div className="text-[44px] font-medium tracking-[-0.02em] tabular-nums text-ink-900">{x.v}</div>
              <div className="mt-1 text-[14px] tracking-tight text-ink-800">{x.l}</div>
              <div className="mt-1 text-[12px] font-mono text-ink-500">{x.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-ink-200 bg-paper p-8 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow>Field note</Eyebrow>
            <p className="mt-3 text-[22px] leading-[1.3] tracking-[-0.01em] text-ink-900 font-medium text-balance">
              "We went from a 30-text scramble per night shift to a coordinator who watches one
              board. Saturday mornings are no longer survival mode."
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Avatar initials="LM" tone="teal" size={36} />
              <div>
                <div className="text-[13px] tracking-tight font-medium">Lena Mahoney</div>
                <div className="text-[11px] font-mono text-ink-500">Director of Operations · Apex Staffing</div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 stripe-ph rounded-xl aspect-[5/3] border border-ink-200 flex items-center justify-center">
            <div className="font-mono text-[11px] text-ink-500">[ photo · operations desk ]</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 8. Trust / reliability
// ────────────────────────────────────────────────────────────────────────────
function Trust() {
  const items = [
    { icon: "radio",         t: "Real-time coordination",    d: "Push, SMS, voice — every state change reflected instantly." },
    { icon: "shield-check",  t: "Compliance visibility",     d: "Credentials surfaced before they expire, not after." },
    { icon: "sliders",       t: "Operational control",       d: "Coordinator workflows, SLAs, and audit trails by default." },
    { icon: "users-round",   t: "Workforce reliability",     d: "Confirmation flows that close the loop on every shift." },
    { icon: "line-chart",    t: "Staffing predictability",   d: "Forecast tomorrow's gaps with today's signal." },
  ];
  return (
    <section className="py-28 bg-white border-y border-ink-200/70">
      <div className="max-w-[1240px] mx-auto px-8">
        <SectionLabel index="08" label="Operational reliability" />
        <div className="mt-4 grid grid-cols-12 gap-12 items-end">
          <h2 className="col-span-12 lg:col-span-7 text-[44px] leading-[1.05] tracking-[-0.02em] font-medium">
            Built for the
            <span className="font-serif italic text-teal-800"> operational hours </span>
            you can't afford to lose.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] text-ink-600 leading-relaxed">
            Healthcare staffing runs 24/7. Your operations platform should match — with the
            controls, visibility, and reliability of an infrastructure product.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-12 gap-3">
          {items.map((it, i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-ink-200 p-5">
              <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center">
                <Icon name={it.icon} className="w-4 h-4" />
              </span>
              <div className="mt-3 text-[15px] font-medium tracking-tight">{it.t}</div>
              <div className="mt-1 text-[13px] text-ink-600 leading-relaxed">{it.d}</div>
            </div>
          ))}
          <div className="col-span-12 lg:col-span-8 rounded-xl border border-ink-200 p-5 grid grid-cols-4 gap-3 items-center">
            {["soc-2 type ii","hipaa aligned","99.95% uptime","sso · scim"].map(t => (
              <div key={t} className="flex items-center gap-2 text-[12px] font-mono text-ink-700">
                <Icon name="badge-check" className="w-4 h-4 text-teal-700" />
                <span className="uppercase tracking-wider text-[10px]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 9. Final CTA + Footer
// ────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-28">
      <div className="max-w-[1240px] mx-auto px-8">
        <div className="relative rounded-3xl bg-ink-950 text-paper overflow-hidden p-12 lg:p-16">
          <div className="absolute inset-0 bg-dots opacity-30" aria-hidden />
          <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-teal-700/20 blur-3xl" aria-hidden />
          <div className="relative grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-8">
              <SectionLabel index="09" label="Bring predictability" />
              <h2 className="mt-4 text-[56px] leading-[1.02] tracking-[-0.02em] font-medium text-paper">
                Bring predictability to healthcare
                <span className="font-serif italic text-teal-300"> staffing operations.</span>
              </h2>
              <p className="mt-5 text-[16px] text-paper/70 max-w-xl leading-relaxed">
                Built for agencies managing real-world staffing complexity. We'll walk through
                your operations and show you AsNeeded against your live workload.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Button as="a" href="/signup" size="lg" variant="teal">Sign up now <Icon name="arrow-right" className="w-4 h-4" /></Button>
                <Button size="lg" variant="ghost" className="text-paper hover:bg-paper/10 border-paper/15">
                  <Icon name="calendar" className="w-4 h-4" /> Book a 20-min walkthrough
                </Button>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="rounded-xl border border-paper/15 bg-paper/5 p-5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-paper/50">In the demo</div>
                <ul className="mt-3 space-y-2 text-[13px] text-paper/85">
                  {["Map your shift pipeline live","Walk through compliance gates","Stress-test cancellation recovery","See the agency-RN-facility loop"].map(s => (
                    <li key={s} className="flex items-start gap-2">
                      <Icon name="check" className="w-3.5 h-3.5 text-teal-300 mt-1" strokeWidth={2.4} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Platform",     items: ["Availability board","Request pipeline","Compliance","Cancellation recovery","Mobile app","Operations dashboard"] },
    { h: "Use cases",    items: ["RN agencies","Allied health","Per-diem","Travel","Multi-facility","Crisis staffing"] },
    { h: "Company",      items: ["About","Customers","Careers","Press","Security","Contact"] },
    { h: "Resources",    items: ["Help center","API docs","Changelog","Status","Community","Brand"] },
  ];
  return (
    <footer className="border-t border-ink-200 bg-paper">
      <div className="max-w-[1240px] mx-auto px-8 py-16">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
            </div>
            <p className="mt-4 text-[13px] text-ink-600 max-w-xs leading-relaxed">
              The operational platform for healthcare staffing agencies. Coordinate workforce,
              fulfill shifts, and stay in control — in real time.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono text-ink-500">
              <Dot tone="green" pulse /> All systems operational
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {cols.map(c => (
              <div key={c.h}>
                <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{c.h}</div>
                <ul className="mt-3 space-y-2">
                  {c.items.map(it => (
                    <li key={it}><a className="text-[13px] text-ink-700 hover:text-ink-900">{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-ink-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between text-[11px] font-mono text-ink-500">
          <div>© 2026 AsNeeded, Inc. · Built for healthcare staffing operations.</div>
          <div className="flex gap-4">
            <a>Privacy</a><a>Terms</a><a>HIPAA</a><a>SOC 2</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export {
  TopNav,
  Hero,
  TrustBar,
  Problems,
  PlatformOverview,
  MultiUser,
  FeatureGrid,
  Workflow,
  Metrics,
  Trust,
  FinalCTA,
  Footer,
};
