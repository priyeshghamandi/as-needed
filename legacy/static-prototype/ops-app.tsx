// AsNeeded operations dashboard — air traffic control for healthcare staffing
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const { useState, useEffect, useMemo } = React;
const { Icon, Badge, Dot, Avatar, AvatarStack, Eyebrow } = window;

// ───────────── Data ─────────────
const REQUESTS = [
  { id: "REQ-2841", facility: "Mercy Mt. Sinai",   role: "RN", spec: "ICU",      shift: "Tonight · 19:00–07:00", need: 3, filled: 2, coord: { i: "LM", t: "teal"   }, status: "Partially Filled", urgency: "Critical", assigned: ["AM","SN"] },
  { id: "REQ-2842", facility: "Bayview Care",      role: "RN", spec: "Med-Surg", shift: "Tomorrow · 07:00–19:00", need: 4, filled: 4, coord: { i: "RT", t: "violet" }, status: "Confirmed",         urgency: "Normal",   assigned: ["JR","KP","DC","TM"] },
  { id: "REQ-2843", facility: "Pinegrove SNF",     role: "CNA",spec: "Floor 2",  shift: "Tomorrow · 19:00–07:00", need: 2, filled: 1, coord: { i: "EV", t: "amber"  }, status: "Matching",          urgency: "High",     assigned: ["AT"] },
  { id: "REQ-2844", facility: "Northridge Health", role: "RN", spec: "ER",       shift: "Thu · 07:00–15:00",      need: 2, filled: 0, coord: { i: "LM", t: "teal"   }, status: "Open",              urgency: "Normal",   assigned: [] },
  { id: "REQ-2845", facility: "Coastline Hospice", role: "LPN",spec: "Visit",    shift: "Tonight · 22:00–06:00",  need: 1, filled: 0, coord: { i: "RT", t: "violet" }, status: "At Risk",           urgency: "Critical", assigned: [] },
  { id: "REQ-2846", facility: "Summit Pediatrics", role: "RN", spec: "Pedi",     shift: "Fri · 07:00–19:00",      need: 1, filled: 1, coord: { i: "EV", t: "amber"  }, status: "Confirmed",         urgency: "Normal",   assigned: ["MS"] },
  { id: "REQ-2847", facility: "Lakeshore Rehab",   role: "RN", spec: "Rehab",    shift: "Sat · 19:00–07:00",      need: 3, filled: 1, coord: { i: "LM", t: "teal"   }, status: "Matching",          urgency: "High",     assigned: ["GH"] },
  { id: "REQ-2848", facility: "Ridgecrest Medical",role: "RN", spec: "ICU",      shift: "Sat · 07:00–19:00",      need: 2, filled: 0, coord: { i: "RT", t: "violet" }, status: "Open",              urgency: "Normal",   assigned: [] },
];

const HCPS = [
  { name: "Aria Martinez",   role: "RN",  spec: "ICU",      loc: "3.2 mi",  status: "Available",            comp: "current",  ready: true },
  { name: "Sayuri Nguyen",   role: "RN",  spec: "ICU",      loc: "5.8 mi",  status: "On Shift",             comp: "current",  ready: false },
  { name: "Kai Park",        role: "CNA", spec: "Floor",    loc: "4.1 mi",  status: "Available",            comp: "current",  ready: true },
  { name: "Devon Carter",    role: "RN",  spec: "Med-Surg", loc: "7.0 mi",  status: "Pending Confirmation", comp: "current",  ready: true },
  { name: "Jamal Reyes",     role: "RN",  spec: "ER",       loc: "9.1 mi",  status: "Available",            comp: "current",  ready: true },
  { name: "Mei Sato",        role: "RN",  spec: "Pedi",     loc: "12.4 mi", status: "Available",            comp: "expiring", ready: true },
  { name: "Tomás Mendez",    role: "RN",  spec: "Telemetry",loc: "2.8 mi",  status: "Unavailable",          comp: "current",  ready: false },
  { name: "Grace Hall",      role: "RN",  spec: "Rehab",    loc: "6.3 mi",  status: "Available",            comp: "current",  ready: true },
  { name: "Amir Tahir",      role: "CNA", spec: "Floor",    loc: "1.6 mi",  status: "On Shift",             comp: "current",  ready: false },
];

