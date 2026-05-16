// Staffing Requests — list + detail (mission control)
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const { useState, useMemo } = React;
const { Icon, Badge, Dot, Avatar, AvatarStack, Eyebrow, CreateRequestSheet } = window;

// ───────────── Mock data ─────────────
type Status = "Open"|"Matching"|"Partially Filled"|"Confirmed"|"Completed"|"Cancelled"|"At Risk";
type Urgency = "Normal"|"High"|"Critical";
type Compliance = "Ready"|"Pending"|"Issue Detected";

const REQUESTS: any[] = [
  { id:"REQ-2841", facility:"Mercy Mt. Sinai", facShort:"Mercy", role:"RN", spec:"ICU", date:"Wed, Mar 11", time:"19:00–07:00", need:3, filled:2, coord:{i:"LM",t:"teal",name:"Lena Mahoney"}, status:"Partially Filled", urgency:"Critical", comp:"Ready", lastAct:"4m", assigned:["AM","SN"] },
  { id:"REQ-2842", facility:"Bayview Care", facShort:"Bayview", role:"RN", spec:"Med-Surg", date:"Wed, Mar 11", time:"07:00–19:00", need:4, filled:4, coord:{i:"RT",t:"violet",name:"Ravi Tan"}, status:"Confirmed", urgency:"Normal", comp:"Ready", lastAct:"18m", assigned:["JR","KP","DC","TM"] },
  { id:"REQ-2843", facility:"Pinegrove SNF", facShort:"Pinegrove", role:"CNA", spec:"Floor 2", date:"Wed, Mar 11", time:"19:00–07:00", need:2, filled:1, coord:{i:"EV",t:"amber",name:"Elena Vargas"}, status:"Matching", urgency:"High", comp:"Pending", lastAct:"1m", assigned:["AT"] },
  { id:"REQ-2844", facility:"Northridge Health", facShort:"Northridge", role:"RN", spec:"ER", date:"Thu, Mar 12", time:"07:00–15:00", need:2, filled:0, coord:{i:"LM",t:"teal",name:"Lena Mahoney"}, status:"Open", urgency:"Normal", comp:"Ready", lastAct:"32m", assigned:[] },
  { id:"REQ-2845", facility:"Coastline Hospice", facShort:"Coastline", role:"LPN", spec:"Visit", date:"Tue, Mar 10", time:"22:00–06:00", need:1, filled:0, coord:{i:"RT",t:"violet",name:"Ravi Tan"}, status:"At Risk", urgency:"Critical", comp:"Issue Detected", lastAct:"1h", assigned:[] },
  { id:"REQ-2846", facility:"Summit Pediatrics", facShort:"Summit", role:"RN", spec:"Pedi", date:"Fri, Mar 13", time:"07:00–19:00", need:1, filled:1, coord:{i:"EV",t:"amber",name:"Elena Vargas"}, status:"Confirmed", urgency:"Normal", comp:"Ready", lastAct:"2h", assigned:["MS"] },
  { id:"REQ-2847", facility:"Lakeshore Rehab", facShort:"Lakeshore", role:"RN", spec:"Rehab", date:"Sat, Mar 14", time:"19:00–07:00", need:3, filled:1, coord:{i:"LM",t:"teal",name:"Lena Mahoney"}, status:"Matching", urgency:"High", comp:"Ready", lastAct:"6m", assigned:["GH"] },
  { id:"REQ-2848", facility:"Ridgecrest Medical", facShort:"Ridgecrest", role:"RN", spec:"ICU", date:"Sat, Mar 14", time:"07:00–19:00", need:2, filled:0, coord:{i:"RT",t:"violet",name:"Ravi Tan"}, status:"Open", urgency:"Normal", comp:"Ready", lastAct:"45m", assigned:[] },
  { id:"REQ-2839", facility:"Mercy Mt. Sinai", facShort:"Mercy", role:"RN", spec:"ICU", date:"Mon, Mar 9", time:"19:00–07:00", need:2, filled:2, coord:{i:"LM",t:"teal",name:"Lena Mahoney"}, status:"Completed", urgency:"Normal", comp:"Ready", lastAct:"yesterday", assigned:["JR","DC"] },
  { id:"REQ-2837", facility:"Bayview Care", facShort:"Bayview", role:"RN", spec:"ER", date:"Sun, Mar 8", time:"07:00–19:00", need:1, filled:0, coord:{i:"EV",t:"amber",name:"Elena Vargas"}, status:"Cancelled", urgency:"Normal", comp:"Ready", lastAct:"2 days", assigned:[] },
];

