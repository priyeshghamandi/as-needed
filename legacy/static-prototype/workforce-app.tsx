// Workforce — list + professional profile
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const { useState, useMemo } = React;
const { Icon, Dot, Avatar, AvatarStack, Eyebrow, Badge, AddProfessionalSheet } = window;

// ───────────── Mock data ─────────────
type Avail = "Available"|"On Shift"|"Unavailable"|"Pending Confirmation"|"Off Duty";
type Comp  = "Verified"|"Expiring Soon"|"Missing Requirement"|"Suspended";
type Rel   = "Excellent"|"Good"|"At Risk";

const PROS: any[] = [
  { id:"AM", name:"Aria Martinez",   role:"RN",  spec:"ICU",       loc:"SF · 94110", avail:"On Shift",            assigned:"Mercy Mt. Sinai · ICU", comp:"Verified",          rel:"Excellent", relScore:97, last:"yesterday", ready:96, t:"teal" },
  { id:"DC", name:"Devon Carter",    role:"RN",  spec:"Med-Surg",  loc:"Oakland · 94609", avail:"Available",      assigned:"—",                     comp:"Verified",          rel:"Excellent", relScore:96, last:"2d",        ready:94, t:"amber" },
  { id:"SN", name:"Sayuri Nguyen",   role:"RN",  spec:"ICU",       loc:"SF · 94103", avail:"Pending Confirmation",assigned:"Mercy Mt. Sinai · ICU",  comp:"Expiring Soon",     rel:"Good",      relScore:88, last:"4d",        ready:78, t:"violet" },
  { id:"JR", name:"Jamal Reyes",     role:"RN",  spec:"ER",        loc:"Oakland · 94609", avail:"Available",      assigned:"—",                     comp:"Verified",          rel:"Excellent", relScore:92, last:"3d",        ready:91, t:"rose" },
  { id:"MS", name:"Mei Sato",        role:"CNA", spec:"Pedi",      loc:"SF · 94115", avail:"Off Duty",           assigned:"—",                     comp:"Verified",          rel:"Good",      relScore:85, last:"5d",        ready:82, t:"teal" },
  { id:"GH", name:"Grace Hall",      role:"LPN", spec:"Rehab",     loc:"Menlo · 94025", avail:"Available",       assigned:"—",                     comp:"Verified",          rel:"Excellent", relScore:94, last:"1d",        ready:93, t:"violet" },
  { id:"AT", name:"Anika Trent",     role:"CNA", spec:"Floor 2",   loc:"SJ · 95113", avail:"On Shift",           assigned:"Pinegrove SNF · Fl 2",   comp:"Verified",          rel:"Good",      relScore:84, last:"today",     ready:80, t:"amber" },
  { id:"KP", name:"Kareem Patel",    role:"RN",  spec:"Telemetry", loc:"SF · 94117", avail:"Unavailable",        assigned:"—",                     comp:"Missing Requirement",rel:"At Risk",   relScore:62, last:"14d",       ready:48, t:"rose" },
  { id:"DC2",name:"Dana Cho",        role:"RN",  spec:"L&D",       loc:"Berkeley · 94704", avail:"Available",    assigned:"—",                     comp:"Verified",          rel:"Excellent", relScore:95, last:"2d",        ready:92, t:"teal" },
  { id:"TM", name:"Tomás Mendes",    role:"EMT", spec:"Transport", loc:"SF · 94158", avail:"Available",         assigned:"—",                     comp:"Verified",          rel:"Good",      relScore:81, last:"6d",        ready:78, t:"violet" },
  { id:"RV", name:"Riya Vasquez",    role:"RN",  spec:"PACU",      loc:"Daly City · 94014", avail:"Off Duty",   assigned:"—",                     comp:"Expiring Soon",     rel:"Good",      relScore:86, last:"3d",        ready:74, t:"amber" },
  { id:"BO", name:"Bobby O'Hara",    role:"CNS", spec:"Oncology",  loc:"SF · 94143", avail:"Available",         assigned:"—",                     comp:"Verified",          rel:"Excellent", relScore:98, last:"yesterday", ready:97, t:"rose" },
];

// ───────────── Sidebar/Topbar (shared) ─────────────
function LogoMark() {
  return (<span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center"><span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" /><span className="block w-2 h-2 bg-teal-400 rounded-full" /></span>);
}
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"layout-grid", href:"ops.html" },
  { id:"requests", label:"Staffing Requests", icon:"clipboard-list", count:18, href:"requests.html" },
  { id:"workforce", label:"Workforce", icon:"users", count:124, active:true },
  { id:"facilities", label:"Facilities", icon:"building-2" },
  { id:"shifts", label:"Shifts", icon:"calendar-range" },
  { id:"compliance", label:"Compliance", icon:"shield-check", count:5 },
  { id:"messages", label:"Messages", icon:"message-circle" },
  { id:"reports", label:"Reports", icon:"bar-chart-3" },
  { id:"settings", label:"Settings", icon:"settings-2" },
];