const RISKS = [
  { kind: "Cancellation", label: "J. Reyes pulled out · Mercy ICU",    sub: "T-1h · auto-recovery active", tone: "rose",  icon: "rotate-ccw",   age: "12m ago" },
  { kind: "Unfilled",     label: "Coastline Hospice · 1 LPN unfilled", sub: "Tonight 22:00 · 4h to start", tone: "rose",  icon: "siren",        age: "1h ago"  },
  { kind: "Credential",   label: "M. Sato · RN License expires",       sub: "8 days · CA",                 tone: "amber", icon: "shield-alert", age: "today"   },
  { kind: "Shortage",     label: "ICU coverage gap · Sat overnight",   sub: "Need 2 more matches",         tone: "amber", icon: "alert-triangle", age: "today" },
];

const COORDS = [
  { name: "Lena Mahoney",   i: "LM", t: "teal",   active: 7, open: 3, sla: "2.1m",  load: 84 },
  { name: "Ravi Tan",       i: "RT", t: "violet", active: 5, open: 2, sla: "3.4m",  load: 62 },
  { name: "Elena Vargas",   i: "EV", t: "amber",  active: 4, open: 1, sla: "1.9m",  load: 48 },
  { name: "Theo Brooks",    i: "TB", t: "rose",   active: 2, open: 0, sla: "4.2m",  load: 26 },
];

const ACTIVITY = [
  { t: "12s",  who: "A. Martinez",  what: "accepted shift · Mercy ICU",            tone: "green",  icon: "check-circle-2" },
  { t: "48s",  who: "L. Mahoney",   what: "auto-matched 7 RNs · REQ-2847",          tone: "teal",   icon: "wand-2" },
  { t: "2m",   who: "Mercy Mt. Sinai", what: "submitted REQ-2848 · 2 RN ICU",       tone: "ink",    icon: "send" },
  { t: "4m",   who: "J. Reyes",     what: "cancelled · ER tonight",                 tone: "rose",   icon: "x-circle" },
  { t: "6m",   who: "K. Park",      what: "uploaded TB renewal",                     tone: "teal",   icon: "shield-check" },
  { t: "9m",   who: "R. Tan",       what: "reassigned REQ-2845 to E. Vargas",       tone: "ink",    icon: "shuffle" },
  { t: "12m",  who: "S. Nguyen",    what: "checked in · Mercy ICU",                 tone: "green",  icon: "map-pin" },
  { t: "18m",  who: "Bayview Care", what: "confirmed REQ-2842 fully filled",        tone: "green",  icon: "circle-check" },
  { t: "24m",  who: "M. Sato",      what: "credential expiring · 8 days",            tone: "amber",  icon: "shield-alert" },
  { t: "31m",  who: "E. Vargas",    what: "approved compliance docs · A. Tahir",     tone: "teal",   icon: "user-check" },
];

const COMPLIANCE = [
  { who: "M. Sato",      i: "MS", t: "rose",   item: "RN License (CA)",  state: "Expires in 8 days",  pct: 22, tone: "amber" },
  { who: "G. Hall",      i: "GH", t: "teal",   item: "TB Test",          state: "Renew within 14 days", pct: 38, tone: "amber" },
  { who: "A. Tahir",     i: "AT", t: "violet", item: "Background check", state: "Vendor complete",     pct: 96, tone: "green" },
  { who: "D. Carter",    i: "DC", t: "amber",  item: "BLS Certification",state: "Submitted · review",  pct: 70, tone: "teal" },
  { who: "J. Reyes",     i: "JR", t: "rose",   item: "Vaccination · Flu",state: "Missing · facility req", pct: 0, tone: "rose" },
];

