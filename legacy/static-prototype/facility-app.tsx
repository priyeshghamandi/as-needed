// Facility Portal — 7 screens for the facility side of AsNeeded
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const { useState, useMemo, useEffect } = React;
const { Icon, Button, Badge, Dot, Eyebrow, Avatar, AvatarStack } = window;

// ───────── Mock data ─────────
const FACILITY = { name:"Mercy Mt. Sinai", type:"Acute care · 320 beds", city:"San Francisco, CA", logo:"M" };
const AGENCY   = { name:"Apex Staffing",   coords:["L. Mahoney","R. Tan","E. Vargas"] };

const REQUESTS = [
  { id:"REQ-2849", role:"RN", spec:"ICU",      need:3, filled:2, date:"Tonight",     time:"19:00 — 07:00", status:"Matching",         urgency:"High",     coord:"LM", coordN:"L. Mahoney", coordT:"teal",   activity:"2m ago" },
  { id:"REQ-2851", role:"RN", spec:"ER",       need:2, filled:2, date:"Tonight",     time:"19:00 — 07:00", status:"Confirmed",        urgency:"Normal",   coord:"RT", coordN:"R. Tan",     coordT:"violet", activity:"18m ago" },
  { id:"REQ-2854", role:"RN", spec:"L&D",      need:1, filled:0, date:"Tomorrow",    time:"07:00 — 19:00", status:"At Risk",          urgency:"Critical", coord:"LM", coordN:"L. Mahoney", coordT:"teal",   activity:"4m ago" },
  { id:"REQ-2860", role:"RN", spec:"Med-Surg", need:4, filled:3, date:"Wed Mar 12",  time:"07:00 — 19:00", status:"Partially Filled", urgency:"High",     coord:"EV", coordN:"E. Vargas",  coordT:"amber",  activity:"42m ago" },
  { id:"REQ-2862", role:"LPN",spec:"Med-Surg", need:2, filled:0, date:"Thu Mar 13",  time:"07:00 — 19:00", status:"Open",             urgency:"Normal",   coord:"RT", coordN:"R. Tan",     coordT:"violet", activity:"1h ago" },
  { id:"REQ-2865", role:"RN", spec:"ICU",      need:2, filled:2, date:"Sat Mar 14",  time:"07:00 — 19:00", status:"Completed",        urgency:"Normal",   coord:"EV", coordN:"E. Vargas",  coordT:"amber",  activity:"yesterday" },
];

const STAFF = [
  { id:"S-101", i:"AM", t:"teal",   n:"Aria Martinez",  role:"RN", spec:"ICU",      time:"Tonight 19:00 — 07:00",     status:"Confirmed",            req:"REQ-2849", compliance:"verified" },
  { id:"S-104", i:"DC", t:"amber",  n:"Devon Carter",   role:"RN", spec:"ICU",      time:"Tonight 19:00 — 07:00",     status:"Checked In",           req:"REQ-2849", compliance:"verified" },
  { id:"S-108", i:"SN", t:"violet", n:"Sayuri Nguyen",  role:"RN", spec:"ER",       time:"Tonight 19:00 — 07:00",     status:"Confirmed",            req:"REQ-2851", compliance:"verified" },
  { id:"S-110", i:"BO", t:"rose",   n:"Brielle Okafor", role:"RN", spec:"ER",       time:"Tonight 19:00 — 07:00",     status:"Pending Confirmation", req:"REQ-2851", compliance:"verified" },
  { id:"S-112", i:"JR", t:"sky",    n:"Jordan Reyes",   role:"RN", spec:"Med-Surg", time:"Wed Mar 12 · 07:00 — 19:00", status:"Confirmed",            req:"REQ-2860", compliance:"verified" },
  { id:"S-115", i:"PV", t:"ink",    n:"Priya Vance",    role:"RN", spec:"Med-Surg", time:"Wed Mar 12 · 07:00 — 19:00", status:"Confirmed",            req:"REQ-2860", compliance:"expiring" },
  { id:"S-118", i:"TM", t:"amber",  n:"Tomás Marín",    role:"RN", spec:"Med-Surg", time:"Wed Mar 12 · 07:00 — 19:00", status:"Pending Confirmation", req:"REQ-2860", compliance:"verified" },
];

const ACTIVITY = [
  { i:"check-circle-2", t:"teal",  l:"Aria Martinez confirmed", s:"REQ-2849 · ICU · tonight 19:00",       w:"2m ago", live:true },
  { i:"user-check",     t:"green", l:"Devon Carter checked in",  s:"REQ-2849 · arrived 18:42",             w:"18m ago" },
  { i:"alert-triangle", t:"rose",  l:"L&D shift at risk",        s:"REQ-2854 · 0/1 filled · 12h to fill",  w:"4m ago" },
  { i:"refresh-ccw",    t:"amber", l:"Request updated",           s:"REQ-2860 · need increased 3 → 4",     w:"42m ago" },
  { i:"user-plus",      t:"teal",  l:"Coordinator assigned",      s:"E. Vargas → REQ-2860",                w:"1h ago" },
  { i:"send",           t:"ink",   l:"Replacement requested",     s:"REQ-2851 · backup notified",          w:"2h ago" },
  { i:"check",          t:"green", l:"Shift completed",            s:"REQ-2865 · 2 RNs · 12h coverage",     w:"yesterday" },
];

// ───────── Helpers ─────────
const STATUS_TONE: any = {
  "Open":              { bg:"bg-ink-100",      tx:"text-ink-700",      dot:"ink"   },
  "Matching":          { bg:"bg-sky-50",        tx:"text-sky-700",       dot:"teal", pulse:true },
  "Partially Filled":  { bg:"bg-amber-50",      tx:"text-amber-700",     dot:"amber" },
  "Confirmed":         { bg:"bg-emerald-50",    tx:"text-emerald-700",   dot:"green" },
  "Completed":         { bg:"bg-ink-100",       tx:"text-ink-700",       dot:"ink"   },
  "At Risk":           { bg:"bg-rose-50",       tx:"text-rose-700",      dot:"red", pulse:true },
};
const URG_TONE: any = {
  "Normal":   { bg:"bg-ink-100",   tx:"text-ink-700"   },
  "High":     { bg:"bg-amber-100", tx:"text-amber-800" },
  "Critical": { bg:"bg-rose-700",  tx:"text-white"     },
};