function Sidebar() {
  return (
    <aside className="w-[232px] shrink-0 h-screen sticky top-0 border-r border-ink-200/70 bg-paper flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-ink-200/70"><LogoMark /><span className="font-semibold tracking-tight text-[15px]">AsNeeded</span></div>
      <button className="mx-3 mt-3 px-2.5 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 flex items-center gap-2.5 text-left">
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px]">AS</span>
        <div className="min-w-0 flex-1"><div className="text-[12px] font-medium tracking-tight truncate">Apex Staffing</div><div className="text-[10px] font-mono text-ink-500 truncate">SF Bay · Owner</div></div>
        <Icon name="chevrons-up-down" className="w-3.5 h-3.5 text-ink-400" />
      </button>
      <nav className="px-2 mt-3 flex flex-col gap-px">
        {NAV.map((n:any) => (
          <a key={n.id} href={n.href ?? "#"} className={`group flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight ${n.active ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"}`}>
            <Icon name={n.icon} className={`w-4 h-4 ${n.active ? "text-paper" : "text-ink-500"}`} />
            <span className="flex-1">{n.label}</span>
            {n.count != null && <span className={`text-[10px] font-mono px-1.5 h-4 inline-flex items-center rounded ${n.active ? "bg-paper/20 text-paper" : "bg-ink-100 text-ink-700"}`}>{n.count}</span>}
          </a>
        ))}
      </nav>
      <div className="mt-auto p-3">
        <div className="rounded-lg border border-ink-200 bg-white p-3"><div className="flex items-center gap-2"><Dot tone="green" pulse /><div className="text-[11px] font-mono text-ink-700">All systems operational</div></div></div>
        <button className="mt-3 w-full flex items-center gap-2 px-2 h-9 rounded-md hover:bg-ink-100 text-[13px] text-ink-800"><Avatar initials="LM" tone="teal" size={20} /><div className="flex-1 text-left text-[12px] tracking-tight">Lena Mahoney</div></button>
      </div>
    </aside>
  );
}