// ───────────── Sidebar ─────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",         icon: "layout-grid" },
  { id: "requests",   label: "Staffing Requests", icon: "clipboard-list", count: 18 },
  { id: "workforce",  label: "Workforce",         icon: "users" },
  { id: "facilities", label: "Facilities",        icon: "building-2" },
  { id: "shifts",     label: "Shifts",            icon: "calendar-range" },
  { id: "compliance", label: "Compliance",        icon: "shield-check", count: 5 },
  { id: "messages",   label: "Messages",          icon: "message-circle" },
  { id: "reports",    label: "Reports",           icon: "bar-chart-3" },
  { id: "settings",   label: "Settings",          icon: "settings-2" },
];

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

function Sidebar({ active, setActive }: any) {
  return (
    <aside className="w-[232px] shrink-0 h-screen sticky top-0 border-r border-ink-200/70 bg-paper flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-ink-200/70">
        <LogoMark />
        <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
        <button className="ml-auto w-6 h-6 rounded inline-flex items-center justify-center hover:bg-ink-100 text-ink-500"><Icon name="chevrons-left" className="w-3.5 h-3.5" /></button>
      </div>
      {/* Agency selector */}
      <button className="mx-3 mt-3 px-2.5 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 flex items-center gap-2.5 text-left">
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px]">AS</span>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium tracking-tight truncate">Apex Staffing</div>
          <div className="text-[10px] font-mono text-ink-500 truncate">SF Bay · Owner</div>
        </div>
        <Icon name="chevrons-up-down" className="w-3.5 h-3.5 text-ink-400" />
      </button>

      <nav className="px-2 mt-3 flex flex-col gap-px">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`group flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight ${
              active === n.id ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            <Icon name={n.icon} className={`w-4 h-4 ${active === n.id ? "text-paper" : "text-ink-500 group-hover:text-ink-800"}`} />
            <span className="flex-1 text-left">{n.label}</span>
            {n.count != null && (
              <span className={`text-[10px] font-mono px-1.5 h-4 inline-flex items-center rounded ${
                active === n.id ? "bg-paper/20 text-paper" : "bg-ink-100 text-ink-700"
              }`}>{n.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-lg border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <Dot tone="green" pulse />
            <div className="text-[11px] font-mono text-ink-700">All systems operational</div>
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-ink-500">SOC 2 · HIPAA · 99.95% uptime</div>
        </div>
        <button className="mt-3 w-full flex items-center gap-2 px-2 h-9 rounded-md hover:bg-ink-100 text-[13px] text-ink-800">
          <Avatar initials="LM" tone="teal" size={20} />
          <div className="flex-1 text-left text-[12px] tracking-tight">Lena Mahoney</div>
          <Icon name="more-horizontal" className="w-3.5 h-3.5 text-ink-400" />
        </button>
      </div>
    </aside>
  );
}

// ───────────── Topbar ─────────────
function Topbar() {
  return (
    <div className="sticky top-0 z-30 h-14 bg-paper/85 backdrop-blur border-b border-ink-200/70">
      <div className="h-full px-6 flex items-center gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Operations</div>
          <div className="text-[14px] font-medium tracking-tight leading-none mt-0.5">Live console</div>
        </div>
        <div className="ml-6 relative w-[420px] max-w-[40vw]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"><Icon name="search" className="w-4 h-4" /></span>
          <input placeholder="Search requests, facilities, professionals…" className="w-full h-9 pl-9 pr-16 rounded-lg border border-ink-200 bg-white text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-400 px-1.5 h-5 inline-flex items-center rounded border border-ink-200 bg-paper">⌘K</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700">
            <Icon name="bell" className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-paper" />
          </button>
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="help-circle" className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-ink-200 mx-1" />
          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800">
            <Icon name="plus" className="w-3.5 h-3.5" /> Create staffing request
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── KPI strip ─────────────
function KpiStrip() {
  const k = [
    { label: "Open requests",    v: 18,    sub: "across 7 facilities", trend: "+3 today",    tone: "ink",   spark: [9,11,12,10,14,15,18] },
    { label: "Fill rate",        v: "93%", sub: "rolling 7-day",       trend: "+6 pts WoW",  tone: "green", spark: [78,82,85,84,88,90,93] },
    { label: "Available RNs",    v: 28,    sub: "compliance current",  trend: "live",        tone: "teal",  spark: [22,24,26,27,28,28,28] },
    { label: "Urgent shifts",    v: 4,     sub: "T-12h or less",       trend: "−2 vs avg",   tone: "amber", spark: [6,5,5,7,4,5,4] },
    { label: "Active facilities",v: 7,     sub: "with open demand",    trend: "stable",      tone: "ink",   spark: [6,7,7,6,7,7,7] },
    { label: "Compliance alerts",v: 5,     sub: "renewing in 14d",     trend: "+1",          tone: "rose",  spark: [3,3,4,4,4,5,5] },
  ];
  return (
    <div className="grid grid-cols-12 gap-3">
      {k.map((x, i) => (
        <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{x.label}</div>
            <Spark data={x.spark} tone={x.tone} />
          </div>
          <div className="mt-2 text-[28px] font-medium tracking-tight tabular-nums">{x.v}</div>
          <div className="text-[11px] font-mono text-ink-500">{x.sub}</div>
          <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono ${
            x.tone === "green" ? "text-emerald-700" :
            x.tone === "rose"  ? "text-rose-700"   :
            x.tone === "amber" ? "text-amber-700"   :
            x.tone === "teal"  ? "text-teal-700"    : "text-ink-600"
          }`}>
            <Dot tone={x.tone === "ink" ? "ink" : x.tone as any} pulse={x.tone === "teal"} />
            {x.trend}
          </div>
        </div>
      ))}
    </div>
  );
}