function StatusPill({ s }:any) {
  const t = STATUS_TONE[s] ?? STATUS_TONE["Open"];
  return <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${t.bg} ${t.tx}`}><Dot tone={t.dot} pulse={!!t.pulse} />{s}</span>;
}
function UrgPill({ u }:any) {
  const t = URG_TONE[u] ?? URG_TONE["Normal"];
  return <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${t.bg} ${t.tx}`}>{u}</span>;
}
function Progress({ filled, need, tone="teal" }:any) {
  const pct = need ? Math.min(100, Math.round((filled / need) * 100)) : 0;
  const fill = tone === "rose" ? "bg-rose-500" : tone === "amber" ? "bg-amber-500" : "bg-teal-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full ${fill}`} style={{width:`${pct}%`}} /></div>
      <span className="text-[11px] font-mono tabular-nums text-ink-700">{filled}/{need}</span>
    </div>
  );
}
function Eye({ children }:any) { return <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">{children}</div>; }

// ═══════════════════════════════════════════════════════
// Shell — sidebar + topbar
// ═══════════════════════════════════════════════════════
function Shell({ active, setActive, children, onCreate }:any) {
  const nav = [
    { id:"dash",     l:"Dashboard",        i:"layout-dashboard" },
    { id:"requests", l:"Staffing Requests", i:"clipboard-list", badge:"6" },
    { id:"create",   l:"New Request",       i:"plus" },
    { id:"tracking", l:"Status Tracking",   i:"git-branch" },
    { id:"staff",    l:"Assigned Staff",    i:"users", badge:"7" },
    { id:"messages", l:"Messages",          i:"message-circle", dot:true },
    { id:"settings", l:"Facility Settings", i:"settings-2" },
  ];
  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar */}
      <aside className="w-[252px] shrink-0 border-r border-ink-200 bg-white flex flex-col">
        <div className="px-4 pt-5 pb-4 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-ink-900 text-paper inline-flex items-center justify-center font-medium">A</div>
            <div className="leading-tight"><div className="text-[14px] font-medium tracking-tight">AsNeeded</div><div className="text-[10px] font-mono text-ink-500">facility portal</div></div>
          </div>
          <div className="mt-4 rounded-lg border border-ink-200 bg-paper/60 p-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-medium">{FACILITY.logo}</div>
            <div className="flex-1 min-w-0"><div className="text-[12px] font-medium tracking-tight truncate">{FACILITY.name}</div><div className="text-[10px] font-mono text-ink-500 truncate">{FACILITY.city}</div></div>
            <Icon name="chevrons-up-down" className="w-3.5 h-3.5 text-ink-400" />
          </div>
        </div>
        <nav className="px-2 py-3 flex-1 overflow-y-auto scrollarea">
          {nav.map(n => (
            <button key={n.id} onClick={() => n.id === "create" ? onCreate() : setActive(n.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] tracking-tight ${active === n.id ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"}`}>
              <Icon name={n.i} className="w-4 h-4" />
              <span className="flex-1 text-left">{n.l}</span>
              {n.badge && <span className={`text-[10px] font-mono px-1.5 h-4 rounded inline-flex items-center ${active === n.id ? "bg-paper/20 text-paper" : "bg-ink-100 text-ink-600"}`}>{n.badge}</span>}
              {n.dot && <Dot tone="red" pulse />}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-ink-100 text-[10px] font-mono text-ink-500 flex items-center gap-2">
          <Dot tone="green" /> connected to <span className="text-ink-800">{AGENCY.name}</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-ink-200 bg-white/95 backdrop-blur sticky top-0 z-30 flex items-center px-6 gap-3">
          <div className="text-[11px] font-mono text-ink-500 flex items-center gap-1.5">
            <span>{FACILITY.name}</span><Icon name="chevron-right" className="w-3 h-3" /><span className="text-ink-800">{nav.find(n => n.id === active)?.l ?? "Dashboard"}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-72 hidden md:block">
              <Icon name="search" className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input placeholder="Search requests, staff, REQ-IDs…" className="w-full h-9 pl-8 pr-3 rounded-md bg-paper border border-ink-200 text-[12px] outline-none focus:border-teal-500" />
            </div>
            <button className="relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="bell" className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" /></button>
            <button onClick={onCreate} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"><Icon name="plus" className="w-3.5 h-3.5" /> Create staffing request</button>
            <div className="w-px h-6 bg-ink-200 mx-1" />
            <Avatar initials="MR" tone="teal" size={32} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scrollarea">{children}</div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 1 · INVITE / LOGIN
// ═══════════════════════════════════════════════════════
function InviteAccept({ onActivate }:any) {
  const [mode, setMode] = useState<"invite"|"signin">("invite");
  return (
    <div className="min-h-screen flex">
      {/* Left panel — invitation context */}
      <div className="hidden lg:flex w-[44%] flex-col bg-ink-900 text-paper relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 25% 0%, rgba(15,121,117,0.35), transparent 55%), radial-gradient(circle at 90% 90%, rgba(174,226,222,0.18), transparent 55%)" }} />
        <div className="relative px-12 pt-10">
          <div className="inline-flex items-center gap-2"><div className="w-7 h-7 rounded-md bg-paper text-ink-900 inline-flex items-center justify-center font-medium">A</div><div className="text-[13px] font-medium tracking-tight">AsNeeded</div></div>
        </div>
        <div className="relative px-12 mt-auto mb-auto">
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-teal-300">Facility invitation</div>
          <h1 className="mt-3 text-[44px] leading-[1.05] tracking-[-0.015em] font-medium">
            Welcome to your<br/>
            <span className="font-serif italic text-teal-200">staffing coordination</span><br/>
            portal.
          </h1>
          <p className="mt-5 text-[14px] text-paper/70 max-w-md leading-relaxed">{AGENCY.name} has set up a coordination workspace for {FACILITY.name}. Activate access to request shifts, track fulfillment, and message your coordinator.</p>

          <div className="mt-9 rounded-xl border border-paper/15 bg-paper/5 backdrop-blur-sm p-5 max-w-md">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-300 mb-3">Invitation details</div>
            <div className="space-y-2.5">
              <Row k="Agency"      v={AGENCY.name}      ic="zap" />
              <Row k="Facility"    v={FACILITY.name}    ic="building-2" />
              <Row k="Type"        v={FACILITY.type}    ic="hospital" />
              <Row k="Coordinator" v="Lena Mahoney"     ic="user" />
              <Row k="Sent to"     v="m.rivera@mercy.org" ic="mail" />
            </div>
          </div>
        </div>
        <div className="relative px-12 pb-8 text-[11px] font-mono text-paper/50">© AsNeeded · facility coordination</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6 inline-flex items-center gap-2"><div className="w-7 h-7 rounded-md bg-ink-900 text-paper inline-flex items-center justify-center font-medium">A</div><div className="text-[13px] font-medium tracking-tight">AsNeeded</div></div>
            <Eyebrow>You've been invited</Eyebrow>
            <h2 className="mt-3 text-[26px] leading-tight tracking-[-0.01em] font-medium">
              {mode === "invite" ? <>Activate access to your <span className="font-serif italic text-teal-800">staffing portal</span>.</> : <>Sign in to <span className="font-serif italic text-teal-800">{FACILITY.name}</span>.</>}
            </h2>
            <p className="mt-2 text-[13px] text-ink-600">{mode === "invite" ? "Set up your account in under a minute. No credit card." : "Use the email this invitation was sent to."}</p>

            {mode === "invite" && (
              <form className="mt-7 space-y-4" onSubmit={(e:any) => { e.preventDefault(); onActivate(); }}>
                <Field label="Full name" required>
                  <input defaultValue="Maya Rivera" className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </Field>
                <Field label="Work email" required>
                  <div className="relative">
                    <input defaultValue="m.rivera@mercy.org" className="w-full h-11 px-3 pr-9 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"><Icon name="check" className="w-3 h-3" /> verified</span>
                  </div>
                </Field>
                <Field label="Phone number" hint="for urgent shift comms">
                  <div className="flex gap-2">
                    <select className="h-11 px-2 rounded-md border border-ink-200 bg-white text-[13px] font-mono"><option>+1</option><option>+44</option></select>
                    <input defaultValue="(415) 555-0142" className="flex-1 h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" />
                  </div>
                </Field>
                <Field label="Create password" required hint="min 10 chars · 1 number">
                  <input type="password" defaultValue="••••••••••••" className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="flex-1 h-1 rounded bg-emerald-500" /><span className="flex-1 h-1 rounded bg-emerald-500" /><span className="flex-1 h-1 rounded bg-emerald-500" /><span className="flex-1 h-1 rounded bg-ink-200" />
                    <span className="text-[10px] font-mono text-emerald-700 ml-1">Strong</span>
                  </div>
                </Field>
                <label className="flex items-start gap-2.5 mt-2"><input type="checkbox" defaultChecked className="mt-0.5 accent-teal-700" /><span className="text-[12px] text-ink-700 leading-snug">I agree to the <a className="underline">Terms</a> and <a className="underline">BAA / privacy policy</a>.</span></label>
                <button type="submit" className="w-full h-12 rounded-full bg-ink-900 text-paper text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-ink-800">Activate access <Icon name="arrow-right" className="w-3.5 h-3.5" /></button>
                <div className="text-center text-[12px] text-ink-600">Already have access? <button type="button" onClick={() => setMode("signin")} className="text-teal-800 font-medium hover:underline">Sign in</button></div>
              </form>
            )}

            {mode === "signin" && (
              <form className="mt-7 space-y-4" onSubmit={(e:any) => { e.preventDefault(); onActivate(); }}>
                <Field label="Work email" required><input defaultValue="m.rivera@mercy.org" className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></Field>
                <Field label="Password" required><input type="password" defaultValue="••••••••" className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></Field>
                <div className="flex items-center justify-between text-[12px]"><label className="flex items-center gap-2 text-ink-700"><input type="checkbox" defaultChecked className="accent-teal-700" /> Remember me</label><a className="text-teal-800 hover:underline">Forgot password?</a></div>
                <button type="submit" className="w-full h-12 rounded-full bg-ink-900 text-paper text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-ink-800">Sign in <Icon name="arrow-right" className="w-3.5 h-3.5" /></button>
                <div className="text-center text-[12px] text-ink-600">New here? <button type="button" onClick={() => setMode("invite")} className="text-teal-800 font-medium hover:underline">Activate invitation</button></div>
              </form>
            )}

            <div className="mt-8 flex items-center gap-3 text-[10px] font-mono text-ink-500">
              <span className="inline-flex items-center gap-1"><Icon name="shield-check" className="w-3 h-3 text-emerald-600" /> HIPAA aligned</span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1"><Icon name="lock" className="w-3 h-3 text-emerald-600" /> SOC 2 type II</span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1"><Icon name="zap" className="w-3 h-3 text-teal-600" /> SSO available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v, ic }:any) {
  return <div className="flex items-center gap-3 text-[13px]"><span className="w-7 h-7 rounded-md bg-paper/10 inline-flex items-center justify-center text-teal-200"><Icon name={ic} className="w-3.5 h-3.5" /></span><span className="text-paper/60 w-24 text-[11px] font-mono uppercase tracking-wider">{k}</span><span className="text-paper">{v}</span></div>;
}
function Field({ label, required, hint, children }:any) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-ink-600">{label}{required && <span className="text-rose-600 ml-0.5">*</span>}</label>
        {hint && <span className="text-[10px] font-mono text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 2 · DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard({ onOpenReq, onCreate, setActive }:any) {
  const kpis = [
    { l:"Open requests",    v:"6",  s:"+2 this week",        i:"clipboard-list",   t:"teal"   },
    { l:"Filled shifts",    v:"38", s:"this week · 92%",     i:"check-circle-2",   t:"green"  },
    { l:"At-risk requests", v:"1",  s:"L&D · 12h to fill",   i:"alert-triangle",   t:"rose",  pulse:true },
    { l:"Upcoming coverage",v:"14", s:"next 7 days",         i:"calendar",         t:"sky"    },
    { l:"Active professionals", v:"23", s:"on shift now · 7", i:"users",           t:"violet" },
  ];
  return (
    <div className="px-6 py-7 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <Eyebrow>Operational visibility</Eyebrow>
          <h1 className="mt-2 text-[32px] leading-tight tracking-[-0.015em] font-medium">
            Facility staffing dashboard<span className="font-serif italic text-teal-800"> · {new Date().toLocaleDateString(undefined,{weekday:"long"})}.</span>
          </h1>
          <div className="mt-1.5 text-[12px] font-mono text-ink-600">{FACILITY.name} · coordinated by {AGENCY.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="calendar" className="w-3.5 h-3.5" /> This week</button>
          <button className="h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="download" className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((k:any, i:number) => (
          <div key={i} className="rounded-lg bg-white border border-ink-200 p-4 hover:border-ink-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center bg-${k.t}-50 text-${k.t}-700`}><Icon name={k.i} className="w-3.5 h-3.5" /></span>
              {k.pulse && <Dot tone="red" pulse />}
            </div>
            <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-ink-500">{k.l}</div>
            <div className="mt-0.5 text-[28px] font-medium leading-none tabular-nums tracking-tight">{k.v}</div>
            <div className="mt-1 text-[11px] font-mono text-ink-500">{k.s}</div>
          </div>
        ))}
      </div>

      {/* Body grid */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {/* Active requests */}
        <section className="col-span-8 rounded-lg bg-white border border-ink-200">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <Icon name="clipboard-list" className="w-4 h-4 text-teal-700" />
            <div className="text-[13px] font-medium tracking-tight">Active staffing requests</div>
            <span className="text-[10px] font-mono text-ink-500 ml-1">{REQUESTS.filter(r => r.status !== "Completed").length} open</span>
            <button onClick={() => setActive("requests")} className="ml-auto text-[11px] font-medium text-teal-800 hover:underline">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                <th className="text-left font-normal py-2.5 px-5">Request</th>
                <th className="text-left font-normal py-2.5">Shift</th>
                <th className="text-left font-normal py-2.5">Fulfillment</th>
                <th className="text-left font-normal py-2.5">Coordinator</th>
                <th className="text-left font-normal py-2.5">Status</th>
                <th className="py-2.5 pr-5"></th>
              </tr></thead>
              <tbody>
                {REQUESTS.filter(r => r.status !== "Completed").map(r => (
                  <tr key={r.id} onClick={() => onOpenReq(r)} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50 cursor-pointer">
                    <td className="py-3 px-5">
                      <div className="font-medium tracking-tight">{r.role} · {r.spec}</div>
                      <div className="text-[10px] font-mono text-ink-500">{r.id} · {r.activity}</div>
                    </td>
                    <td className="py-3"><div className="font-medium">{r.date}</div><div className="text-[10px] font-mono text-ink-500">{r.time}</div></td>
                    <td className="py-3 w-44"><Progress filled={r.filled} need={r.need} tone={r.status === "At Risk" ? "rose" : r.status === "Partially Filled" ? "amber" : "teal"} /></td>
                    <td className="py-3"><div className="flex items-center gap-1.5"><Avatar initials={r.coord} tone={r.coordT} size={20} /><span className="text-ink-700">{r.coordN}</span></div></td>
                    <td className="py-3"><div className="flex flex-col items-start gap-1"><StatusPill s={r.status} /><UrgPill u={r.urgency} /></div></td>
                    <td className="py-3 pr-5"><Icon name="chevron-right" className="w-4 h-4 text-ink-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent activity */}
        <section className="col-span-4 rounded-lg bg-white border border-ink-200 flex flex-col">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <span className="relative inline-flex"><Dot tone="green" pulse /></span>
            <div className="text-[13px] font-medium tracking-tight">Recent activity</div>
            <span className="text-[10px] font-mono text-ink-500 ml-auto">live</span>
          </div>
          <ol className="px-2 py-2 max-h-[480px] overflow-y-auto scrollarea">
            {ACTIVITY.map((a:any, i:number) => (
              <li key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-ink-50">
                <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0 bg-${a.t}-50 text-${a.t}-700`}><Icon name={a.i} className="w-3.5 h-3.5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium tracking-tight">{a.l}</div>
                  <div className="text-[11px] font-mono text-ink-500 truncate">{a.s}</div>
                </div>
                <div className="text-[10px] font-mono text-ink-400 shrink-0 mt-0.5 flex items-center gap-1">{a.live && <Dot tone="green" pulse />}{a.w}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* Upcoming staff */}
        <section className="col-span-12 rounded-lg bg-white border border-ink-200">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <Icon name="users" className="w-4 h-4 text-teal-700" />
            <div className="text-[13px] font-medium tracking-tight">Upcoming assigned staff</div>
            <span className="text-[10px] font-mono text-ink-500 ml-1">next 7 days</span>
            <button onClick={() => setActive("staff")} className="ml-auto text-[11px] font-medium text-teal-800 hover:underline">All staff →</button>
          </div>
          <div className="grid grid-cols-4 divide-x divide-ink-100">
            {STAFF.slice(0,4).map(p => (
              <div key={p.id} className="p-4 hover:bg-ink-50/40">
                <div className="flex items-start gap-2.5">
                  <Avatar initials={p.i} tone={p.t} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium tracking-tight truncate">{p.n}</div>
                    <div className="text-[11px] font-mono text-ink-500">{p.role} · {p.spec}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5"><Icon name="clock" className="w-3 h-3 text-ink-400" /><span className="text-[11px] font-mono text-ink-700">{p.time}</span></div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <StatusPill s={p.status} />
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700"><Icon name="shield-check" className="w-3 h-3" /> verified</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating CTA */}
      <button onClick={onCreate} className="fixed bottom-6 right-6 inline-flex items-center gap-2 h-12 px-5 rounded-full bg-teal-700 text-white text-[14px] font-medium shadow-lifted hover:bg-teal-800"><Icon name="plus" className="w-4 h-4" /> Create staffing request</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 3 · CREATE REQUEST (sheet)
// ═══════════════════════════════════════════════════════
function CreateSheet({ open, onClose, onSubmit }:any) {
  const [s, setS] = useState<any>({ role:"RN", spec:"ICU", count:2, date:new Date(Date.now()+86400000).toISOString().slice(0,10), start:"19:00", end:"07:00", priority:"Urgent", notes:"" });
  const set = (p:any) => setS({ ...s, ...p });
  if (!open) return null;
  const dur = (() => {
    if (!s.start || !s.end) return null;
    const [sh,sm] = s.start.split(":").map(Number);
    const [eh,em] = s.end.split(":").map(Number);
    let m = (eh*60+em) - (sh*60+sm);
    if (m <= 0) m += 24*60;
    return (m/60).toFixed(1);
  })();
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[640px] max-w-[96vw] bg-paper shadow-2xl flex flex-col rise-in">
        <div className="px-7 pt-6 pb-4 border-b border-ink-200 flex items-start gap-3">
          <div className="flex-1">
            <Eyebrow>Operations · new</Eyebrow>
            <h2 className="mt-1 text-[22px] leading-tight tracking-[-0.01em] font-medium">Create staffing request<span className="font-serif italic text-teal-800"> · we'll match it.</span></h2>
            <div className="mt-1 text-[12px] font-mono text-ink-500">Submitted to {AGENCY.name} · typical first response under 5 min</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="x" className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 scrollarea">
          {/* Role */}
          <Field label="Role needed" required>
            <div className="grid grid-cols-4 gap-2">
              {[{i:"RN",l:"RN",s:"Registered"},{i:"LPN",l:"LPN",s:"Licensed practical"},{i:"CNA",l:"CNA",s:"Cert. nursing aide"},{i:"EMT",l:"EMT",s:"Emergency med."}].map(r => (
                <button key={r.i} onClick={() => set({role:r.i})} className={`px-3 py-2.5 rounded-lg border text-left ${s.role === r.i ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-600" : "border-ink-200 bg-white hover:border-ink-400"}`}>
                  <div className="text-[14px] font-medium">{r.l}</div>
                  <div className="text-[10px] font-mono text-ink-500">{r.s}</div>
                </button>
              ))}
            </div>
          </Field>
          {/* Specialty */}
          <Field label="Specialty" required>
            <div className="flex flex-wrap gap-1.5">
              {["ICU","ER","Pediatrics","Oncology","Med-Surg","L&D","Telemetry","PACU"].map(sp => (
                <button key={sp} onClick={() => set({spec:sp})} className={`h-8 px-3 rounded-full border text-[12px] font-mono ${s.spec === sp ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{sp}</button>
              ))}
            </div>
          </Field>
          {/* Count */}
          <Field label="Number of professionals" required>
            <div className="inline-flex items-center rounded-md border border-ink-200 bg-white">
              <button onClick={() => set({count:Math.max(1, s.count-1)})} className="w-10 h-11 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="minus" className="w-3.5 h-3.5" /></button>
              <input value={s.count} readOnly className="w-14 h-11 text-center text-[16px] font-mono tabular-nums border-x border-ink-200 outline-none bg-paper/30" />
              <button onClick={() => set({count:Math.min(20, s.count+1)})} className="w-10 h-11 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="plus" className="w-3.5 h-3.5" /></button>
              <span className="text-[11px] font-mono text-ink-500 px-3">{s.count === 1 ? "1 slot" : `${s.count} slots`}</span>
            </div>
          </Field>
          {/* Shift */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Shift date" required><input type="date" value={s.date} onChange={(e:any) => set({date:e.target.value})} className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" /></Field>
            <Field label="Start" required><input type="time" value={s.start} onChange={(e:any) => set({start:e.target.value})} className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" /></Field>
            <Field label="End" required><input type="time" value={s.end} onChange={(e:any) => set({end:e.target.value})} className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" /></Field>
          </div>
          {dur && <div className="rounded-md bg-paper/50 border border-ink-200 px-3 py-2 text-[11px] font-mono text-ink-700 inline-flex items-center gap-2"><Icon name="clock" className="w-3 h-3 text-teal-700" /> Duration: <span className="text-ink-900 font-medium">{dur} hours</span> · billable {(Number(dur)-0.5).toFixed(1)}h after break</div>}

          {/* Priority */}
          <Field label="Priority level" required>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id:"Standard",         l:"Standard",          s:"Within 24h",   i:"circle",        cls:"border-ink-200 bg-white",         tone:"bg-ink-100 text-ink-700" },
                { id:"Urgent",           l:"Urgent",            s:"Within 6h",    i:"trending-up",   cls:"border-amber-200 bg-amber-50/30", tone:"bg-amber-100 text-amber-800" },
                { id:"Critical Coverage",l:"Critical coverage", s:"Coverage gap now", i:"flame",      cls:"border-rose-300 bg-rose-50/30",   tone:"bg-rose-700 text-white" },
              ].map((p:any) => (
                <button key={p.id} onClick={() => set({priority:p.id})} className={`relative px-3 py-3 rounded-lg border text-left ${s.priority === p.id ? "ring-2 ring-teal-600 ring-offset-1" : "hover:border-ink-400"} ${p.cls}`}>
                  <Icon name={p.i} className={`w-4 h-4 ${p.id === "Critical Coverage" ? "text-rose-700" : p.id === "Urgent" ? "text-amber-700" : "text-ink-600"}`} />
                  <div className="mt-1.5 text-[14px] font-medium tracking-tight">{p.l}</div>
                  <div className="text-[10px] font-mono text-ink-500">{p.s}</div>
                  <span className={`absolute top-2 right-2 text-[9px] font-mono px-1.5 h-4 rounded inline-flex items-center ${p.tone}`}>{p.id.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </Field>
          {/* Notes */}
          <Field label="Notes / instructions" hint="visible to coordinator + assigned staff">
            <textarea value={s.notes} onChange={(e:any) => set({notes:e.target.value})} rows={3} placeholder="Charge nurse contact, parking, badge requirements, etc." className="w-full p-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
          </Field>
        </div>

        <div className="border-t border-ink-200 bg-paper/80 backdrop-blur px-7 py-4 flex items-center gap-2">
          <button onClick={onClose} className="text-[12px] font-mono text-ink-500 hover:text-ink-900">Cancel</button>
          <div className="ml-auto flex items-center gap-2">
            <button className="h-11 px-4 rounded-md border border-ink-200 bg-white text-[13px] hover:bg-ink-50">Save draft</button>
            <button onClick={() => onSubmit(s)} className="h-11 px-5 rounded-full bg-teal-700 text-white text-[13px] font-medium hover:bg-teal-800 inline-flex items-center gap-2"><Icon name="send" className="w-3.5 h-3.5" /> Submit request</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 4 · STATUS TRACKING (request detail)
// ═══════════════════════════════════════════════════════
function Tracking({ req, onBack, onUpdate, onCancel, onMessages }:any) {
  const stages = [
    { l:"Submitted",            i:"send",          done:true,  ts:"Mon 14:02" },
    { l:"Matching started",     i:"radar",         done:true,  ts:"Mon 14:03" },
    { l:"Professionals contacted", i:"users-round", done:true,  ts:"Mon 14:08" },
    { l:"Shift assigned",       i:"user-check",    done:true,  ts:"Mon 14:24" },
    { l:"Confirmed",            i:"check-circle-2",done:false, active:true, ts:"in progress" },
    { l:"Shift active",         i:"play",          done:false, ts:"19:00" },
    { l:"Completed",            i:"flag",          done:false, ts:"07:00" },
  ];
  const assigned = STAFF.filter(p => p.req === req.id);
  return (
    <div className="px-6 py-7 max-w-[1400px]">
      {/* Breadcrumb + back */}
      <button onClick={onBack} className="text-[11px] font-mono text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 mb-3"><Icon name="arrow-left" className="w-3 h-3" /> All requests</button>

      {/* Header card */}
      <div className="rounded-xl bg-white border border-ink-200 p-6">
        <div className="flex items-start gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">{req.id}</span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <StatusPill s={req.status} />
              <UrgPill u={req.urgency} />
            </div>
            <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.01em] font-medium">
              {req.need} {req.role} · {req.spec}<span className="font-serif italic text-teal-800"> at {FACILITY.name}.</span>
            </h1>
            <div className="mt-2 flex items-center gap-3 text-[12px] font-mono text-ink-600 flex-wrap">
              <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="w-3 h-3" /> {req.date} · {req.time}</span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1.5"><Icon name="user" className="w-3 h-3" /> Coordinator <span className="text-ink-900 font-medium">{req.coordN}</span></span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1.5">last activity {req.activity}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onMessages} className="h-10 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="message-circle" className="w-3.5 h-3.5" /> Message</button>
            <button onClick={onUpdate} className="h-10 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="edit-3" className="w-3.5 h-3.5" /> Update</button>
            <button onClick={onCancel} className="h-10 px-3 rounded-md border border-rose-200 bg-rose-50 text-[12px] font-medium text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1.5"><Icon name="x" className="w-3.5 h-3.5" /> Cancel</button>
          </div>
        </div>

        {/* Fulfillment hero */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-5 border-t border-ink-100">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Fulfillment</div>
            <div className="mt-1.5 flex items-baseline gap-1.5"><span className="text-[36px] font-medium tabular-nums leading-none">{req.filled}</span><span className="text-[16px] font-mono text-ink-500">/ {req.need}</span></div>
            <div className="mt-3 max-w-[280px]"><Progress filled={req.filled} need={req.need} tone={req.status === "At Risk" ? "rose" : "teal"} /></div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Time to start</div>
            <div className="mt-1.5 text-[36px] font-medium tabular-nums leading-none">8h 24m</div>
            <div className="mt-2 text-[11px] font-mono text-ink-500">starts {req.date.toLowerCase()} at {req.time.split(" ")[0]}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Risk score</div>
            <div className="mt-1.5 text-[36px] font-medium tabular-nums leading-none text-amber-700">Low</div>
            <div className="mt-2 text-[11px] font-mono text-ink-500">based on time-to-start, fill rate, market</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-5 rounded-xl bg-white border border-ink-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="git-branch" className="w-4 h-4 text-teal-700" />
          <div className="text-[14px] font-medium tracking-tight">Fulfillment timeline</div>
          <span className="ml-auto text-[10px] font-mono text-ink-500">{stages.filter(s => s.done).length} of {stages.length} stages complete</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {stages.map((st:any, i:number) => (
            <div key={i} className="text-center">
              <div className="relative">
                <div className={`mx-auto w-9 h-9 rounded-full inline-flex items-center justify-center ${st.done ? "bg-teal-700 text-white" : st.active ? "bg-ink-900 text-paper" : "bg-white border border-ink-200 text-ink-400"}`}>
                  {st.active && <span className="absolute inset-0 rounded-full bg-ink-900/30 ping-slow" />}
                  <Icon name={st.i} className="w-4 h-4 relative" />
                </div>
                {i < stages.length - 1 && <div className={`absolute top-[18px] left-[calc(50%+18px)] right-[-50%] h-0.5 ${st.done ? "bg-teal-600" : "bg-ink-200"}`} />}
              </div>
              <div className={`mt-2 text-[11px] font-medium tracking-tight ${st.active ? "text-ink-900" : st.done ? "text-ink-700" : "text-ink-400"}`}>{st.l}</div>
              <div className="text-[10px] font-mono text-ink-500 mt-0.5">{st.ts}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk + assigned */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {req.status === "At Risk" || req.urgency === "Critical" ? (
          <section className="col-span-12 rounded-xl bg-rose-50 border border-rose-200 p-5">
            <div className="flex items-start gap-3">
              <span className="relative inline-flex shrink-0"><span className="absolute inset-0 rounded-full bg-rose-300 ping-slow" /><span className="relative w-9 h-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center"><Icon name="alert-triangle" className="w-4 h-4" /></span></span>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-700">Risk alert · escalation eligible</div>
                <div className="text-[15px] font-medium tracking-tight text-rose-900 mt-0.5">{req.need - req.filled} of {req.need} positions still unfilled with &lt;12h to start</div>
                <div className="mt-1 text-[12px] text-rose-700">Coordinator has been notified. We've expanded the catchment to 25mi and broadcast to backup pool. Expect updates in the next 30 min.</div>
                <div className="mt-3 flex items-center gap-2"><button className="h-8 px-3 rounded-md bg-rose-600 text-white text-[12px] font-medium">Escalate to {AGENCY.name}</button><button className="h-8 px-3 rounded-md border border-rose-300 bg-white text-[12px] font-medium text-rose-700">Allow OT for current staff</button></div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="col-span-7 rounded-xl bg-white border border-ink-200">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <Icon name="users" className="w-4 h-4 text-teal-700" />
            <div className="text-[13px] font-medium tracking-tight">Assigned professionals</div>
            <span className="text-[10px] font-mono text-ink-500 ml-1">{assigned.length} of {req.need}</span>
          </div>
          <div className="divide-y divide-ink-100">
            {assigned.length === 0 && <div className="px-5 py-8 text-center text-[12px] text-ink-500">No one assigned yet · matching in progress</div>}
            {assigned.map(p => <StaffRow key={p.id} p={p} compact />)}
            {assigned.length < req.need && Array.from({length: req.need - assigned.length}).map((_,i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-ink-300 inline-flex items-center justify-center text-ink-400"><Icon name="user-round-search" className="w-4 h-4" /></div>
                <div className="flex-1"><div className="text-[12px] font-medium text-ink-700">Open slot</div><div className="text-[10px] font-mono text-ink-500">match engine searching · {req.spec} · within 15mi</div></div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 h-5 rounded"><Dot tone="teal" pulse /> Searching</span>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-5 rounded-xl bg-white border border-ink-200">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <Icon name="activity" className="w-4 h-4 text-teal-700" />
            <div className="text-[13px] font-medium tracking-tight">Matching activity</div>
            <span className="ml-auto text-[10px] font-mono text-emerald-700 inline-flex items-center gap-1"><Dot tone="green" pulse /> live</span>
          </div>
          <ol className="px-3 py-2">
            {[
              { i:"check-circle-2", t:"green", l:"Aria Martinez confirmed",        s:"match score 97 · 3.2mi", w:"2m" },
              { i:"send",            t:"teal",  l:"3 ICU RNs contacted",            s:"awaiting response",        w:"6m" },
              { i:"radar",           t:"sky",   l:"Catchment expanded · 15→20 mi", s:"+4 candidates added",       w:"14m" },
              { i:"user-plus",       t:"violet",l:"Coordinator assigned",          s:"L. Mahoney ⋅ ICU specialist", w:"24m" },
              { i:"git-branch",      t:"ink",   l:"Match engine started",           s:"7 candidates in catchment",  w:"38m" },
            ].map((a:any, i:number) => (
              <li key={i} className="flex items-start gap-2.5 px-2 py-2.5 rounded-md hover:bg-ink-50">
                <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0 bg-${a.t}-50 text-${a.t}-700`}><Icon name={a.i} className="w-3.5 h-3.5" /></span>
                <div className="flex-1 min-w-0"><div className="text-[12px] font-medium tracking-tight">{a.l}</div><div className="text-[11px] font-mono text-ink-500 truncate">{a.s}</div></div>
                <div className="text-[10px] font-mono text-ink-400 shrink-0 mt-0.5">{a.w} ago</div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 5 · ASSIGNED STAFF
// ═══════════════════════════════════════════════════════
function StaffRow({ p, compact, onMessage, onReport }:any) {
  return (
    <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-ink-50/50">
      <Avatar initials={p.i} tone={p.t} size={36} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium tracking-tight">{p.n}</span>
          {p.compliance === "verified" && <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700"><Icon name="shield-check" className="w-3 h-3" /> verified</span>}
          {p.compliance === "expiring" && <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700"><Icon name="alert-triangle" className="w-3 h-3" /> Hep B expiring</span>}
        </div>
        <div className="text-[11px] font-mono text-ink-500">{p.role} · {p.spec} · {p.time}</div>
      </div>
      <StatusPill s={p.status} />
      {!compact && (
        <div className="flex items-center gap-1 ml-2">
          <button className="h-8 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] font-medium hover:bg-ink-50">View</button>
          <button onClick={onMessage} className="h-8 w-8 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50"><Icon name="message-circle" className="w-3.5 h-3.5" /></button>
          <button onClick={onReport} className="h-8 w-8 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50 text-amber-700"><Icon name="flag" className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
function StaffView({ onMessages }:any) {
  const [tab, setTab] = useState("All");
  const counts: any = {
    "All": STAFF.length,
    "Pending Confirmation": STAFF.filter(s => s.status === "Pending Confirmation").length,
    "Confirmed": STAFF.filter(s => s.status === "Confirmed").length,
    "Checked In": STAFF.filter(s => s.status === "Checked In").length,
    "Completed": STAFF.filter(s => s.status === "Completed").length,
  };
  const list = tab === "All" ? STAFF : STAFF.filter(s => s.status === tab);
  return (
    <div className="px-6 py-7 max-w-[1400px]">
      <div className="mb-6">
        <Eyebrow>Workforce</Eyebrow>
        <h1 className="mt-2 text-[32px] leading-tight tracking-[-0.015em] font-medium">Assigned healthcare professionals<span className="font-serif italic text-teal-800"> · this week.</span></h1>
        <div className="mt-1.5 text-[12px] font-mono text-ink-600">{STAFF.length} pros across {Array.from(new Set(STAFF.map(s => s.req))).length} active requests</div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-ink-200">
        {Object.entries(counts).map(([k, v]:any) => (
          <button key={k} onClick={() => setTab(k)} className={`relative h-10 px-4 text-[13px] tracking-tight ${tab === k ? "text-ink-900 font-medium" : "text-ink-600 hover:text-ink-900"}`}>
            {k} <span className="text-[10px] font-mono text-ink-500 ml-1">{v}</span>
            {tab === k && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-ink-900" />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2"><div className="relative w-56"><Icon name="search" className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" /><input placeholder="Search professionals…" className="w-full h-9 pl-8 pr-3 rounded-md bg-white border border-ink-200 text-[12px] outline-none focus:border-teal-500" /></div><button className="h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="sliders-horizontal" className="w-3.5 h-3.5" /> Filters</button></div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {list.map(p => (
          <div key={p.id} className="rounded-xl bg-white border border-ink-200 p-5 hover:border-ink-300 transition-colors">
            <div className="flex items-start gap-3">
              <Avatar initials={p.i} tone={p.t} size={48} />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium tracking-tight truncate">{p.n}</div>
                <div className="text-[11px] font-mono text-ink-500">{p.role} · <span className="text-ink-700">{p.spec}</span></div>
                <div className="mt-2 flex items-center gap-1.5"><StatusPill s={p.status} /></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">
              <div className="flex items-center gap-2 text-[12px]"><Icon name="clock" className="w-3.5 h-3.5 text-ink-400" /><span className="text-ink-700">{p.time}</span></div>
              <div className="flex items-center gap-2 text-[12px]"><Icon name="clipboard-list" className="w-3.5 h-3.5 text-ink-400" /><span className="text-ink-700">{p.req}</span></div>
              <div className="flex items-center gap-2 text-[12px]">
                {p.compliance === "verified" ? <><Icon name="shield-check" className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-700">Compliance verified</span></> : <><Icon name="alert-triangle" className="w-3.5 h-3.5 text-amber-600" /><span className="text-amber-700">Hep B expiring 4/14</span></>}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <button className="flex-1 h-9 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50">View details</button>
              <button onClick={onMessages} className="w-9 h-9 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50"><Icon name="message-circle" className="w-3.5 h-3.5" /></button>
              <button className="w-9 h-9 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50 text-amber-700"><Icon name="flag" className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 6 · UPDATE / CANCEL
// ═══════════════════════════════════════════════════════
function UpdateSheet({ open, req, onClose, onCancel }:any) {
  const [s, setS] = useState<any>({ count: req?.need ?? 3, start:"19:00", end:"07:00" });
  useEffect(() => { if (req) setS({ count: req.need, start: req.time?.split(" — ")[0] ?? "19:00", end: req.time?.split(" — ")[1] ?? "07:00" }); }, [req]);
  if (!open || !req) return null;
  const incrCount = s.count > req.need;
  const decrCount = s.count < req.need;
  const timeChanged = s.start !== "19:00" || s.end !== "07:00";
  const set = (p:any) => setS({ ...s, ...p });
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[600px] max-w-[96vw] bg-paper shadow-2xl flex flex-col rise-in">
        <div className="px-7 pt-6 pb-4 border-b border-ink-200 flex items-start gap-3">
          <div className="flex-1">
            <Eyebrow>Adjust request</Eyebrow>
            <h2 className="mt-1 text-[22px] leading-tight tracking-[-0.01em] font-medium">Update {req.id}<span className="font-serif italic text-teal-800"> · {req.role} · {req.spec}.</span></h2>
            <div className="mt-1 text-[12px] font-mono text-ink-500">Currently: {req.filled}/{req.need} filled · {req.date} · {req.time}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="x" className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 scrollarea">
          <Field label="Number of professionals" hint="will adjust live">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-md border border-ink-200 bg-white">
                <button onClick={() => set({count:Math.max(0, s.count-1)})} className="w-10 h-11 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="minus" className="w-3.5 h-3.5" /></button>
                <input value={s.count} readOnly className="w-14 h-11 text-center text-[16px] font-mono tabular-nums border-x border-ink-200 outline-none bg-paper/30" />
                <button onClick={() => set({count:Math.min(20, s.count+1)})} className="w-10 h-11 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="plus" className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-[11px] font-mono text-ink-500">was {req.need}</span>
            </div>
            {incrCount && <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2"><Icon name="trending-up" className="w-3.5 h-3.5 text-amber-700 mt-0.5" /><div className="text-[11px] text-amber-800">Adding {s.count - req.need} slot{s.count - req.need > 1 ? "s" : ""} · match engine will broadcast to additional pros.</div></div>}
            {decrCount && <div className="mt-2 rounded-md bg-rose-50 border border-rose-200 p-3 flex items-start gap-2"><Icon name="alert-triangle" className="w-3.5 h-3.5 text-rose-700 mt-0.5" /><div className="text-[11px] text-rose-800">Reducing by {req.need - s.count} · {req.filled > s.count ? `${req.filled - s.count} confirmed RN${req.filled - s.count > 1 ? "s" : ""} will be released` : "no confirmed staff impacted"}.</div></div>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time"><input type="time" value={s.start} onChange={(e:any) => set({start:e.target.value})} className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" /></Field>
            <Field label="End time"><input type="time" value={s.end} onChange={(e:any) => set({end:e.target.value})} className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500" /></Field>
          </div>

          {timeChanged && <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2"><Icon name="clock" className="w-3.5 h-3.5 text-amber-700 mt-0.5" /><div className="text-[11px] text-amber-800">Time change requires re-confirmation from {req.filled} assigned RN{req.filled > 1 ? "s" : ""}. They'll be notified instantly.</div></div>}

          <Field label="Reason for update" hint="optional · helps coordinator">
            <textarea rows={2} placeholder="e.g. Census increased on 4N · need additional ICU coverage" className="w-full p-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 resize-none" />
          </Field>

          {/* Operational impact */}
          <div className="rounded-lg bg-white border border-ink-200 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-3">Operational impact</div>
            <ul className="space-y-2 text-[12px]">
              <li className="flex items-start gap-2"><Icon name="check-circle-2" className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /><span className="text-ink-800"><span className="font-medium">{req.filled}</span> already-confirmed RN{req.filled > 1 ? "s" : ""} {timeChanged ? "will be re-notified" : "remain assigned"}</span></li>
              <li className="flex items-start gap-2"><Icon name="user-plus" className="w-3.5 h-3.5 text-teal-700 mt-0.5" /><span className="text-ink-800">Match engine will run again for the {Math.max(0, s.count - req.filled)} open slot{Math.max(0, s.count - req.filled) !== 1 ? "s" : ""}</span></li>
              <li className="flex items-start gap-2"><Icon name="bell" className="w-3.5 h-3.5 text-amber-600 mt-0.5" /><span className="text-ink-800">{req.coordN} will be notified</span></li>
            </ul>
          </div>

          <div className="pt-2 border-t border-ink-200">
            <button onClick={onCancel} className="w-full h-11 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-[13px] font-medium hover:bg-rose-100 inline-flex items-center justify-center gap-2"><Icon name="x-octagon" className="w-3.5 h-3.5" /> Cancel this request entirely</button>
          </div>
        </div>

        <div className="border-t border-ink-200 bg-paper/80 backdrop-blur px-7 py-4 flex items-center gap-2">
          <button onClick={onClose} className="text-[12px] font-mono text-ink-500 hover:text-ink-900">Discard</button>
          <button onClick={onClose} className="ml-auto h-11 px-5 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800 inline-flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5" /> Apply update</button>
        </div>
      </aside>
    </div>
  );
}

function CancelDialog({ open, req, onClose, onConfirm }:any) {
  const [reason, setReason] = useState<string|null>(null);
  if (!open || !req) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl bg-white shadow-2xl w-full max-w-lg overflow-hidden rise-in">
        <div className="p-6 border-b border-ink-100 bg-rose-50/40">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shrink-0"><Icon name="x-octagon" className="w-5 h-5" /></span>
            <div className="flex-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-700">Cancel request · {req.id}</div>
              <h3 className="mt-1 text-[18px] font-medium tracking-tight">Cancel <span className="font-serif italic">{req.role} · {req.spec}</span> for {req.date}?</h3>
              <p className="mt-1 text-[12px] text-ink-700">{req.filled > 0 ? <><span className="font-medium">{req.filled} confirmed RN{req.filled > 1 ? "s" : ""}</span> will be released. They may not be available if rebooked.</> : "No staff have been confirmed yet — clean cancellation."}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Reason</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l:"Census decreased",   i:"trending-down" },
              { l:"Coverage rebooked",  i:"refresh-ccw" },
              { l:"Closed by leadership", i:"shield" },
              { l:"Ordered in error",     i:"x-circle" },
              { l:"Other",                i:"more-horizontal" },
            ].map(r => (
              <button key={r.l} onClick={() => setReason(r.l)} className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left ${reason === r.l ? "border-rose-300 bg-rose-50" : "border-ink-200 bg-white hover:border-ink-400"}`}>
                <Icon name={r.i} className="w-3.5 h-3.5 text-ink-500" /><span className="text-[12px] font-medium">{r.l}</span>{reason === r.l && <Icon name="check" className="w-3.5 h-3.5 text-rose-700 ml-auto" />}
              </button>
            ))}
          </div>
          <textarea rows={2} placeholder="Add a note for the coordinator (optional)" className="w-full p-3 rounded-md border border-ink-200 bg-paper/50 text-[12px] outline-none focus:border-teal-500" />
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <Icon name="info" className="w-3.5 h-3.5 text-amber-700 mt-0.5" />
            <div className="text-[11px] text-amber-800">Cancellations within 12h of shift start may incur a coverage fee per your agency contract.</div>
          </div>
        </div>
        <div className="p-4 border-t border-ink-100 bg-paper/40 flex items-center gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] font-medium">Keep request</button>
          <button disabled={!reason} onClick={onConfirm} className={`ml-auto h-10 px-5 rounded-md text-[13px] font-medium ${reason ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-ink-200 text-ink-500 cursor-not-allowed"}`}>Confirm cancellation</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREEN 7 · MESSAGES
// ═══════════════════════════════════════════════════════
function Messages() {
  const threads = [
    { id:"t1", who:"Lena Mahoney", role:"Coordinator · ICU desk", t:"teal",   i:"LM", last:"Aria's confirmed for tonight. She'll arrive 18:30 to badge in.", time:"2m",  unread:1, online:true },
    { id:"t2", who:"Apex · Operational alerts", role:"Automated · system", t:"ink", i:"⚙", last:"REQ-2854 marked at risk · 0/1 filled · expanding catchment to 25mi.", time:"4m",  unread:2 },
    { id:"t3", who:"Ravi Tan", role:"Coordinator · Med-Surg desk", t:"violet", i:"RT", last:"Wednesday's request bumped to 4 · all confirmed except Tomás.",  time:"42m", unread:0 },
    { id:"t4", who:"Elena Vargas", role:"Backup coordinator", t:"amber",      i:"EV", last:"Heads up — covering for Lena 14:00–18:00 today.",                  time:"1h",  unread:0 },
    { id:"t5", who:"Apex · Scheduling", role:"Automated · system", t:"ink",   i:"⚙", last:"Replacement coordinator assigned to REQ-2851.",                     time:"3h",  unread:0 },
  ];
  const [active, setActive] = useState(threads[0].id);
  const cur = threads.find(t => t.id === active)!;

  // Sample conversation
  const msgs = [
    { from:"agency", t:"system",   content:`Coordinator ${cur.who} assigned to ${FACILITY.name}.`, time:"14:24", system:true },
    { from:"agency", content:"Hi Maya — kicking off matching for tonight's ICU shift. 2/3 confirmed already. Working on the 3rd.", time:"14:32" },
    { from:"me", content:"Thanks Lena. Charge nurse is T. Okafor tonight, briefing at 18:45.", time:"14:36" },
    { from:"agency", content:"Noted. I'll relay to confirmed RNs.", time:"14:37" },
    { from:"agency", t:"event", content:"Aria Martinez confirmed · REQ-2849", time:"14:42", event:"check" },
    { from:"agency", content:"Aria's confirmed for tonight. She'll arrive 18:30 to badge in.", time:"14:48", unread:true },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Threads */}
      <div className="w-[320px] shrink-0 border-r border-ink-200 bg-white flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-ink-100">
          <div className="text-[18px] font-medium tracking-tight">Messages</div>
          <div className="text-[11px] font-mono text-ink-500 mt-0.5">{threads.reduce((acc,t) => acc+t.unread, 0)} unread · with {AGENCY.name}</div>
          <div className="relative mt-3"><Icon name="search" className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" /><input placeholder="Search messages…" className="w-full h-9 pl-8 pr-3 rounded-md bg-paper border border-ink-200 text-[12px] outline-none focus:border-teal-500" /></div>
        </div>
        <div className="flex-1 overflow-y-auto scrollarea">
          {threads.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left px-4 py-3 border-b border-ink-100 flex items-start gap-3 ${active === t.id ? "bg-teal-50/40 border-l-2 border-l-teal-700" : "hover:bg-ink-50"}`}>
              <div className="relative">
                <Avatar initials={t.i} tone={t.t} size={36} />
                {t.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5"><span className="text-[12px] font-medium tracking-tight truncate">{t.who}</span><span className="ml-auto text-[10px] font-mono text-ink-400 shrink-0">{t.time}</span></div>
                <div className="text-[10px] font-mono text-ink-500 truncate">{t.role}</div>
                <div className={`text-[12px] truncate mt-0.5 ${t.unread ? "text-ink-900 font-medium" : "text-ink-600"}`}>{t.last}</div>
              </div>
              {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-mono inline-flex items-center justify-center mt-1">{t.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col bg-paper/40 min-w-0">
        <div className="h-14 border-b border-ink-200 bg-white px-5 flex items-center gap-3 shrink-0">
          <div className="relative"><Avatar initials={cur.i} tone={cur.t} size={32} />{cur.online && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium tracking-tight">{cur.who}</div>
            <div className="text-[10px] font-mono text-ink-500 inline-flex items-center gap-1">{cur.online && <Dot tone="green" />}{cur.online ? "online · responds within 4m" : cur.role}</div>
          </div>
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="phone" className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="info" className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollarea px-6 py-5 space-y-3">
          <div className="text-center text-[10px] font-mono text-ink-400 py-2">— Today —</div>
          {msgs.map((m:any, i:number) => {
            if (m.system) return <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-ink-500 justify-center py-2"><span className="w-8 h-px bg-ink-200" /><Icon name="user-plus" className="w-3 h-3" /><span>{m.content}</span><span className="w-8 h-px bg-ink-200" /></div>;
            if (m.event) return <div key={i} className="flex justify-center"><div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] text-emerald-800"><Icon name="check-circle-2" className="w-3.5 h-3.5" /> {m.content}<span className="text-[10px] font-mono text-emerald-600 ml-1">{m.time}</span></div></div>;
            const me = m.from === "me";
            return (
              <div key={i} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[60%] ${me ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-3.5 py-2.5 text-[13px] leading-snug ${me ? "bg-ink-900 text-paper" : "bg-white border border-ink-200 text-ink-900"}`} style={{ borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>{m.content}</div>
                  <div className="text-[10px] font-mono text-ink-400 px-1 inline-flex items-center gap-1">{m.time}{me && <Icon name="check-check" className="w-3 h-3 text-teal-600" />}{m.unread && <span className="text-rose-500">· new</span>}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested replies + composer */}
        <div className="px-6 pb-3 flex flex-wrap gap-1.5">
          {["👍 Got it","Thanks!","ETA?","Confirm with charge"].map(q => <button key={q} className="h-7 px-3 rounded-full border border-ink-200 bg-white text-[11px] hover:border-ink-400">{q}</button>)}
        </div>
        <div className="border-t border-ink-200 bg-white p-3 flex items-end gap-2 shrink-0">
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-600"><Icon name="paperclip" className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-600"><Icon name="link-2" className="w-4 h-4" /></button>
          <textarea rows={1} placeholder={`Message ${cur.who}…`} className="flex-1 px-3 py-2 rounded-md border border-ink-200 bg-paper text-[13px] outline-none focus:border-teal-500 resize-none" />
          <button className="h-9 px-4 rounded-md bg-teal-700 text-white text-[12px] font-medium hover:bg-teal-800 inline-flex items-center gap-1.5"><Icon name="send" className="w-3.5 h-3.5" /> Send</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════
function Toast({ msg, onClose }:any) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] rise-in">
      <div className="rounded-full bg-ink-900 text-paper px-4 py-2.5 inline-flex items-center gap-2 shadow-lifted">
        <Dot tone="green" pulse /><span className="text-[12px]">{msg}</span><button onClick={onClose} className="text-[10px] font-mono text-paper/60 ml-2 hover:text-paper">dismiss</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Root App
// ═══════════════════════════════════════════════════════
function App() {
  const [phase, setPhase] = useState<"invite"|"app">("invite");
  const [active, setActive] = useState("dash");
  const [creating, setCreating] = useState(false);
  const [openReq, setOpenReq] = useState<any>(null);
  const [updating, setUpdating] = useState<any>(null);
  const [cancelling, setCancelling] = useState<any>(null);
  const [toast, setToast] = useState<string|null>(null);

  if (phase === "invite") return <InviteAccept onActivate={() => setPhase("app")} />;

  let body;
  if (active === "dash") body = <Dashboard onOpenReq={(r:any) => { setOpenReq(r); setActive("tracking"); }} onCreate={() => setCreating(true)} setActive={setActive} />;
  else if (active === "requests") body = <Dashboard onOpenReq={(r:any) => { setOpenReq(r); setActive("tracking"); }} onCreate={() => setCreating(true)} setActive={setActive} />;
  else if (active === "tracking" && openReq) body = <Tracking req={openReq} onBack={() => { setOpenReq(null); setActive("dash"); }} onUpdate={() => setUpdating(openReq)} onCancel={() => setCancelling(openReq)} onMessages={() => setActive("messages")} />;
  else if (active === "tracking") body = <Tracking req={REQUESTS[0]} onBack={() => setActive("dash")} onUpdate={() => setUpdating(REQUESTS[0])} onCancel={() => setCancelling(REQUESTS[0])} onMessages={() => setActive("messages")} />;
  else if (active === "staff") body = <StaffView onMessages={() => setActive("messages")} />;
  else if (active === "messages") body = <Messages />;
  else body = <Dashboard onOpenReq={(r:any) => { setOpenReq(r); setActive("tracking"); }} onCreate={() => setCreating(true)} setActive={setActive} />;

  return (
    <>
      <Shell active={active} setActive={setActive} onCreate={() => setCreating(true)}>{body}</Shell>
      <CreateSheet open={creating} onClose={() => setCreating(false)} onSubmit={(d:any) => { setCreating(false); setToast("Staffing request submitted · matching started"); setOpenReq(REQUESTS[0]); setActive("tracking"); }} />
      <UpdateSheet open={!!updating} req={updating} onClose={() => { setUpdating(null); setToast("Request updated · coordinator notified"); }} onCancel={() => { setUpdating(null); setCancelling(updating); }} />
      <CancelDialog open={!!cancelling} req={cancelling} onClose={() => setCancelling(null)} onConfirm={() => { setCancelling(null); setToast("Request cancelled · coordinator notified"); setActive("dash"); setOpenReq(null); }} />
      <Toast msg={toast} onClose={() => setToast(null)} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