// ───────────── Shared chrome ─────────────
function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"layout-grid", href:"ops.html" },
  { id:"requests", label:"Staffing Requests", icon:"clipboard-list", count:18, active:true },
  { id:"workforce", label:"Workforce", icon:"users" },
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
      <div className="px-4 h-14 flex items-center gap-2 border-b border-ink-200/70">
        <LogoMark />
        <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
      </div>
      <button className="mx-3 mt-3 px-2.5 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 flex items-center gap-2.5 text-left">
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px]">AS</span>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium tracking-tight truncate">Apex Staffing</div>
          <div className="text-[10px] font-mono text-ink-500 truncate">SF Bay · Owner</div>
        </div>
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
        <div className="rounded-lg border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2"><Dot tone="green" pulse /><div className="text-[11px] font-mono text-ink-700">All systems operational</div></div>
        </div>
        <button className="mt-3 w-full flex items-center gap-2 px-2 h-9 rounded-md hover:bg-ink-100 text-[13px] text-ink-800">
          <Avatar initials="LM" tone="teal" size={20} />
          <div className="flex-1 text-left text-[12px] tracking-tight">Lena Mahoney</div>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ trail, onNew }: { trail: any; onNew: ()=>void }) {
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
          <input placeholder="Search requests, REQ-IDs, facilities…" className="w-full h-9 pl-9 pr-16 rounded-lg border border-ink-200 bg-white text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-400 px-1.5 h-5 inline-flex items-center rounded border border-ink-200 bg-paper">⌘K</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700"><Icon name="bell" className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-paper" /></button>
          <div className="w-px h-5 bg-ink-200 mx-1" />
          <button onClick={onNew} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"><Icon name="plus" className="w-3.5 h-3.5" /> Create staffing request</button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Badges ─────────────
function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status,{cls:string;dot:any;pulse?:boolean}> = {
    "Open":             { cls:"bg-ink-100 text-ink-700",         dot:"ink" },
    "Matching":         { cls:"bg-teal-50 text-teal-700",        dot:"teal", pulse:true },
    "Partially Filled": { cls:"bg-amber-50 text-amber-700",      dot:"amber" },
    "Confirmed":        { cls:"bg-emerald-50 text-emerald-700",  dot:"green" },
    "Completed":        { cls:"bg-ink-100 text-ink-600",          dot:"ink" },
    "Cancelled":        { cls:"bg-ink-100 text-ink-500 line-through", dot:"ink" },
    "At Risk":          { cls:"bg-rose-50 text-rose-700",         dot:"rose", pulse:true },
  };
  const s = map[status];
  return <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${s.cls}`}><Dot tone={s.dot} pulse={s.pulse} />{status}</span>;
}
function UrgencyBadge({ u }: { u: Urgency }) {
  const m: Record<Urgency,string> = { Critical:"bg-rose-700 text-white", High:"bg-amber-100 text-amber-800", Normal:"bg-ink-100 text-ink-700" };
  return <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${m[u]}`}>{u}</span>;
}
function CompBadge({ c }: { c: Compliance }) {
  const m: Record<Compliance,{cls:string;icon:string}> = {
    "Ready": { cls:"text-emerald-700", icon:"shield-check" },
    "Pending": { cls:"text-amber-700", icon:"shield" },
    "Issue Detected": { cls:"text-rose-700", icon:"shield-alert" },
  };
  const s = m[c];
  return <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${s.cls}`}><Icon name={s.icon} className="w-3 h-3" />{c}</span>;
}
function FillBar({ filled, need, status }: any) {
  const pct = (filled / need) * 100;
  const tone = status === "Confirmed" || status === "Completed" ? "bg-emerald-500" : status === "At Risk" ? "bg-rose-500" : status === "Matching" ? "bg-teal-500" : status === "Partially Filled" ? "bg-amber-500" : status === "Cancelled" ? "bg-ink-300" : "bg-ink-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} /></div>
      <span className="text-[10px] font-mono tabular-nums text-ink-700 w-10 text-right">{filled}/{need}</span>
    </div>
  );
}

// ───────────── LIST VIEW ─────────────
const STATUS_TABS: ("All"|Status)[] = ["All","Open","Matching","Partially Filled","Confirmed","At Risk","Completed","Cancelled"];

function ListView({ onOpen, onNew }: { onOpen: (r:any)=>void; onNew: ()=>void }) {
  const [tab, setTab] = useState<"All"|Status>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState("Most urgent");

  const filtered = useMemo(() => {
    let rs = REQUESTS;
    if (tab !== "All") rs = rs.filter(r => r.status === tab);
    if (sort === "Most urgent") rs = [...rs].sort((a,b) => ({Critical:0,High:1,Normal:2}[a.urgency as Urgency] - {Critical:0,High:1,Normal:2}[b.urgency as Urgency]));
    return rs;
  }, [tab, sort]);

  const counts: Record<string,number> = useMemo(() => {
    const c: any = { All: REQUESTS.length };
    REQUESTS.forEach(r => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, []);

  function toggle(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  }

  const kpi = [
    { label:"Open requests", v:8, sub:"across 6 facilities", trend:"+2 today", tone:"ink" },
    { label:"At-risk", v:1, sub:"need coordinator now", trend:"REQ-2845", tone:"rose" },
    { label:"Filled today", v:14, sub:"vs target of 12", trend:"+17%", tone:"green" },
    { label:"Urgent", v:3, sub:"Critical or T-12h", trend:"−1 vs avg", tone:"amber" },
    { label:"Avg time-to-fill", v:"11m", sub:"7-day rolling", trend:"−42% vs phone", tone:"teal" },
  ];

  return (
    <main className="px-6 py-6 space-y-4 rise-in">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Staffing operations</Eyebrow>
          <h1 className="mt-1 text-[28px] leading-tight tracking-[-0.01em] font-medium">
            Staffing requests<span className="font-serif italic text-teal-800"> · live queue.</span>
          </h1>
          <div className="mt-1 text-[11px] font-mono text-ink-500">{REQUESTS.length} requests in scope · {counts["At Risk"] ?? 0} need attention</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="download" className="w-3.5 h-3.5" /> Export</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="sliders" className="w-3.5 h-3.5" /> Filter</button>
          <button onClick={onNew} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"><Icon name="plus" className="w-3.5 h-3.5" /> New request</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-12 gap-3">
        {kpi.map((x, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-xl border border-ink-200 bg-white p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{x.label}</div>
            <div className="mt-2 text-[28px] font-medium tracking-tight tabular-nums">{x.v}</div>
            <div className="text-[11px] font-mono text-ink-500">{x.sub}</div>
            <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono ${x.tone === "green" ? "text-emerald-700" : x.tone === "rose" ? "text-rose-700" : x.tone === "amber" ? "text-amber-700" : x.tone === "teal" ? "text-teal-700" : "text-ink-600"}`}>
              <Dot tone={x.tone === "ink" ? "ink" : x.tone as any} pulse={x.tone === "teal"} />{x.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips + sort */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11px] font-mono ${tab === t ? "bg-ink-900 text-paper border-ink-900" : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"}`}>
            {t}
            <span className={`text-[9px] px-1 h-3.5 inline-flex items-center rounded ${tab === t ? "bg-paper/20" : "bg-ink-100"}`}>{counts[t] ?? 0}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[11px] font-mono text-ink-500">Sort</div>
          <div className="relative">
            <select value={sort} onChange={(e:any)=>setSort(e.target.value)} className="h-8 pl-2.5 pr-8 rounded-md border border-ink-200 bg-white text-[12px] outline-none appearance-none">
              <option>Most urgent</option><option>Newest</option><option>Shift soonest</option><option>Largest gap</option>
            </select>
            <Icon name="chevron-down" className="w-3.5 h-3.5 text-ink-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bulk actions strip */}
      {selected.size > 0 && (
        <div className="rounded-lg bg-ink-900 text-paper px-4 h-10 flex items-center gap-3 text-[12px]">
          <span className="font-mono text-paper/80">{selected.size} selected</span>
          <span className="text-paper/30">·</span>
          {["Reassign","Broadcast","Match","Mark filled","Cancel"].map(a => (
            <button key={a} className="text-paper/90 hover:text-paper inline-flex items-center gap-1.5"><Icon name="dot" className="w-3 h-3" />{a}</button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-paper/60 hover:text-paper"><Icon name="x" className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Table */}
      <section className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="overflow-x-auto scrollarea">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100 bg-paper/40">
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-teal-700" /></th>
                <th className="px-3 py-2.5">Request · Facility</th>
                <th className="px-3 py-2.5">Role · Spec</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Time</th>
                <th className="px-3 py-2.5">Need</th>
                <th className="px-3 py-2.5">Assigned</th>
                <th className="px-3 py-2.5 w-[170px]">Fulfillment</th>
                <th className="px-3 py-2.5">Coordinator</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Urgency</th>
                <th className="px-3 py-2.5">Compliance</th>
                <th className="px-3 py-2.5">Last activity</th>
                <th className="px-3 py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => onOpen(r)} className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40 cursor-pointer">
                  <td className="px-3 py-3" onClick={(e:any) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-teal-700" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-600"><Icon name="building-2" className="w-4 h-4" /></span>
                      <div>
                        <div className="font-medium tracking-tight">{r.facility}</div>
                        <div className="text-[10px] font-mono text-ink-500">{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className="text-[12px]">{r.role}</span> <span className="text-[10px] font-mono text-ink-500">{r.spec}</span></td>
                  <td className="px-3 py-3 text-ink-700">{r.date}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ink-700">{r.time}</td>
                  <td className="px-3 py-3 tabular-nums text-[12px]">{r.need}</td>
                  <td className="px-3 py-3">{r.assigned.length ? <AvatarStack people={r.assigned.map((i:string,idx:number)=>({initials:i,tone:(["teal","violet","amber","rose","ink"] as const)[idx%5]}))} max={4} /> : <span className="text-[11px] font-mono text-ink-400">—</span>}</td>
                  <td className="px-3 py-3"><FillBar filled={r.filled} need={r.need} status={r.status} /></td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><Avatar initials={r.coord.i} tone={r.coord.t} size={22} /><span className="text-[11px] font-mono text-ink-700">{r.coord.name.split(" ")[0]}</span></div></td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3"><UrgencyBadge u={r.urgency} /></td>
                  <td className="px-3 py-3"><CompBadge c={r.comp} /></td>
                  <td className="px-3 py-3 text-[11px] font-mono text-ink-500">{r.lastAct} ago</td>
                  <td className="px-3 py-3 text-right" onClick={(e:any) => e.stopPropagation()}>
                    <button className="w-7 h-7 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="more-horizontal" className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <span className="inline-flex w-12 h-12 rounded-full bg-paper border border-ink-200 items-center justify-center text-ink-400"><Icon name="inbox" className="w-5 h-5" /></span>
              <div className="mt-3 text-[14px] font-medium tracking-tight">No requests in this view</div>
              <div className="text-[12px] text-ink-500">Adjust filters or create a new staffing request.</div>
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between text-[11px] font-mono text-ink-500">
          <div>Showing 1–{filtered.length} of {REQUESTS.length}</div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center"><Icon name="chevron-left" className="w-3.5 h-3.5" /></button>
            <span className="px-2 h-7 rounded bg-ink-900 text-paper inline-flex items-center">1</span>
            <span className="px-2 h-7 rounded hover:bg-ink-100 inline-flex items-center cursor-pointer">2</span>
            <span className="px-2 h-7 rounded hover:bg-ink-100 inline-flex items-center cursor-pointer">3</span>
            <button className="w-7 h-7 rounded border border-ink-200 hover:bg-ink-50 inline-flex items-center justify-center"><Icon name="chevron-right" className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </section>
    </main>
  );
}

// ───────────── DETAIL VIEW ─────────────
const ASSIGNED = [
  { name:"Aria Martinez", i:"AM", t:"teal", spec:"RN · ICU", avail:"Tonight 19–07", comp:"Verified", state:"Confirmed" },
  { name:"Sayuri Nguyen", i:"SN", t:"violet", spec:"RN · ICU", avail:"Tonight 19–07", comp:"Verified", state:"Accepted" },
];
const SUGGESTED = [
  { name:"Devon Carter", i:"DC", t:"amber", spec:"RN · Med-Surg", dist:"7.0 mi", avail:"Available", creds:"Verified", rel:96 },
  { name:"Jamal Reyes",  i:"JR", t:"rose",  spec:"RN · ER",      dist:"9.1 mi", avail:"Available", creds:"Verified", rel:92 },
  { name:"Mei Sato",     i:"MS", t:"teal",  spec:"RN · Pedi",    dist:"12.4 mi",avail:"Available", creds:"Expiring", rel:88 },
  { name:"Grace Hall",   i:"GH", t:"violet",spec:"RN · Rehab",   dist:"6.3 mi", avail:"Available", creds:"Verified", rel:94 },
];
const PROGRESS_STAGES = ["Requested","Matching","Outreach","Assigned","Confirmed","Shift Active","Completed"];
const COMP_VERIFY = [
  { item:"RN License (CA)",     state:"Verified",      icon:"id-card" },
  { item:"BLS · CPR",           state:"Verified",      icon:"heart-pulse" },
  { item:"Background Check",    state:"Verified",      icon:"user-check" },
  { item:"Vaccinations · Flu",  state:"Verified",      icon:"syringe" },
  { item:"Vaccinations · Hep B",state:"Expiring Soon", icon:"syringe" },
  { item:"Mercy ICU competency",state:"Missing",       icon:"award" },
];
const ACTIVITY = [
  { t:"now", who:"System", what:"REQ-2841 risk recalculated · 2 of 3 filled", tone:"teal", icon:"activity" },
  { t:"4m",  who:"S. Nguyen", what:"accepted shift offer", tone:"green", icon:"check-circle-2" },
  { t:"11m", who:"L. Mahoney", what:"sent offers to 4 candidates", tone:"teal", icon:"send" },
  { t:"14m", who:"A. Martinez", what:"accepted shift offer", tone:"green", icon:"check-circle-2" },
  { t:"19m", who:"L. Mahoney", what:"auto-matched 7 RNs · compliance gated", tone:"teal", icon:"wand-2" },
  { t:"32m", who:"L. Mahoney", what:"assigned as coordinator", tone:"ink", icon:"user-plus" },
  { t:"34m", who:"Mercy Mt. Sinai", what:"submitted REQ-2841 · 3 RN ICU · tonight", tone:"ink", icon:"send" },
];
const RISKS_DETAIL = [
  { k:"Time-to-shift", l:"Shift starts in 3h 14m", s:"Filled 2 of 3 · still need 1 RN ICU", tone:"rose",  icon:"timer" },
  { k:"Cancellation", l:"Elevated cancellation risk (S. Nguyen)", s:"History · 1 cancel in last 30d", tone:"amber", icon:"rotate-ccw" },
  { k:"Confirmation", l:"No 1h pre-shift confirmation from S. Nguyen", s:"Auto-reminder fires at T-90m", tone:"amber", icon:"bell" },
];

function DetailView({ req, onBack }: { req: any; onBack: ()=>void }) {
  const [tab, setTab] = useState<"overview"|"matches"|"activity">("overview");
  const stageIdx = req.status === "Completed" ? 6 : req.status === "Confirmed" ? 4 : req.status === "Matching" ? 1 : req.status === "Open" ? 0 : req.status === "Partially Filled" ? 3 : req.status === "At Risk" ? 2 : 0;

  return (
    <main className="px-6 py-6 space-y-4 rise-in">
      {/* Header */}
      <div>
        <button onClick={onBack} className="text-[11px] font-mono text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5 mb-3"><Icon name="arrow-left" className="w-3 h-3" /> Back to all requests</button>
        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <div className="flex items-start gap-5">
            <span className="w-12 h-12 rounded-lg bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-700"><Icon name="building-2" className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{req.id}</span>
                <span className="text-[10px] font-mono text-ink-300">·</span>
                <StatusBadge status={req.status} />
                <UrgencyBadge u={req.urgency} />
                <CompBadge c={req.comp} />
              </div>
              <h1 className="mt-1.5 text-[26px] leading-tight tracking-[-0.01em] font-medium">
                {req.need} {req.role} · {req.spec} <span className="font-serif italic text-teal-800">at {req.facility}</span>
              </h1>
              <div className="mt-1 text-[13px] font-mono text-ink-600">{req.date} · {req.time} · need {req.need} · filled {req.filled}</div>
              <div className="mt-4 flex items-center gap-4 flex-wrap text-[12px]">
                <div className="flex items-center gap-2">
                  <Avatar initials={req.coord.i} tone={req.coord.t} size={22} />
                  <span className="text-ink-600">Coord</span>
                  <span className="font-medium tracking-tight">{req.coord.name}</span>
                </div>
                <div className="text-ink-300">·</div>
                <div className="text-ink-600">Last activity <span className="text-ink-900">{req.lastAct} ago</span></div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end max-w-[420px]">
              <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-teal-700 text-white text-[12px] font-medium hover:bg-teal-800"><Icon name="wand-2" className="w-3.5 h-3.5" /> Match professionals</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-800"><Icon name="megaphone" className="w-3.5 h-3.5" /> Broadcast</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50"><Icon name="check" className="w-3.5 h-3.5" /> Mark filled</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-ink-50 text-amber-800"><Icon name="alert-triangle" className="w-3.5 h-3.5" /> Escalate</button>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink-200 bg-white text-[12px] hover:bg-rose-50 text-rose-700"><Icon name="x" className="w-3.5 h-3.5" /> Cancel</button>
            </div>
          </div>

          {/* Fulfillment progress */}
          <div className="mt-6 pt-5 border-t border-ink-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Fulfillment progress</div>
              <div className="text-[11px] font-mono text-ink-500">stage {stageIdx + 1} of {PROGRESS_STAGES.length}</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {PROGRESS_STAGES.map((s, i) => {
                const done = i < stageIdx, active = i === stageIdx;
                return (
                  <div key={s} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-mono border ${done ? "bg-teal-700 border-teal-700 text-white" : active ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 text-ink-400"}`}>
                        {done ? <Icon name="check" className="w-2.5 h-2.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className={`flex-1 h-px ${done ? "bg-teal-700" : "bg-ink-200"}`} />
                    </div>
                    <div className={`text-[11px] tracking-tight ${active ? "text-ink-900 font-medium" : "text-ink-500"}`}>{s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-md bg-ink-100">
        {[{id:"overview",l:"Overview"},{id:"matches",l:"Suggested matches"},{id:"activity",l:"Activity"}].map((t:any) => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 h-8 rounded text-[12px] tracking-tight ${tab === t.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-700 hover:text-ink-900"}`}>{t.l}</button>
        ))}
      </div>

      {/* Risks banner — always visible if any */}
      {RISKS_DETAIL.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="alert-triangle" className="w-4 h-4 text-rose-700" />
            <div className="text-[12px] font-medium tracking-tight text-rose-900">Risks & alerts</div>
            <Badge tone="rose">{RISKS_DETAIL.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {RISKS_DETAIL.map((r, i) => (
              <div key={i} className="rounded-lg bg-white border border-rose-100 p-3 flex items-start gap-2.5">
                <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center ${r.tone === "rose" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}><Icon name={r.icon} className="w-3.5 h-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{r.k}</div>
                  <div className="text-[12px] font-medium tracking-tight">{r.l}</div>
                  <div className="text-[11px] font-mono text-ink-500 truncate">{r.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-col grid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {/* Assigned professionals */}
          <Section title="Assigned healthcare professionals" sub={`${ASSIGNED.length} of ${req.need} assigned · ${req.need - ASSIGNED.length} remaining`} action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900">+ Assign more</button>}>
            <div className="divide-y divide-ink-100">
              {ASSIGNED.map((a, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <Avatar initials={a.i} tone={a.t as any} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium tracking-tight">{a.name}</div>
                    <div className="text-[11px] font-mono text-ink-500">{a.spec} · {a.avail}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700"><Icon name="shield-check" className="w-3 h-3" />{a.comp}</span>
                  <ConfirmBadge state={a.state} />
                  <div className="flex items-center gap-1 ml-2">
                    <button className="w-8 h-8 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-600"><Icon name="message-circle" className="w-3.5 h-3.5" /></button>
                    <button className="w-8 h-8 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-600"><Icon name="rotate-ccw" className="w-3.5 h-3.5" /></button>
                    <button className="w-8 h-8 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-600"><Icon name="x" className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {ASSIGNED.length < req.need && (
                <div className="px-5 py-3.5 flex items-center gap-3 bg-amber-50/40">
                  <span className="w-8 h-8 rounded-full border border-dashed border-amber-400 inline-flex items-center justify-center text-amber-700"><Icon name="user-plus" className="w-3.5 h-3.5" /></span>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium tracking-tight text-amber-900">Slot {ASSIGNED.length + 1} of {req.need} · open</div>
                    <div className="text-[11px] font-mono text-amber-700">4 strong candidates suggested below</div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-teal-700 text-white text-[12px] font-medium hover:bg-teal-800"><Icon name="wand-2" className="w-3.5 h-3.5" /> Auto-fill</button>
                </div>
              )}
            </div>
          </Section>

          {/* Suggested matches */}
          <Section title="Suggested matches" sub="Ranked by availability, distance, compliance, and reliability" action={<button className="text-[11px] font-mono text-ink-500 hover:text-ink-900">Tune ranking</button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink-100">
              {SUGGESTED.map((s, i) => (
                <div key={i} className="bg-white p-4 hover:bg-ink-50/40">
                  <div className="flex items-start gap-3">
                    <Avatar initials={s.i} tone={s.t as any} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[14px] font-medium tracking-tight truncate">{s.name}</div>
                        <span className="text-[10px] font-mono px-1.5 h-4 rounded bg-teal-50 text-teal-700 inline-flex items-center">match {s.rel}</span>
                      </div>
                      <div className="text-[11px] font-mono text-ink-500">{s.spec}</div>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-mono">
                        <span className="inline-flex items-center gap-1 text-ink-700"><Icon name="map-pin" className="w-3 h-3" />{s.dist}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700"><Icon name="check" className="w-3 h-3" />{s.avail}</span>
                        <span className={`inline-flex items-center gap-1 ${s.creds === "Verified" ? "text-emerald-700" : "text-amber-700"}`}><Icon name="shield-check" className="w-3 h-3" />{s.creds}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex-1 h-8 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-800 inline-flex items-center justify-center gap-1.5"><Icon name="send" className="w-3 h-3" /> Invite to shift</button>
                    <button className="h-8 px-2.5 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">View</button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Activity feed */}
          <Section title="Operational activity" sub="Real-time stream · this request" action={<span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700"><Dot tone="green" pulse /> live</span>}>
            <div className="px-5 py-3">
              <ol className="relative pl-4 border-l border-ink-200">
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="relative pl-4 pb-3 last:pb-0">
                    <span className={`absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${a.tone === "green" ? "bg-emerald-500" : a.tone === "rose" ? "bg-rose-500" : a.tone === "teal" ? "bg-teal-500" : "bg-ink-400"}`} />
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono text-ink-500 w-10">{a.t}</span>
                      <Icon name={a.icon} className={`w-3.5 h-3.5 ${a.tone === "green" ? "text-emerald-600" : a.tone === "rose" ? "text-rose-600" : a.tone === "teal" ? "text-teal-600" : "text-ink-500"}`} />
                      <div className="flex-1 text-[12px] leading-snug"><span className="font-medium tracking-tight">{a.who}</span> <span className="text-ink-600">{a.what}</span></div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          {/* Facility details */}
          <Section title="Facility" sub={req.facility}>
            <div className="px-5 py-4 space-y-3">
              <Field icon="user"     label="Primary contact"   value="Dr. Karim Ahmed · DON" />
              <Field icon="phone"    label="Phone"              value="(415) 555-0182" mono />
              <Field icon="mail"     label="Email"              value="staffing@mercyhealth.org" mono />
              <Field icon="map-pin"  label="Location"            value="2233 Polk St, San Francisco" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Requirements</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {["ICU competency","Vent experience","Mercy badge","Night-shift cleared"].map(t => <span key={t} className="text-[10px] font-mono px-1.5 h-5 inline-flex items-center rounded bg-paper border border-ink-200 text-ink-700">{t}</span>)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Preferred staff</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <AvatarStack people={[{initials:"AM",tone:"teal"},{initials:"SN",tone:"violet"},{initials:"JR",tone:"rose"}]} max={4} />
                  <span className="text-[11px] font-mono text-ink-600">3 favorites</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Notes</div>
                <div className="mt-1 text-[12px] text-ink-700 leading-relaxed">Mercy ICU prefers RNs cleared on Cerner. Check-in at the 4th-floor desk; security badge ready at lobby.</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Escalation</div>
                <div className="mt-1 text-[12px]">Director of Nursing · pages after T-2h unfilled</div>
              </div>
            </div>
          </Section>

          {/* Compliance verification */}
          <Section title="Compliance verification" sub="Per-RN gates · enforced before assignment">
            <div className="divide-y divide-ink-100">
              {COMP_VERIFY.map((c, i) => {
                const tone = c.state === "Verified" ? "emerald" : c.state === "Expiring Soon" ? "amber" : "rose";
                return (
                  <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-md bg-${tone}-50 text-${tone}-700 inline-flex items-center justify-center`}><Icon name={c.icon} className="w-3.5 h-3.5" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium tracking-tight">{c.item}</div>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 h-5 inline-flex items-center rounded ${tone === "emerald" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{c.state}</span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Communication */}
          <Section title="Communication" sub="Unified thread · RNs, facility, internal notes">
            <div className="px-5 py-3 space-y-3">
              <CommBubble who="L. Mahoney" tone="ink" t="14m" target="internal" text="Auto-matched 7 RNs. Pushed to top 4 — flagging Sayuri given 30d cancel." />
              <CommBubble who="Mercy · K. Ahmed" tone="teal" t="22m" target="facility" text="Confirming both RNs need Cerner clearance. Thanks." />
              <CommBubble who="A. Martinez" tone="green" t="14m" target="rn" text="Confirmed. Will check in by 18:50." />
              <div className="rounded-lg border border-ink-200 bg-paper/40 p-2.5 mt-2">
                <textarea rows={2} placeholder="Message all assigned RNs · facility · or internal note…" className="w-full bg-transparent text-[12px] outline-none resize-none" />
                <div className="flex items-center gap-2 mt-1.5">
                  <select className="h-7 px-2 rounded border border-ink-200 bg-white text-[11px] font-mono outline-none">
                    <option>Assigned RNs</option><option>Facility</option><option>Internal notes</option><option>All channels</option>
                  </select>
                  <button className="ml-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-teal-700 text-white text-[11px] font-medium hover:bg-teal-800"><Icon name="send" className="w-3 h-3" /> Send</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <QuickComm icon="megaphone" label="Broadcast" />
                <QuickComm icon="message-circle" label="Message RNs" />
                <QuickComm icon="bell" label="Notify facility" />
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div className="text-center text-[10px] font-mono text-ink-400 py-4">{req.id} · operations · live</div>
    </main>
  );
}

function Section({ title, sub, action, children }: any) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white">
      <div className="px-5 py-3 border-b border-ink-100 flex items-center gap-3">
        <div>
          <div className="text-[13px] font-medium tracking-tight">{title}</div>
          {sub && <div className="text-[11px] font-mono text-ink-500 mt-0.5">{sub}</div>}
        </div>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </section>
  );
}

function ConfirmBadge({ state }: any) {
  const m: any = {
    "Invited":   { cls:"bg-ink-100 text-ink-700", dot:"ink"   },
    "Accepted":  { cls:"bg-teal-50 text-teal-700", dot:"teal"  },
    "Confirmed": { cls:"bg-emerald-50 text-emerald-700", dot:"green" },
    "Checked In":{ cls:"bg-emerald-50 text-emerald-700", dot:"green", pulse:true },
    "Completed": { cls:"bg-ink-100 text-ink-600", dot:"ink" },
  };
  const s = m[state];
  return <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${s.cls}`}><Dot tone={s.dot} pulse={s.pulse} />{state}</span>;
}

function Field({ icon, label, value, mono = false }: any) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-7 h-7 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-500 shrink-0"><Icon name={icon} className="w-3.5 h-3.5" /></span>
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
        <div className={`text-[12px] ${mono ? "font-mono text-ink-700" : "text-ink-900"}`}>{value}</div>
      </div>
    </div>
  );
}

function CommBubble({ who, tone, t, target, text }: any) {
  const targetMap: Record<string,{l:string;cls:string}> = {
    internal: { l:"internal note", cls:"bg-ink-100 text-ink-700" },
    facility: { l:"to facility",   cls:"bg-teal-50 text-teal-700" },
    rn:       { l:"from RN",       cls:"bg-emerald-50 text-emerald-700" },
  };
  const tg = targetMap[target];
  return (
    <div className="flex items-start gap-2.5">
      <Avatar initials={who.split(" ").map((s:string) => s[0]).join("").slice(0,2)} tone={tone} size={26} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-medium tracking-tight">{who}</div>
          <span className={`text-[9px] font-mono px-1 h-3.5 rounded inline-flex items-center ${tg.cls}`}>{tg.l}</span>
          <span className="text-[10px] font-mono text-ink-400">{t}</span>
        </div>
        <div className="text-[12px] text-ink-700 leading-snug mt-0.5">{text}</div>
      </div>
    </div>
  );
}

function QuickComm({ icon, label }: any) {
  return (
    <button className="rounded-md border border-ink-200 bg-paper/40 hover:bg-ink-100 px-2 py-2 flex flex-col items-start gap-1">
      <Icon name={icon} className="w-3.5 h-3.5 text-ink-700" />
      <span className="text-[10px] font-mono text-ink-700">{label}</span>
    </button>
  );
}

// ───────────── Root ─────────────
function App() {
  const [open, setOpen] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const trail = open
    ? <><a href="#" onClick={(e:any) => { e.preventDefault(); setOpen(null); }} className="text-ink-500 hover:text-ink-900">Staffing requests</a><Icon name="chevron-right" className="w-3 h-3 text-ink-300" /><span className="text-ink-900 font-medium">{open.id}</span></>
    : <span className="text-ink-900 font-medium">Staffing requests</span>;
  return (
    <div className="min-h-screen bg-paper text-ink-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar trail={trail} onNew={() => setCreating(true)} />
        {open ? <DetailView req={open} onBack={() => setOpen(null)} /> : <ListView onOpen={setOpen} onNew={() => setCreating(true)} />}
      </div>
      <CreateRequestSheet open={creating} onClose={() => setCreating(false)} onCreated={() => setOpen(REQUESTS[0])} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
})();