function Spark({ data, tone }: { data: number[]; tone: string }) {
  const w = 56, h = 18, max = Math.max(...data), min = Math.min(...data);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (data.length - 1)) * w} ${h - ((v - min) / Math.max(1,(max - min))) * h}`).join(" ");
  const color = tone === "green" ? "#0c815c" : tone === "rose" ? "#be123c" : tone === "amber" ? "#a16207" : tone === "teal" ? "#0c615e" : "#5e6873";
  return <svg width={w} height={h} className="opacity-90"><path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" /></svg>;
}

// ───────────── Card scaffolding ─────────────
function Panel({ title, sub, action, children, className = "" }: any) {
  return (
    <section className={`rounded-xl border border-ink-200 bg-white ${className}`}>
      <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-3">
        <div>
          <div className="text-[14px] font-medium tracking-tight">{title}</div>
          {sub && <div className="text-[11px] font-mono text-ink-500 mt-0.5">{sub}</div>}
        </div>
        <div className="ml-auto flex items-center gap-2">{action}</div>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; dot: string }> = {
    "Open":             { tone: "ink",    dot: "ink"   },
    "Matching":         { tone: "teal",   dot: "teal"  },
    "Partially Filled": { tone: "amber",  dot: "amber" },
    "Confirmed":        { tone: "green",  dot: "green" },
    "At Risk":          { tone: "rose",   dot: "rose"  },
  };
  const s = map[status] ?? map["Open"];
  return (
    <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${
      s.tone === "green"  ? "bg-emerald-50 text-emerald-700" :
      s.tone === "rose"   ? "bg-rose-50 text-rose-700"       :
      s.tone === "amber"  ? "bg-amber-50 text-amber-700"     :
      s.tone === "teal"   ? "bg-teal-50 text-teal-700"       :
                            "bg-ink-100 text-ink-700"
    }`}>
      <Dot tone={s.dot as any} pulse={status === "Matching" || status === "At Risk"} />
      {status}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const m: Record<string, string> = {
    "Critical": "bg-rose-700 text-white",
    "High":     "bg-amber-100 text-amber-800",
    "Normal":   "bg-ink-100 text-ink-700",
  };
  return <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${m[urgency]}`}>{urgency}</span>;
}

// ───────────── Active staffing requests ─────────────
function RequestsTable() {
  const [filter, setFilter] = useState<string>("All");
  const filters = ["All", "Open", "Matching", "Partially Filled", "Confirmed", "At Risk"];
  const rows = REQUESTS.filter(r => filter === "All" || r.status === filter);
  return (
    <Panel
      title="Active staffing requests"
      sub={`${rows.length} of ${REQUESTS.length} requests · live queue`}
      action={
        <>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-ink-50 border border-ink-200">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2 h-6 rounded text-[11px] font-mono ${filter === f ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900"}`}>{f}</button>
            ))}
          </div>
          <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50">
            <Icon name="sliders" className="w-3.5 h-3.5" /> Filters
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-ink-900 text-paper text-[12px] hover:bg-ink-800">
            <Icon name="plus" className="w-3.5 h-3.5" /> New request
          </button>
        </>
      }
    >
      <div className="overflow-x-auto scrollarea">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
              <th className="px-5 py-2 font-medium">Request · Facility</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Shift</th>
              <th className="px-3 py-2 font-medium">Fulfillment</th>
              <th className="px-3 py-2 font-medium">Assigned</th>
              <th className="px-3 py-2 font-medium">Coordinator</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Urgency</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-md bg-paper/60 border border-ink-200 inline-flex items-center justify-center text-ink-600"><Icon name="building-2" className="w-4 h-4" /></span>
                    <div>
                      <div className="font-medium tracking-tight">{r.facility}</div>
                      <div className="text-[10px] font-mono text-ink-500">{r.id} · {r.spec}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-[12px]"><Icon name="stethoscope" className="w-3.5 h-3.5 text-ink-400" />{r.role}</span></td>
                <td className="px-3 py-3 text-ink-700">{r.shift}</td>
                <td className="px-3 py-3 w-[180px]">
                  <FillBar filled={r.filled} need={r.need} status={r.status} />
                </td>
                <td className="px-3 py-3">
                  {r.assigned.length ? (
                    <AvatarStack people={r.assigned.map((i: string, idx: number) => ({ initials: i, tone: (["teal","violet","amber","rose","ink"] as const)[idx % 5] }))} max={4} />
                  ) : (
                    <span className="text-[11px] font-mono text-ink-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Avatar initials={r.coord.i} tone={r.coord.t as any} size={22} />
                </td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3"><UrgencyBadge urgency={r.urgency} /></td>
                <td className="px-3 py-3 text-right">
                  <button className="w-7 h-7 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="more-horizontal" className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function FillBar({ filled, need, status }: { filled: number; need: number; status: string }) {
  const pct = (filled / need) * 100;
  const tone =
    status === "Confirmed" ? "bg-emerald-500" :
    status === "At Risk" ? "bg-rose-500" :
    status === "Matching" ? "bg-teal-500" :
    status === "Partially Filled" ? "bg-amber-500" :
    "bg-ink-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-ink-700 w-10 text-right">{filled}/{need}</span>
    </div>
  );
}