function Topbar({ trail, onAdd }: any) {
  return (
    <div className="sticky top-0 z-30 h-14 bg-paper/85 backdrop-blur border-b border-ink-200/70">
      <div className="h-full px-6 flex items-center gap-3">
        <nav className="flex items-center gap-1.5 text-[12px]">
          <a href="ops.html" className="text-ink-500 hover:text-ink-900">Operations</a>
          <Icon name="chevron-right" className="w-3 h-3 text-ink-300" />
          {trail}
        </nav>
        <div className="ml-6 relative w-[360px] max-w-[40vw]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"><Icon name="search" className="w-4 h-4" /></span>
          <input placeholder="Search by name, specialty, license…" className="w-full h-9 pl-9 pr-16 rounded-lg border border-ink-200 bg-white text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-400 px-1.5 h-5 inline-flex items-center rounded border border-ink-200 bg-paper">⌘K</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="bell" className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-paper" /></button>
          <div className="w-px h-5 bg-ink-200 mx-1" />
          <button onClick={onAdd} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"><Icon name="user-plus" className="w-3.5 h-3.5" /> Add professional</button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Badges ─────────────
function AvailBadge({ a }: { a: Avail }) {
  const m: Record<Avail,{cls:string;dot:any;pulse?:boolean}> = {
    "Available":             { cls:"bg-emerald-50 text-emerald-700", dot:"green",  pulse:true },
    "On Shift":              { cls:"bg-teal-50 text-teal-800",        dot:"teal",   pulse:true },
    "Unavailable":           { cls:"bg-ink-100 text-ink-600",         dot:"ink" },
    "Pending Confirmation":  { cls:"bg-amber-50 text-amber-800",      dot:"amber",  pulse:true },
    "Off Duty":              { cls:"bg-ink-100 text-ink-500",         dot:"ink" },
  };
  const s = m[a];
  return <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${s.cls}`}><Dot tone={s.dot} pulse={s.pulse} />{a}</span>;
}
function CompBadge({ c }: { c: Comp }) {
  const m: Record<Comp,{cls:string;icon:string}> = {
    "Verified":             { cls:"text-emerald-700", icon:"shield-check" },
    "Expiring Soon":        { cls:"text-amber-700",   icon:"shield"       },
    "Missing Requirement":  { cls:"text-rose-700",    icon:"shield-alert" },
    "Suspended":            { cls:"text-ink-500 line-through", icon:"shield-off" },
  };
  const s = m[c];
  return <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${s.cls}`}><Icon name={s.icon} className="w-3 h-3" />{c}</span>;
}
function RelBar({ score, label }: { score: number; label: Rel }) {
  const tone = label === "Excellent" ? "bg-emerald-500" : label === "Good" ? "bg-teal-500" : "bg-rose-500";
  const txt = label === "Excellent" ? "text-emerald-700" : label === "Good" ? "text-teal-700" : "text-rose-700";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${tone}`} style={{ width: `${score}%` }} /></div>
      <span className={`text-[10px] font-mono ${txt}`}>{score}</span>
    </div>
  );
}

// ───────────── LIST ─────────────
const AVAIL_TABS: ("All"|Avail)[] = ["All","Available","On Shift","Pending Confirmation","Unavailable","Off Duty"];

function ListView({ onOpen, onAdd }: any) {
  const [tab, setTab] = useState<"All"|Avail>("All");
  const [view, setView] = useState<"table"|"grid">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedView, setSavedView] = useState("All workforce");

  const filtered = useMemo(() => tab === "All" ? PROS : PROS.filter(p => p.avail === tab), [tab]);
  const counts: Record<string,number> = useMemo(() => {
    const c: any = { All: PROS.length };
    PROS.forEach(p => c[p.avail] = (c[p.avail] ?? 0) + 1);
    return c;
  }, []);

  const kpi = [
    { label:"Active professionals", v:124, sub:"network total", trend:"+6 this week", tone:"ink" },
    { label:"Available now",        v:31,  sub:"opted-in to shifts", trend:"live", tone:"green" },
    { label:"On shift",              v:42,  sub:"in active assignments", trend:"+3 vs yesterday", tone:"teal" },
    { label:"Compliance alerts",     v:5,   sub:"need attention", trend:"REQ-flagged", tone:"rose" },
    { label:"Expiring credentials",  v:8,   sub:"within 30 days", trend:"3 critical", tone:"amber" },
    { label:"Fill readiness",        v:"94", sub:"composite score", trend:"+2 vs last wk", tone:"teal" },
  ];

  const toggle = (id:string) => { const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); setSelected(n); };
  const toggleAll = () => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));

  return (
    <main className="px-6 py-6 space-y-4 rise-in">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Operations · workforce</Eyebrow>
          <h1 className="mt-1 text-[28px] leading-tight tracking-[-0.01em] font-medium">Workforce<span className="font-serif italic text-teal-800"> · the people behind every shift.</span></h1>
          <div className="mt-1 text-[11px] font-mono text-ink-500">{PROS.length} active · {counts["Available"] ?? 0} available now · 5 compliance alerts</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="upload-cloud" className="w-3.5 h-3.5" /> Import CSV</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="megaphone" className="w-3.5 h-3.5" /> Broadcast shift</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="download" className="w-3.5 h-3.5" /> Export</button>
          <button onClick={onAdd} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"><Icon name="user-plus" className="w-3.5 h-3.5" /> Add professional</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {kpi.map((x, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-xl border border-ink-200 bg-white p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{x.label}</div>
            <div className="mt-2 text-[28px] font-medium tracking-tight tabular-nums">{x.v}</div>
            <div className="text-[11px] font-mono text-ink-500">{x.sub}</div>
            <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono ${x.tone === "green" ? "text-emerald-700" : x.tone === "rose" ? "text-rose-700" : x.tone === "amber" ? "text-amber-700" : x.tone === "teal" ? "text-teal-700" : "text-ink-600"}`}>
              <Dot tone={x.tone === "ink" ? "ink" : x.tone as any} pulse={x.tone === "green" || x.tone === "teal"} />{x.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Saved views */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All workforce","Available · ICU only","Compliance attention","On shift now","High reliability"].map(v => (
          <button key={v} onClick={() => setSavedView(v)} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] tracking-tight ${savedView === v ? "bg-ink-900 text-paper border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"}`}>
            <Icon name={savedView === v ? "bookmark-check" : "bookmark"} className="w-3 h-3" /> {v}
          </button>
        ))}
        <button className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-500 hover:text-ink-900 ml-1"><Icon name="plus" className="w-3 h-3" /> Save current view</button>
        <div className="ml-auto inline-flex items-center gap-1 p-0.5 rounded-md bg-ink-100">
          <button onClick={() => setView("table")} className={`px-2 h-7 rounded inline-flex items-center gap-1 text-[11px] ${view === "table" ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}><Icon name="rows-3" className="w-3 h-3" /> Table</button>
          <button onClick={() => setView("grid")} className={`px-2 h-7 rounded inline-flex items-center gap-1 text-[11px] ${view === "grid" ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}><Icon name="layout-grid" className="w-3 h-3" /> Grid</button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {AVAIL_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11px] font-mono ${tab === t ? "bg-ink-900 text-paper border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"}`}>
            {t}
            <span className={`text-[9px] px-1 h-3.5 inline-flex items-center rounded ${tab === t ? "bg-paper/20" : "bg-ink-100"}`}>{counts[t] ?? 0}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50"><Icon name="sliders" className="w-3 h-3" /> Role · Spec · Location</button>
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50"><Icon name="arrow-up-down" className="w-3 h-3" /> Sort</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="rounded-lg bg-ink-900 text-paper px-4 h-10 flex items-center gap-3 text-[12px]">
          <span className="font-mono text-paper/80">{selected.size} selected</span>
          <span className="text-paper/30">·</span>
          {["Broadcast shift","Request availability","Tag","Suspend","Export"].map(a => <button key={a} className="text-paper/90 hover:text-paper inline-flex items-center gap-1.5"><Icon name="dot" className="w-3 h-3" />{a}</button>)}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-paper/60 hover:text-paper"><Icon name="x" className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {view === "table" ? (
        <section className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <div className="overflow-x-auto scrollarea">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100 bg-paper/40">
                  <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-teal-700" /></th>
                  <th className="px-3 py-2.5">Professional</th>
                  <th className="px-3 py-2.5">Role · Spec</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5">Availability</th>
                  <th className="px-3 py-2.5">Current assignment</th>
                  <th className="px-3 py-2.5">Compliance</th>
                  <th className="px-3 py-2.5">Reliability</th>
                  <th className="px-3 py-2.5">Last shift</th>
                  <th className="px-3 py-2.5 w-[140px]">Shift readiness</th>
                  <th className="px-3 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} onClick={() => onOpen(p)} className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40 cursor-pointer">
                    <td className="px-3 py-3" onClick={(e:any) => e.stopPropagation()}><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="accent-teal-700" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={p.id.slice(0,2)} tone={p.t} size={32} />
                        <div><div className="font-medium tracking-tight">{p.name}</div><div className="text-[10px] font-mono text-ink-500">{p.id} · 3 yrs</div></div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-[12px]">{p.role}</span> <span className="text-[10px] font-mono text-ink-500">{p.spec}</span></td>
                    <td className="px-3 py-3 text-[11px] font-mono text-ink-700">{p.loc}</td>
                    <td className="px-3 py-3"><AvailBadge a={p.avail} /></td>
                    <td className="px-3 py-3 text-[12px] text-ink-700">{p.assigned === "—" ? <span className="text-ink-400">—</span> : p.assigned}</td>
                    <td className="px-3 py-3"><CompBadge c={p.comp} /></td>
                    <td className="px-3 py-3"><RelBar score={p.relScore} label={p.rel} /></td>
                    <td className="px-3 py-3 text-[11px] font-mono text-ink-500">{p.last}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.ready >= 90 ? "bg-emerald-500" : p.ready >= 75 ? "bg-teal-500" : p.ready >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${p.ready}%` }} /></div>
                        <span className="text-[10px] font-mono tabular-nums text-ink-700 w-7 text-right">{p.ready}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right" onClick={(e:any) => e.stopPropagation()}>
                      <button className="w-7 h-7 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="more-horizontal" className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between text-[11px] font-mono text-ink-500">
            <div>Showing 1–{filtered.length} of {PROS.length}</div>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center"><Icon name="chevron-left" className="w-3.5 h-3.5" /></button>
              <span className="px-2 h-7 rounded bg-ink-900 text-paper inline-flex items-center">1</span>
              <span className="px-2 h-7 rounded hover:bg-ink-100 inline-flex items-center cursor-pointer">2</span>
              <span className="px-2 h-7 rounded hover:bg-ink-100 inline-flex items-center cursor-pointer">3</span>
              <button className="w-7 h-7 rounded border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center"><Icon name="chevron-right" className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => onOpen(p)} className="text-left rounded-xl border border-ink-200 bg-white p-4 hover:border-ink-400">
              <div className="flex items-start gap-3">
                <Avatar initials={p.id.slice(0,2)} tone={p.t} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><div className="text-[14px] font-medium tracking-tight truncate">{p.name}</div></div>
                  <div className="text-[11px] font-mono text-ink-500">{p.role} · {p.spec} · {p.loc}</div>
                </div>
                <AvailBadge a={p.avail} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">Compliance</div><div className="mt-0.5"><CompBadge c={p.comp} /></div></div>
                <div><div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">Reliability</div><div className="mt-0.5"><RelBar score={p.relScore} label={p.rel} /></div></div>
              </div>
              <div className="mt-3"><div className="text-[9px] font-mono uppercase tracking-wider text-ink-500 mb-1">Shift readiness · {p.ready}</div><div className="h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.ready >= 90 ? "bg-emerald-500" : p.ready >= 75 ? "bg-teal-500" : p.ready >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${p.ready}%` }} /></div></div>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