// ───────────── Workforce panel ─────────────
function WorkforcePanel() {
  const [spec, setSpec] = useState("All");
  const specs = ["All","ICU","ER","Med-Surg","Pedi","Telemetry","Floor","Rehab"];
  const rows = HCPS.filter(h => spec === "All" || h.spec === spec);
  return (
    <Panel
      title="Available healthcare professionals"
      sub={`${HCPS.filter(h => h.status === "Available").length} available now · ${HCPS.length} total in roster`}
      action={
        <>
          <div className="inline-flex items-center gap-1 px-1 h-7 rounded-md border border-ink-200 bg-white">
            <Icon name="map-pin" className="w-3 h-3 text-ink-400 ml-1" />
            <select className="text-[11px] font-mono bg-transparent outline-none pr-1">
              <option>SF Bay</option><option>East Bay</option><option>South Bay</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50">
            <Icon name="moon" className="w-3 h-3" /> Night
          </button>
          <button className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md bg-paper border border-ink-200 text-[11px]">
            <Icon name="sun" className="w-3 h-3" /> Day
          </button>
        </>
      }
    >
      <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 flex-wrap">
        {specs.map(s => (
          <button key={s} onClick={() => setSpec(s)} className={`text-[11px] font-mono h-6 px-2 rounded-full border ${
            spec === s ? "bg-ink-900 text-paper border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
          }`}>{s}</button>
        ))}
      </div>
      <div className="max-h-[420px] overflow-y-auto scrollarea">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
              <th className="px-5 py-2 font-medium">Professional</th>
              <th className="px-3 py-2 font-medium">Specialty</th>
              <th className="px-3 py-2 font-medium">Distance</th>
              <th className="px-3 py-2 font-medium">Compliance</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr key={i} className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40">
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={h.name.split(" ").map(s => s[0]).join("")} tone={["teal","violet","amber","rose","ink"][i % 5] as any} size={26} />
                    <div>
                      <div className="font-medium tracking-tight">{h.name}</div>
                      <div className="text-[10px] font-mono text-ink-500">{h.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-ink-700">{h.spec}</td>
                <td className="px-3 py-2.5 text-[12px] font-mono text-ink-600">{h.loc}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${h.comp === "current" ? "text-emerald-700" : "text-amber-700"}`}>
                    <Icon name={h.comp === "current" ? "shield-check" : "shield-alert"} className="w-3 h-3" />
                    {h.comp}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <HcpStatus status={h.status} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  {h.status === "Available" && h.ready && (
                    <button className="text-[11px] font-medium px-2 h-6 rounded-md bg-teal-700 text-white hover:bg-teal-800">Offer shift</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function HcpStatus({ status }: { status: string }) {
  const m: Record<string, { tone: string; dot: string }> = {
    "Available":            { tone: "bg-emerald-50 text-emerald-700", dot: "green" },
    "On Shift":             { tone: "bg-teal-50 text-teal-700",       dot: "teal"  },
    "Pending Confirmation": { tone: "bg-amber-50 text-amber-700",     dot: "amber" },
    "Unavailable":          { tone: "bg-ink-100 text-ink-600",         dot: "ink"   },
  };
  const s = m[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${s.tone}`}>
      <Dot tone={s.dot as any} pulse={status === "Pending Confirmation"} />
      {status}
    </span>
  );
}

// ───────────── Risks ─────────────
function RisksPanel() {
  return (
    <Panel
      title={<span className="flex items-center gap-2"><span>Operational risks</span><Badge tone="rose"><Dot tone="rose" pulse /> 4 active</Badge></span> as any}
      sub="Highest-priority issues that need a coordinator's eyes"
      action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900 px-2 h-7 rounded hover:bg-ink-100">View all</button>}
    >
      <div className="divide-y divide-ink-100">
        {RISKS.map((r, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-ink-50/40">
            <span className={`shrink-0 w-9 h-9 rounded-md inline-flex items-center justify-center ${
              r.tone === "rose" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
            }`}>
              <Icon name={r.icon} className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{r.kind}</span>
                <span className="text-[10px] font-mono text-ink-400">·</span>
                <span className="text-[10px] font-mono text-ink-500">{r.age}</span>
              </div>
              <div className="text-[13px] font-medium tracking-tight mt-0.5 truncate">{r.label}</div>
              <div className="text-[11px] font-mono text-ink-500">{r.sub}</div>
            </div>
            <button className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 h-7 rounded-md ${
              r.tone === "rose" ? "bg-rose-700 text-white hover:bg-rose-800" : "bg-ink-900 text-paper hover:bg-ink-800"
            }`}>
              Resolve <Icon name="arrow-right" className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ───────────── Coordinators ─────────────
function CoordinatorsPanel() {
  return (
    <Panel
      title="Coordinator activity"
      sub="Active assignments, queue depth, and median response time"
      action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900 px-2 h-7 rounded hover:bg-ink-100">Reassign</button>}
    >
      <div className="px-5 py-3 grid grid-cols-12 text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
        <div className="col-span-5">Coordinator</div>
        <div className="col-span-2 text-right">Active</div>
        <div className="col-span-2 text-right">Open</div>
        <div className="col-span-1 text-right">SLA</div>
        <div className="col-span-2 text-right">Load</div>
      </div>
      {COORDS.map((c, i) => (
        <div key={i} className="px-5 py-3 grid grid-cols-12 items-center text-[13px] border-b last:border-0 border-ink-100 hover:bg-ink-50/40">
          <div className="col-span-5 flex items-center gap-2.5 min-w-0">
            <Avatar initials={c.i} tone={c.t as any} size={28} />
            <div className="min-w-0">
              <div className="font-medium tracking-tight truncate">{c.name}</div>
              <div className="text-[10px] font-mono text-ink-500">on shift · {c.sla} avg</div>
            </div>
          </div>
          <div className="col-span-2 text-right tabular-nums">{c.active}</div>
          <div className="col-span-2 text-right tabular-nums">{c.open}</div>
          <div className="col-span-1 text-right text-[11px] font-mono tabular-nums text-ink-700">{c.sla}</div>
          <div className="col-span-2">
            <div className="ml-auto w-full">
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.load > 80 ? "bg-rose-500" : c.load > 60 ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${c.load}%` }} />
              </div>
              <div className="text-[10px] font-mono text-ink-500 text-right mt-1">{c.load}%</div>
            </div>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ───────────── Facility activity ─────────────
function FacilityPanel() {
  const items = REQUESTS.slice(0, 6);
  return (
    <Panel
      title="Facility requests"
      sub="Latest demand from connected facilities"
      action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900 px-2 h-7 rounded hover:bg-ink-100">Open queue</button>}
    >
      <div className="divide-y divide-ink-100">
        {items.map((r, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-ink-50/40">
            <span className="shrink-0 w-8 h-8 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-600"><Icon name="building-2" className="w-4 h-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium tracking-tight truncate">{r.facility} · {r.spec}</div>
              <div className="text-[11px] font-mono text-ink-500 truncate">{r.shift} · {r.need} {r.role}</div>
            </div>
            <div className="w-[120px]"><FillBar filled={r.filled} need={r.need} status={r.status} /></div>
            <UrgencyBadge urgency={r.urgency} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ───────────── Compliance alerts ─────────────
function CompliancePanel() {
  return (
    <Panel
      title="Compliance alerts"
      sub="Credentials expiring or missing — surfaced before they block matching"
      action={<Badge tone="amber"><Icon name="shield-alert" className="w-3 h-3" /> 5 to review</Badge>}
    >
      <div className="divide-y divide-ink-100">
        {COMPLIANCE.map((c, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-ink-50/40">
            <Avatar initials={c.i} tone={c.t as any} size={28} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium tracking-tight">{c.who}</div>
              <div className="text-[11px] font-mono text-ink-500">{c.item}</div>
            </div>
            <div className="w-[150px]">
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  c.tone === "rose" ? "bg-rose-500" : c.tone === "amber" ? "bg-amber-500" : c.tone === "teal" ? "bg-teal-500" : "bg-emerald-500"
                }`} style={{ width: `${c.pct}%` }} />
              </div>
              <div className={`text-[10px] font-mono mt-1 ${
                c.tone === "rose" ? "text-rose-700" : c.tone === "amber" ? "text-amber-700" : c.tone === "teal" ? "text-teal-700" : "text-emerald-700"
              }`}>{c.state}</div>
            </div>
            <button className="text-[11px] font-medium px-2 h-7 rounded-md border border-ink-200 hover:bg-ink-50">Review</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ───────────── Activity feed ─────────────
function ActivityFeed() {
  return (
    <Panel
      title="Recent activity"
      sub="Live operations stream"
      action={<span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700"><Dot tone="green" pulse /> live</span>}
    >
      <div className="px-5 py-3 max-h-[420px] overflow-y-auto scrollarea">
        <ol className="relative pl-4 border-l border-ink-200">
          {ACTIVITY.map((a, i) => (
            <li key={i} className="relative pl-4 pb-3 last:pb-0">
              <span className={`absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                a.tone === "green" ? "bg-emerald-500" :
                a.tone === "rose"  ? "bg-rose-500"     :
                a.tone === "amber" ? "bg-amber-500"     :
                a.tone === "teal"  ? "bg-teal-500"      : "bg-ink-400"
              }`} />
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono text-ink-500 w-10">{a.t}</span>
                <Icon name={a.icon} className={`w-3.5 h-3.5 ${
                  a.tone === "green" ? "text-emerald-600" :
                  a.tone === "rose"  ? "text-rose-600"     :
                  a.tone === "amber" ? "text-amber-600"     :
                  a.tone === "teal"  ? "text-teal-600"      : "text-ink-500"
                }`} />
                <div className="flex-1 text-[12px] leading-snug">
                  <span className="font-medium tracking-tight">{a.who}</span>{" "}
                  <span className="text-ink-600">{a.what}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

// ───────────── Quick actions ─────────────
function QuickActions() {
  const items = [
    { icon: "send",         label: "Create staffing request",  primary: true },
    { icon: "user-plus",    label: "Add healthcare professional" },
    { icon: "mail",         label: "Invite coordinator" },
    { icon: "building-2",   label: "Add facility" },
    { icon: "megaphone",    label: "Broadcast shift request" },
  ];
  return (
    <Panel title="Quick actions" sub="Common operations · one tap">
      <div className="p-3 grid grid-cols-1 gap-1.5">
        {items.map((it, i) => (
          <button key={i} className={`flex items-center gap-2.5 h-10 px-3 rounded-md text-[13px] tracking-tight ${
            it.primary ? "bg-ink-900 text-paper hover:bg-ink-800" : "bg-paper/40 hover:bg-ink-100 text-ink-800 border border-ink-200"
          }`}>
            <Icon name={it.icon} className="w-4 h-4" />
            <span className="flex-1 text-left">{it.label}</span>
            <Icon name="arrow-right" className="w-3.5 h-3.5 opacity-60" />
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ───────────── Page ─────────────
function App() {
  const [active, setActive] = useState("dashboard");
  return (
    <div className="min-h-screen bg-paper text-ink-900 flex">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="px-6 py-6 space-y-4 rise-in">
          {/* Greeting strip */}
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow>Tuesday · Mar 10 · 18:54 PT</Eyebrow>
              <h1 className="mt-1 text-[28px] leading-tight tracking-[-0.01em] font-medium">
                Good evening, Lena.<span className="font-serif italic text-teal-800"> Tonight's board.</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-ink-500">
                <Dot tone="green" pulse /> 14,820 shifts coordinated this week
              </div>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50">
                <Icon name="calendar" className="w-3.5 h-3.5" /> Today
              </button>
            </div>
          </div>

          <KpiStrip />

          {/* Main 12-col grid */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8 space-y-4">
              <RequestsTable />
              <WorkforcePanel />
              <CompliancePanel />
            </div>
            <div className="col-span-12 xl:col-span-4 space-y-4">
              <RisksPanel />
              <QuickActions />
              <CoordinatorsPanel />
              <FacilityPanel />
              <ActivityFeed />
            </div>
          </div>

          <div className="text-center text-[10px] font-mono text-ink-400 py-6">
            AsNeeded · operations · all signals nominal
          </div>
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
})();