// ───────────── PROFILE ─────────────
const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS = ["07","11","15","19","23","03"];
const SHIFTS_GRID: any[] = [
  { day:0, startH:19, len:12, kind:"shift",   facility:"Mercy ICU" },
  { day:1, startH:0,  len:7,  kind:"shift",   facility:"Mercy ICU (cont.)" },
  { day:2, startH:7,  len:12, kind:"avail" },
  { day:3, startH:7,  len:12, kind:"avail" },
  { day:4, startH:0,  len:24, kind:"off",     facility:"Time off" },
  { day:5, startH:19, len:12, kind:"oncall",  facility:"On-call" },
  { day:6, startH:7,  len:12, kind:"avail" },
];

const CREDS = [
  { item:"RN License (CA · #1248821)", state:"Verified",      exp:"Jun 2027", icon:"id-card" },
  { item:"BLS · CPR (AHA)",            state:"Verified",      exp:"Sep 2026", icon:"heart-pulse" },
  { item:"ACLS",                        state:"Verified",      exp:"Mar 2026", icon:"activity" },
  { item:"PALS",                        state:"Pending Review",exp:"—",        icon:"baby" },
  { item:"Background check (7-yr)",     state:"Verified",      exp:"Aug 2027", icon:"user-check" },
  { item:"Vaccination · Flu / COVID",    state:"Verified",      exp:"Oct 2026", icon:"syringe" },
  { item:"Vaccination · Hep B",         state:"Expiring Soon", exp:"Apr 2026", icon:"syringe" },
  { item:"TB screening",                state:"Verified",      exp:"Jan 2027", icon:"clipboard-check" },
];

const SHIFT_HISTORY = [
  { facility:"Mercy Mt. Sinai · ICU",     date:"Mar 9",  hrs:12,  state:"Completed",    perf:"On time", rating:5 },
  { facility:"Bayview Care · Med-Surg",   date:"Mar 6",  hrs:8,   state:"Completed",    perf:"On time", rating:5 },
  { facility:"Mercy Mt. Sinai · ICU",     date:"Mar 4",  hrs:12,  state:"Completed",    perf:"15m late",rating:4 },
  { facility:"Northridge · ER",            date:"Feb 28", hrs:0,   state:"No-show",     perf:"No-show", rating:2 },
  { facility:"Mercy Mt. Sinai · ICU",     date:"Feb 25", hrs:12,  state:"Completed",    perf:"On time", rating:5 },
  { facility:"Pinegrove SNF · Floor 2",    date:"Feb 22", hrs:0,   state:"Cancelled",   perf:"Cancelled <12h", rating:3 },
];

const COMM_TIMELINE = [
  { t:"now",   icon:"check-circle-2", tone:"green", who:"System",   what:"shift confirmation accepted · Mercy ICU tonight" },
  { t:"4m",    icon:"send",            tone:"teal",  who:"L. Mahoney",what:"sent SMS confirmation request" },
  { t:"1h",    icon:"message-circle",  tone:"ink",   who:"Aria",     what:"replied — 'on my way at 6:45'" },
  { t:"yesterday", icon:"file-text", tone:"ink", who:"Aria", what:"uploaded updated Hep B record" },
  { t:"2d",    icon:"bell",            tone:"amber", who:"System",   what:"notified about Mercy ICU shift opening" },
  { t:"3d",    icon:"calendar",        tone:"ink",   who:"Aria",     what:"updated availability — added next weekend" },
];

const ASSIGNMENTS = [
  { facility:"Mercy Mt. Sinai · ICU", date:"Tonight 19:00–07:00", coord:"L. Mahoney", coordI:"LM", coordT:"teal", state:"Confirmed", tone:"green" },
  { facility:"Mercy Mt. Sinai · ICU", date:"Wed Mar 12 · 19:00–07:00", coord:"L. Mahoney", coordI:"LM", coordT:"teal", state:"Pending", tone:"amber" },
  { facility:"Bayview Care · Med-Surg", date:"Sat Mar 14 · 07:00–19:00", coord:"R. Tan", coordI:"RT", coordT:"violet", state:"Pending", tone:"amber" },
];

function CredState({ s }: any) {
  const m: any = {
    "Verified":      { cls:"bg-emerald-50 text-emerald-700" },
    "Expiring Soon": { cls:"bg-amber-50 text-amber-700" },
    "Missing":       { cls:"bg-rose-50 text-rose-700" },
    "Pending Review":{ cls:"bg-ink-100 text-ink-700" },
  };
  return <span className={`text-[10px] font-mono px-1.5 h-5 inline-flex items-center rounded ${m[s].cls}`}>{s}</span>;
}

function ShiftStateBadge({ s }: any) {
  const m: any = {
    "Completed":   { cls:"bg-emerald-50 text-emerald-700", dot:"green" },
    "Cancelled":   { cls:"bg-ink-100 text-ink-500",        dot:"ink" },
    "No-show":     { cls:"bg-rose-50 text-rose-700",        dot:"rose" },
    "Late Arrival":{ cls:"bg-amber-50 text-amber-700",      dot:"amber" },
  };
  const x = m[s] ?? m["Completed"];
  return <span className={`inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-mono uppercase ${x.cls}`}><Dot tone={x.dot} />{s}</span>;
}

function ProfileView({ p, onBack }: any) {
  const [tab, setTab] = useState<"overview"|"history"|"comms">("overview");

  return (
    <main className="px-6 py-6 space-y-4 rise-in">
      <button onClick={onBack} className="text-[11px] font-mono text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5"><Icon name="arrow-left" className="w-3 h-3" /> Back to workforce</button>

      {/* Header */}
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar initials={p.id.slice(0,2)} tone={p.t} size={64} />
            {p.avail === "Available" && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />}
            {p.avail === "On Shift" && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-600 ring-2 ring-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{p.id} · 3 yrs experience</span>
              <span className="text-[10px] font-mono text-ink-300">·</span>
              <AvailBadge a={p.avail} />
              <CompBadge c={p.comp} />
            </div>
            <h1 className="mt-1.5 text-[26px] leading-tight tracking-[-0.01em] font-medium">{p.name}<span className="font-serif italic text-teal-800"> · {p.role} · {p.spec}</span></h1>
            <div className="mt-1 text-[13px] font-mono text-ink-600">{p.loc} · within catchment of 4 facilities</div>

            <div className="mt-5 grid grid-cols-4 gap-4 max-w-[640px]">
              <ReadinessStat label="Reliability" value={p.relScore} sub={p.rel} tone={p.rel === "Excellent" ? "green" : p.rel === "Good" ? "teal" : "rose"} />
              <ReadinessStat label="Shift readiness" value={p.ready} sub="Composite score" tone={p.ready >= 90 ? "green" : p.ready >= 75 ? "teal" : "amber"} />
              <ReadinessStat label="Acceptance rate" value={88} sub="Last 30 days" tone="teal" />
              <ReadinessStat label="Total hours" value={"284h"} sub="Last 30 days" tone="ink" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 max-w-[260px]">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-teal-700 text-white text-[12px] font-medium hover:bg-teal-800"><Icon name="zap" className="w-3.5 h-3.5" /> Assign to shift</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="message-circle" className="w-3.5 h-3.5" /> Message</button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="calendar" className="w-3.5 h-3.5" /> Update availability</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="upload" className="w-3.5 h-3.5" /> Upload credential</button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="history" className="w-3.5 h-3.5" /> Shift history</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-rose-50 text-rose-700"><Icon name="ban" className="w-3.5 h-3.5" /> Suspend</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-md bg-ink-100">
        {[{id:"overview",l:"Overview"},{id:"history",l:"Shift history"},{id:"comms",l:"Communication"}].map((t:any) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 h-8 rounded text-[12px] tracking-tight ${tab === t.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-700 hover:text-ink-900"}`}>{t.l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 space-y-4">
            {/* Availability calendar */}
            <Section title="Availability calendar" sub="This week · shifts, on-call, time-off" action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900 inline-flex items-center gap-1"><Icon name="edit-3" className="w-3 h-3" /> Edit availability</button>}>
              <div className="px-5 py-4">
                <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-px bg-ink-100 rounded-lg overflow-hidden">
                  <div className="bg-paper" />
                  {WEEK_DAYS.map(d => <div key={d} className="bg-paper px-2 py-2 text-[10px] font-mono text-ink-500 text-center">{d}</div>)}
                  {HOURS.map((h, hi) => (
                    <React.Fragment key={h}>
                      <div className="bg-paper text-[10px] font-mono text-ink-500 px-2 py-2 text-right">{h}</div>
                      {WEEK_DAYS.map((_, di) => {
                        const block = SHIFTS_GRID.find(b => b.day === di && hi >= Math.floor(((b.startH + 24) - 7) / 4) % 6 && hi < Math.floor(((b.startH + b.len + 24) - 7) / 4) % 6 + (b.len >= 24 ? 6 : 0));
                        return <div key={di} className="bg-white relative h-12" />;
                      })}
                    </React.Fragment>
                  ))}
                </div>
                {/* Overlay shift bars */}
                <div className="grid grid-cols-7 gap-1.5 mt-3">
                  {WEEK_DAYS.map((d, di) => {
                    const blocks = SHIFTS_GRID.filter(b => b.day === di);
                    return (
                      <div key={d} className="space-y-1">
                        {blocks.map((b, i) => {
                          const cls = b.kind === "shift" ? "bg-teal-700 text-white" : b.kind === "avail" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : b.kind === "off" ? "bg-ink-100 text-ink-500" : "bg-amber-50 text-amber-800 border border-amber-200";
                          return <div key={i} className={`text-[10px] px-1.5 py-1 rounded font-mono ${cls}`}>{b.kind === "shift" ? `${b.startH}:00 · ${b.facility}` : b.kind === "off" ? "Time off" : b.kind === "oncall" ? "On-call" : "Available"}</div>;
                        })}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-ink-500">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-700" /> Shift</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200" /> Available</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" /> On-call</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-ink-100" /> Time-off</span>
                </div>
              </div>
            </Section>

            {/* Current assignments */}
            <Section title="Current assignments" sub={`${ASSIGNMENTS.length} active or upcoming`}>
              <div className="divide-y divide-ink-100">
                {ASSIGNMENTS.map((a, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-600"><Icon name="building-2" className="w-4 h-4" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium tracking-tight">{a.facility}</div>
                      <div className="text-[11px] font-mono text-ink-500">{a.date}</div>
                    </div>
                    <div className="flex items-center gap-2"><Avatar initials={a.coordI} tone={a.coordT} size={20} /><span className="text-[11px] font-mono text-ink-600">{a.coord}</span></div>
                    <span className={`text-[10px] font-mono px-1.5 h-5 inline-flex items-center rounded ${a.tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.state}</span>
                    <button className="w-7 h-7 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="chevron-right" className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Operational metrics */}
            <Section title="Operational metrics" sub="Last 30 days · workforce-grade KPIs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink-100">
                <Metric icon="check-circle-2" label="Shift acceptance" v="88%" sub="22 of 25 offered" tone="teal" />
                <Metric icon="x-circle" label="Cancellation rate" v="4.0%" sub="1 in 30 days" tone="amber" />
                <Metric icon="timer" label="Avg response time" v="2m 14s" sub="From offer → reply" tone="teal" />
                <Metric icon="user-check" label="Attendance reliability" v="96%" sub="No-show free" tone="green" />
                <Metric icon="trending-up" label="Fill participation" v="14" sub="Shifts joined" tone="ink" />
                <Metric icon="hourglass" label="Total hours" v="284 h" sub="Across 14 shifts" tone="ink" />
              </div>
            </Section>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            {/* Credentials */}
            <Section title="Credentials & compliance" sub="Per-credential gates · enforced before assignment" action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900 inline-flex items-center gap-1"><Icon name="upload" className="w-3 h-3" /> Upload</button>}>
              <div className="divide-y divide-ink-100">
                {CREDS.map((c, i) => {
                  const tone = c.state === "Verified" ? "emerald" : c.state === "Expiring Soon" ? "amber" : c.state === "Missing" ? "rose" : "ink";
                  return (
                    <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center bg-${tone}-50 text-${tone}-700`}><Icon name={c.icon} className="w-3.5 h-3.5" /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium tracking-tight">{c.item}</div>
                        <div className="text-[10px] font-mono text-ink-500">exp {c.exp}</div>
                      </div>
                      <CredState s={c.state} />
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-2.5 border-t border-ink-100 bg-amber-50/40 text-[11px] font-mono text-amber-800 flex items-center gap-2"><Icon name="alert-triangle" className="w-3.5 h-3.5" /> Hep B expires Apr 14 · auto-reminder fired</div>
            </Section>

            {/* Notes & tags */}
            <Section title="Notes & tags" sub="Coordinator-facing">
              <div className="px-5 py-4 space-y-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Cerner cleared","Mercy ICU favorite","Vent experience","Night-shift cleared","Fluent ES"].map(t => <span key={t} className="text-[10px] font-mono px-1.5 h-5 inline-flex items-center rounded bg-paper border border-ink-200 text-ink-700">{t}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-1.5">Coordinator note</div>
                  <div className="rounded-md border border-ink-200 bg-paper/40 px-3 py-2 text-[12px] text-ink-700 leading-relaxed italic">Strong ICU performer. Prefers night shifts at Mercy. Avoid same-day cancels &lt; 2h before shift; usually responds within 4 minutes.</div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {tab === "history" && (
        <Section title="Shift history" sub={`${SHIFT_HISTORY.length} recent shifts · attendance + facility ratings`}>
          <div className="overflow-x-auto scrollarea">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100 bg-paper/40">
                  <th className="px-5 py-2.5">Facility</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Hours</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Performance</th>
                  <th className="px-3 py-2.5">Facility rating</th>
                </tr>
              </thead>
              <tbody>
                {SHIFT_HISTORY.map((h, i) => (
                  <tr key={i} className="border-b last:border-0 border-ink-100">
                    <td className="px-5 py-3"><div className="text-[13px] font-medium tracking-tight">{h.facility.split(" · ")[0]}</div><div className="text-[10px] font-mono text-ink-500">{h.facility.split(" · ")[1]}</div></td>
                    <td className="px-3 py-3 text-ink-700">{h.date}</td>
                    <td className="px-3 py-3 font-mono text-[12px] tabular-nums">{h.hrs ? `${h.hrs}h` : "—"}</td>
                    <td className="px-3 py-3"><ShiftStateBadge s={h.state} /></td>
                    <td className="px-3 py-3 text-[12px] text-ink-700">{h.perf}</td>
                    <td className="px-3 py-3">
                      <div className="inline-flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => <Icon key={n} name="star" className={`w-3 h-3 ${n <= h.rating ? "text-amber-500 fill-amber-500" : "text-ink-200"}`} />)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab === "comms" && (
        <Section title="Communication timeline" sub="SMS · notifications · confirmations · internal notes" action={
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50"><Icon name="megaphone" className="w-3 h-3" /> Broadcast</button>
            <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-ink-900 text-paper text-[11px] hover:bg-ink-800"><Icon name="send" className="w-3 h-3" /> Send message</button>
          </div>
        }>
          <div className="px-5 py-4">
            <ol className="relative pl-4 border-l border-ink-200">
              {COMM_TIMELINE.map((a, i) => (
                <li key={i} className="relative pl-4 pb-3 last:pb-0">
                  <span className={`absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${a.tone === "green" ? "bg-emerald-500" : a.tone === "teal" ? "bg-teal-500" : a.tone === "amber" ? "bg-amber-500" : "bg-ink-400"}`} />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-ink-500 w-16">{a.t}</span>
                    <Icon name={a.icon} className={`w-3.5 h-3.5 ${a.tone === "green" ? "text-emerald-600" : a.tone === "teal" ? "text-teal-600" : a.tone === "amber" ? "text-amber-600" : "text-ink-500"}`} />
                    <div className="flex-1 text-[12px] leading-snug"><span className="font-medium tracking-tight">{a.who}</span> <span className="text-ink-600">{a.what}</span></div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-ink-100 px-5 py-3 bg-paper/40">
            <textarea rows={2} placeholder="Send a direct SMS or note…" className="w-full bg-transparent text-[12px] outline-none resize-none" />
            <div className="flex items-center gap-2">
              <select className="h-7 px-2 rounded border border-ink-200 bg-white text-[11px] font-mono outline-none"><option>SMS to Aria</option><option>Push notification</option><option>Internal note</option></select>
              <button className="ml-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-teal-700 text-white text-[11px] font-medium hover:bg-teal-800"><Icon name="send" className="w-3 h-3" /> Send</button>
            </div>
          </div>
        </Section>
      )}
    </main>
  );
}

function Section({ title, sub, action, children }: any) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white">
      <div className="px-5 py-3 border-b border-ink-100 flex items-center gap-3">
        <div><div className="text-[13px] font-medium tracking-tight">{title}</div>{sub && <div className="text-[11px] font-mono text-ink-500 mt-0.5">{sub}</div>}</div>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </section>
  );
}
function ReadinessStat({ label, value, sub, tone }: any) {
  const txt = tone === "green" ? "text-emerald-700" : tone === "teal" ? "text-teal-700" : tone === "rose" ? "text-rose-700" : tone === "amber" ? "text-amber-700" : "text-ink-900";
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-1 text-[24px] leading-none font-medium tabular-nums ${txt}`}>{value}</div>
      <div className="text-[10px] font-mono text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}
function Metric({ icon, label, v, sub, tone }: any) {
  const txt = tone === "green" ? "text-emerald-700" : tone === "teal" ? "text-teal-700" : tone === "amber" ? "text-amber-700" : tone === "rose" ? "text-rose-700" : "text-ink-900";
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2"><Icon name={icon} className={`w-3.5 h-3.5 ${txt}`} /><div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{label}</div></div>
      <div className={`mt-1.5 text-[22px] font-medium tabular-nums ${txt}`}>{v}</div>
      <div className="text-[10px] font-mono text-ink-500">{sub}</div>
    </div>
  );
}

// ───────────── Root ─────────────
function App() {
  const [open, setOpen] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const trail = open
    ? <><a href="#" onClick={(e:any) => { e.preventDefault(); setOpen(null); }} className="text-ink-500 hover:text-ink-900">Workforce</a><Icon name="chevron-right" className="w-3 h-3 text-ink-300" /><span className="text-ink-900 font-medium">{open.name}</span></>
    : <span className="text-ink-900 font-medium">Workforce</span>;
  return (
    <div className="min-h-screen bg-paper text-ink-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar trail={trail} onAdd={() => setAdding(true)} />
        {open ? <ProfileView p={open} onBack={() => setOpen(null)} /> : <ListView onOpen={setOpen} onAdd={() => setAdding(true)} />}
      </div>
      <AddProfessionalSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
})();
