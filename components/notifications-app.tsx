"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, Avatar, Dot } from "@/components/primitives";
import { DesignCanvas, DCSection, DCArtboard } from "@/components/design-canvas";
import { IOSDevice } from "@/components/ios-frame";

// ───────── tones / pills ─────────
const PRIO: any = {
  Info:      { ic:"info",          bg:"bg-sky-50",     tx:"text-sky-700",     bd:"border-sky-200",    ring:"ring-sky-200",    dot:"sky"  },
  Important: { ic:"bell",          bg:"bg-teal-50",    tx:"text-teal-800",    bd:"border-teal-200",   ring:"ring-teal-200",   dot:"teal" },
  Urgent:    { ic:"alert-triangle",bg:"bg-amber-50",   tx:"text-amber-800",   bd:"border-amber-200",  ring:"ring-amber-200",  dot:"amber" },
  Critical:  { ic:"alert-octagon", bg:"bg-rose-50",    tx:"text-rose-800",    bd:"border-rose-300",   ring:"ring-rose-300",   dot:"red", pulse:true },
};
function PriorityPill({ p }:any) {
  const t = PRIO[p];
  return <span className={`inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${t.bg} ${t.tx}`}><Dot tone={t.dot} pulse={!!t.pulse} />{p}</span>;
}
function CategoryChip({ c }:any) {
  const map: any = {
    "Staffing":    { i:"clipboard-list", t:"text-teal-700"   },
    "Shift":       { i:"calendar-clock", t:"text-sky-700"    },
    "Cancel":      { i:"x-octagon",      t:"text-rose-700"   },
    "Compliance":  { i:"shield-check",   t:"text-amber-700"  },
    "Workforce":   { i:"users",          t:"text-violet-700" },
    "Facility":    { i:"building-2",     t:"text-ink-700"    },
    "Critical":    { i:"flame",          t:"text-rose-700"   },
  };
  const v = map[c] ?? map.Shift;
  return <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${v.t}`}><Icon name={v.i} className="w-3 h-3" /> {c}</span>;
}
function Eyebrow({ children }:any) { return <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">{children}</div>; }
function Stat({ k, v, tone="ink" }:any) { return <div><div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{k}</div><div className={`text-[22px] font-medium tabular-nums leading-none mt-1 text-${tone}-900`}>{v}</div></div>; }

// ═══════════════════════════════════════════════════════
// 1 · GLOBAL NOTIFICATION CENTER
// ═══════════════════════════════════════════════════════
const NOTIFS = [
  { id:"n01", cat:"Critical",   prio:"Critical",  title:"2 ICU RN shifts remain unfilled · tonight 19:00", msg:"Mercy Mt. Sinai · REQ-2849 · 8h 24m to start. Match engine has expanded to 25mi.", who:"REQ-2849", whoSub:"Mercy Mt. Sinai", t:"2m",  read:false, action:"View request" },
  { id:"n02", cat:"Staffing",   prio:"Important", title:"Aria Martinez accepted tonight's shift",            msg:"Confirmed for ICU · 19:00 — 07:00. Match score 97. Briefing at 18:45.",              who:"Aria Martinez", whoSub:"RN · ICU", avatar:"AM", at:"teal", t:"6m",  read:false, action:"Open shift" },
  { id:"n03", cat:"Compliance", prio:"Urgent",    title:"3 RN licenses expire within 7 days",                msg:"P. Vance, J. Reyes, K. Kim — Hep B and BLS expirations approaching. Auto-suspend Apr 14.", who:"3 professionals", whoSub:"workforce", t:"14m", read:false, action:"Resolve alert", grouped:3 },
  { id:"n04", cat:"Cancel",     prio:"Critical",  title:"Last-minute cancellation · 11h to start",           msg:"Brielle Okafor cancelled REQ-2851 (ER · tonight). Reason: family emergency. Replacement search active.", who:"REQ-2851", whoSub:"Mercy Mt. Sinai", t:"22m", read:false, action:"Find replacement" },
  { id:"n05", cat:"Staffing",   prio:"Urgent",    title:"Critical staffing request created",                  msg:"L&D · 1 RN · tomorrow 07:00. Standard catchment 0 matches — broadcast required.",     who:"REQ-2854", whoSub:"Mercy Mt. Sinai", t:"42m", read:true,  action:"Broadcast shift" },
  { id:"n06", cat:"Shift",      prio:"Info",      title:"Shift confirmed by 4 of 4 assigned RNs",            msg:"Med-Surg · Wed 07:00. All briefings sent. Coordinator notified.",                      who:"REQ-2860", whoSub:"Mercy Mt. Sinai", t:"1h",  read:true, action:"Open shift" },
  { id:"n07", cat:"Workforce",  prio:"Important", title:"Devon Carter updated availability",                  msg:"Removed Wed nights · added Sat day shift. Schedule recalculated.",                     who:"Devon Carter", whoSub:"RN · ICU", avatar:"DC", at:"amber", t:"2h",  read:true, action:"View profile" },
  { id:"n08", cat:"Facility",   prio:"Info",      title:"Mercy Mt. Sinai updated badge access policy",        msg:"All visiting staff must arrive 30m early starting Apr 11.",                            who:"Mercy Mt. Sinai", whoSub:"facility", t:"4h", read:true, action:"View notice" },
];

function NotificationRow({ n, sel, onSel }:any) {
  const t = PRIO[n.prio];
  const accent = t.dot === "red" ? "border-l-rose-500" : t.dot === "amber" ? "border-l-amber-500" : t.dot === "teal" ? "border-l-teal-600" : "border-l-sky-500";
  return (
    <div className={`group flex items-start gap-3 px-5 py-4 border-b border-ink-100 cursor-pointer hover:bg-ink-50/40 border-l-2 ${n.read ? "border-l-transparent" : accent} ${!n.read ? "bg-paper/40" : ""}`}>
      <input type="checkbox" checked={!!sel} onChange={onSel} className="mt-1 accent-teal-700" />
      <span className={`relative w-9 h-9 rounded-md inline-flex items-center justify-center shrink-0 ${t.bg} ${t.tx}`}>
        {t.pulse && <span className="absolute inset-0 rounded-md bg-rose-300/60 ping-slow" />}
        <Icon name={t.ic} className="w-4 h-4 relative" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryChip c={n.cat} />
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <PriorityPill p={n.prio} />
              {!n.read && <span className="inline-flex items-center gap-1 text-[10px] font-mono text-teal-700"><span className="w-1.5 h-1.5 rounded-full bg-teal-700" /> new</span>}
              {n.grouped && <span className="text-[10px] font-mono text-ink-500">+{n.grouped - 1} similar</span>}
            </div>
            <div className={`mt-1 text-[13.5px] leading-snug tracking-tight ${n.read ? "text-ink-700" : "text-ink-900 font-medium"}`}>{n.title}</div>
            <div className="mt-1 text-[12px] text-ink-600 leading-relaxed">{n.msg}</div>
            <div className="mt-2 flex items-center gap-2.5 text-[11px] font-mono text-ink-500">
              {n.avatar ? <span className="inline-flex items-center gap-1.5"><Avatar initials={n.avatar} tone={n.at} size={16} /> {n.who}</span>
                : <span className="inline-flex items-center gap-1"><Icon name="link" className="w-3 h-3" /> {n.who}</span>}
              <span className="text-ink-300">·</span>
              <span>{n.whoSub}</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-ink-400 whitespace-nowrap shrink-0 mt-0.5">{n.t} ago</div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <button className="h-7 px-3 rounded-md bg-ink-900 text-paper text-[11px] font-medium hover:bg-ink-800 inline-flex items-center gap-1"><Icon name="arrow-right" className="w-3 h-3" /> {n.action}</button>
          <button className="h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50">Snooze</button>
          <button className="h-7 w-7 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50"><Icon name="check" className="w-3 h-3" /></button>
          <button className="h-7 w-7 rounded-md border border-ink-200 bg-white inline-flex items-center justify-center hover:bg-ink-50 ml-auto"><Icon name="more-horizontal" className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

function S1_NotificationCenter() {
  const [tab, setTab] = useState("All");
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const counts: any = {
    "All": NOTIFS.length, "Critical": NOTIFS.filter(n => n.cat === "Critical").length,
    "Staffing": NOTIFS.filter(n => n.cat === "Staffing").length, "Shift": NOTIFS.filter(n => n.cat === "Shift").length,
    "Cancel": NOTIFS.filter(n => n.cat === "Cancel").length, "Compliance": NOTIFS.filter(n => n.cat === "Compliance").length,
    "Workforce": NOTIFS.filter(n => n.cat === "Workforce").length, "Facility": NOTIFS.filter(n => n.cat === "Facility").length,
  };
  const list = tab === "All" ? NOTIFS : NOTIFS.filter(n => n.cat === tab);
  const selCount = Object.values(sel).filter(Boolean).length;
  return (
    <div className="bg-paper" style={{ width:1280, height:920 }}>
      {/* Top bar */}
      <header className="h-14 border-b border-ink-200 bg-white px-5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-ink-900 text-paper inline-flex items-center justify-center font-medium text-[12px]">A</div>
        <div className="text-[11px] font-mono text-ink-500 inline-flex items-center gap-1.5"><span>AsNeeded</span><Icon name="chevron-right" className="w-3 h-3" /><span className="text-ink-800">Notifications</span></div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-72"><Icon name="search" className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" /><input placeholder="Search notifications, REQ-IDs, names…" className="w-full h-9 pl-8 pr-3 rounded-md bg-paper border border-ink-200 text-[12px] outline-none focus:border-teal-500" /></div>
          <button className="h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="settings-2" className="w-3.5 h-3.5" /> Channels</button>
        </div>
      </header>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 flex items-end justify-between">
        <div>
          <Eyebrow>Operational hub · last sync 4s ago</Eyebrow>
          <h1 className="mt-2 text-[32px] leading-tight tracking-[-0.015em] font-medium">Notifications<span className="font-serif italic text-teal-800"> · 4 unread, 2 critical.</span></h1>
        </div>
        <div className="grid grid-cols-4 gap-7 items-end">
          <Stat k="Unread"   v="4" />
          <Stat k="Critical" v="2" tone="rose" />
          <Stat k="Resolved · 24h" v="38" tone="teal" />
          <Stat k="Avg ack time"   v="2m 14s" />
        </div>
      </div>

      <div className="px-7 grid grid-cols-12 gap-5">
        {/* Filters sidebar */}
        <aside className="col-span-3 rounded-xl bg-white border border-ink-200 p-3 h-fit">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 px-2 pt-1 pb-2">Categories</div>
          <nav className="space-y-0.5">
            {["All","Critical","Staffing","Shift","Cancel","Compliance","Workforce","Facility"].map(k => (
              <button key={k} onClick={() => setTab(k)} className={`w-full px-2.5 py-1.5 rounded-md text-[12px] flex items-center gap-2 ${tab === k ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"}`}>
                <span className="flex-1 text-left">{k}</span><span className={`text-[10px] font-mono ${tab === k ? "text-paper/70" : "text-ink-500"}`}>{counts[k]}</span>
              </button>
            ))}
          </nav>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 px-2 pt-4 pb-2">Priority</div>
          <div className="flex flex-wrap gap-1 px-1">
            {Object.keys(PRIO).map(p => <PriorityPill key={p} p={p} />)}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 px-2 pt-4 pb-2">Saved views</div>
          {["Today's escalations","Compliance · 7d window","Cancellations only","Mine to action"].map(v => <button key={v} className="w-full px-2.5 py-1.5 rounded-md text-[12px] text-ink-700 hover:bg-ink-100 flex items-center gap-2"><Icon name="bookmark" className="w-3 h-3 text-ink-400" /><span className="flex-1 text-left truncate">{v}</span></button>)}
          <div className="border-t border-ink-100 mt-3 pt-3 px-2 text-[11px] font-mono text-ink-500">
            <label className="flex items-center justify-between py-1.5"><span>Group similar</span><span className="w-7 h-4 rounded-full bg-teal-700 relative"><span className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></span></label>
            <label className="flex items-center justify-between py-1.5"><span>Show resolved</span><span className="w-7 h-4 rounded-full bg-ink-200 relative"><span className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></span></label>
          </div>
        </aside>

        {/* List */}
        <section className="col-span-9 rounded-xl bg-white border border-ink-200 overflow-hidden flex flex-col">
          {/* Bulk bar */}
          <div className="h-12 border-b border-ink-100 px-5 flex items-center gap-2 bg-paper/30">
            <input type="checkbox" className="accent-teal-700" />
            <span className="text-[11px] font-mono text-ink-500">{selCount > 0 ? `${selCount} selected` : `${list.length} notifications`}</span>
            <div className="w-px h-4 bg-ink-200 mx-1" />
            {selCount > 0 ? (
              <>
                <button className="h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50 inline-flex items-center gap-1"><Icon name="check" className="w-3 h-3" /> Mark read</button>
                <button className="h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50 inline-flex items-center gap-1"><Icon name="bell-off" className="w-3 h-3" /> Snooze</button>
                <button className="h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] hover:bg-ink-50 inline-flex items-center gap-1"><Icon name="user-plus" className="w-3 h-3" /> Assign</button>
                <button className="h-7 px-2.5 rounded-md border border-rose-200 bg-rose-50 text-[11px] text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1"><Icon name="archive" className="w-3 h-3" /> Archive</button>
              </>
            ) : (
              <>
                <button className="h-7 px-2.5 rounded-md text-[11px] hover:bg-ink-100 inline-flex items-center gap-1 text-ink-700"><Icon name="check-check" className="w-3 h-3" /> Mark all read</button>
                <div className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-mono text-ink-500"><Icon name="arrow-down-up" className="w-3 h-3" /> Sort: newest</div>
              </>
            )}
          </div>
          {/* Today group header */}
          <div className="px-5 pt-4 pb-2 text-[10px] font-mono uppercase tracking-wider text-ink-500 flex items-center gap-2">Today · 4 new <span className="flex-1 h-px bg-ink-100 ml-2" /></div>
          {list.slice(0,4).map(n => <NotificationRow key={n.id} n={n} sel={!!sel[n.id]} onSel={() => setSel({...sel, [n.id]:!sel[n.id]})} />)}
          <div className="px-5 pt-4 pb-2 text-[10px] font-mono uppercase tracking-wider text-ink-500 flex items-center gap-2">Earlier this week <span className="flex-1 h-px bg-ink-100 ml-2" /></div>
          {list.slice(4).map(n => <NotificationRow key={n.id} n={n} sel={!!sel[n.id]} onSel={() => setSel({...sel, [n.id]:!sel[n.id]})} />)}
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 2 · REAL-TIME OPERATIONAL ALERTS
// ═══════════════════════════════════════════════════════
function LiveAlertCard({ a }:any) {
  const t = PRIO[a.prio];
  const ringStyle = a.prio === "Critical" ? "ring-2 ring-rose-300 ring-offset-2 ring-offset-paper" : "";
  return (
    <div className={`relative rounded-xl bg-white border ${t.bd} p-5 ${ringStyle}`}>
      {a.prio === "Critical" && <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-mono text-rose-700"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 urgent-pulse" /> live</span>}
      <div className="flex items-start gap-3">
        <span className={`relative w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${t.bg} ${t.tx}`}>
          {a.prio === "Critical" && <span className="absolute inset-0 rounded-full bg-rose-300/60 ping-slow" />}
          <Icon name={t.ic} className="w-4 h-4 relative" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityPill p={a.prio} />
            <span className="text-[10px] font-mono text-ink-500">{a.id}</span>
            {a.escalation && <span className="text-[10px] font-mono px-1.5 h-5 rounded bg-ink-900 text-paper inline-flex items-center">L{a.escalation} escalation</span>}
          </div>
          <div className="mt-1.5 text-[16px] font-medium tracking-tight text-ink-900">{a.title}</div>
          <div className="mt-1 text-[12.5px] text-ink-700 leading-relaxed">{a.msg}</div>

          {/* Mini stats */}
          {a.stats && (
            <div className="mt-3 flex items-center gap-5 pb-1">
              {a.stats.map((s:any, i:number) => (
                <div key={i}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{s.k}</div>
                  <div className={`text-[18px] font-medium tabular-nums leading-none mt-0.5 ${s.tone === "rose" ? "text-rose-700" : s.tone === "amber" ? "text-amber-700" : "text-ink-900"}`}>{s.v}</div>
                </div>
              ))}
            </div>
          )}
          {a.bar && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-[10px] font-mono text-ink-500 mb-1"><span>Time to start</span><span className="ml-auto text-ink-900 font-medium tabular-nums">{a.bar.label}</span></div>
              <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden"><div className={`h-full ${a.bar.tone === "rose" ? "bg-rose-500" : "bg-amber-500"}`} style={{ width:`${a.bar.pct}%` }} /></div>
            </div>
          )}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            {a.actions.map((act:string, i:number) => (
              <button key={i} className={`h-8 px-3 rounded-md text-[11.5px] font-medium inline-flex items-center gap-1.5 ${i === 0 ? (a.prio === "Critical" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-ink-900 text-paper hover:bg-ink-800") : "border border-ink-200 bg-white hover:bg-ink-50"}`}>
                <Icon name={i === 0 ? "zap" : i === 1 ? "send" : "more-horizontal"} className="w-3 h-3" /> {act}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-mono text-ink-500">{a.t}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function S2_LiveAlerts() {
  const alerts = [
    { id:"REQ-2849", prio:"Critical", escalation:2, t:"updated 12s ago", title:"Unfilled urgent shift · ICU · 2 of 3 slots open", msg:"Mercy Mt. Sinai · tonight 19:00 — 07:00. Match engine has expanded to 25mi catchment with no new accepts in last 4 minutes.", stats:[{k:"Filled",v:"1/3", tone:"rose"},{k:"Declines",v:"7"},{k:"Catchment",v:"25mi"}], bar:{ pct:88, label:"8h 24m left", tone:"rose"}, actions:["Broadcast to backup pool","Allow OT for confirmed","Escalate to Ops director"] },
    { id:"REQ-2854", prio:"Urgent", t:"3m ago", title:"Multiple RN declines · L&D · 6 declines in 12 minutes", msg:"Standard catchment exhausted. No L&D RNs available within 15mi for tomorrow's day shift.", stats:[{k:"Declines",v:"6"},{k:"Pool",v:"0 avail"},{k:"Catchment",v:"15mi"}], actions:["Expand search radius","Notify facility","Open shift to broadcast"] },
    { id:"FAC-014",  prio:"Critical", t:"6m ago", title:"Facility escalation · Mercy Mt. Sinai", msg:"Director Allen escalated — concerned about coverage across 3 active requests tonight. Awaiting ops response.", actions:["Reply to facility","Pull all open requests","Notify VP staffing"] },
    { id:"REQ-2862", prio:"Urgent", t:"14m ago", title:"Shift starts in 1h without confirmation", msg:"R. Park assigned to Telemetry shift but has not confirmed despite 3 nudges. Backup available within 12mi.", bar:{ pct:62, label:"58m left", tone:"amber" }, actions:["Auto-assign backup","SMS again","Mark as no-show"] },
  ];
  return (
    <div className="bg-paper p-7" style={{ width:1280, height:840 }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <Eyebrow><span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 urgent-pulse" /> Live · operations command</span></Eyebrow>
          <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.015em] font-medium">Real-time operational alerts<span className="font-serif italic text-teal-800"> · 4 active.</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white border border-ink-200 px-3 py-2 flex items-center gap-3">
            <div className="text-center"><div className="text-[10px] font-mono text-ink-500">CRITICAL</div><div className="text-[18px] font-medium tabular-nums leading-none text-rose-700">2</div></div>
            <div className="w-px h-7 bg-ink-200" />
            <div className="text-center"><div className="text-[10px] font-mono text-ink-500">URGENT</div><div className="text-[18px] font-medium tabular-nums leading-none text-amber-700">2</div></div>
            <div className="w-px h-7 bg-ink-200" />
            <div className="text-center"><div className="text-[10px] font-mono text-ink-500">RESOLVED · 1H</div><div className="text-[18px] font-medium tabular-nums leading-none text-emerald-700">14</div></div>
          </div>
          <button className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-800 inline-flex items-center gap-1.5"><Icon name="phone-call" className="w-3.5 h-3.5" /> Pager dispatch</button>
        </div>
      </div>

      {/* Banner — system-wide critical */}
      <div className="rounded-xl border border-rose-300 bg-gradient-to-r from-rose-50 to-rose-50/30 p-4 flex items-start gap-3 mb-4 urgent-pulse">
        <span className="relative inline-flex"><span className="absolute inset-0 rounded-full bg-rose-300 ping-slow" /><span className="relative w-9 h-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center"><Icon name="siren" className="w-4 h-4" /></span></span>
        <div className="flex-1">
          <div className="flex items-center gap-2"><span className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-700">System critical · escalation L2 active</span><span className="text-[10px] font-mono text-rose-500">incident #INC-0411</span></div>
          <div className="text-[15px] font-medium tracking-tight text-rose-900 mt-0.5">3 critical staffing alerts open across 2 facilities · directors paged 14:08</div>
        </div>
        <button className="h-9 px-4 rounded-md bg-rose-600 text-white text-[12px] font-medium">Open command view</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {alerts.map(a => <LiveAlertCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 3 · SHIFT REMINDER NOTIFICATIONS  (3 versions: push / SMS / in-app)
// ═══════════════════════════════════════════════════════
function PushPreview() {
  return (
    <div className="relative" style={{ width:402, height:874 }}>
      <IOSDevice width={402} height={874} dark>
        <div className="px-6 pt-12 text-paper">
          <div className="text-center text-paper/80 text-[14px] font-light tracking-tight">Tuesday, April 9</div>
          <div className="text-center text-[88px] font-thin leading-none tracking-tighter mt-1">14:36</div>
          <div className="text-center mt-1 inline-flex items-center justify-center gap-1.5 w-full text-[11px] text-paper/70 font-mono"><Icon name="lock" className="w-3 h-3" /> Locked</div>

          <div className="mt-8 space-y-2">
            {/* Push 1 — primary */}
            <div className="rounded-2xl bg-white/15 backdrop-blur-xl p-3.5 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[10px] font-mono text-paper/70">
                <span className="w-4 h-4 rounded bg-paper text-ink-900 inline-flex items-center justify-center font-medium text-[8px]">A</span>
                <span>ASNEEDED</span><span className="ml-auto">2h to start</span>
              </div>
              <div className="text-[14px] font-semibold tracking-tight mt-1.5">⏰ Shift reminder · ICU tonight</div>
              <div className="text-[12.5px] text-paper/85 leading-snug mt-0.5">Mercy Mt. Sinai · 19:00 — 07:00. Briefing at 18:45 with charge nurse T. Okafor.</div>
            </div>
            {/* Push 2 — confirmation pending */}
            <div className="rounded-2xl bg-white/12 backdrop-blur-xl p-3.5 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[10px] font-mono text-paper/60">
                <span className="w-4 h-4 rounded bg-paper text-ink-900 inline-flex items-center justify-center font-medium text-[8px]">A</span>
                <span>ASNEEDED</span><span className="ml-auto">8m ago</span>
              </div>
              <div className="text-[13.5px] font-semibold tracking-tight mt-1.5">Confirm tomorrow's L&D shift</div>
              <div className="text-[12px] text-paper/80 leading-snug mt-0.5">St. Bartholomew · 07:00. Tap to confirm — coordinator waiting.</div>
            </div>
            {/* Stacked indicator */}
            <div className="rounded-2xl bg-white/8 backdrop-blur-xl px-3.5 py-2 ring-1 ring-white/5 text-[11px] text-paper/50 inline-flex items-center justify-between w-full">
              <span>3 more from AsNeeded</span><Icon name="chevron-down" className="w-3 h-3" />
            </div>
          </div>

          {/* Action sheet (long-press) */}
          <div className="absolute left-4 right-4 bottom-24">
            <div className="rounded-xl bg-white/90 backdrop-blur-xl text-ink-900 overflow-hidden">
              <div className="px-3 py-2 border-b border-ink-200/60 text-[10px] font-mono text-ink-600 uppercase tracking-wider">Shift reminder · ICU · tonight</div>
              <button className="w-full px-3 py-2.5 flex items-center gap-2 text-[13px] font-medium hover:bg-ink-100 border-b border-ink-200/60"><Icon name="check" className="w-3.5 h-3.5 text-emerald-700" /> Confirm shift</button>
              <button className="w-full px-3 py-2.5 flex items-center gap-2 text-[13px] hover:bg-ink-100 border-b border-ink-200/60"><Icon name="message-circle" className="w-3.5 h-3.5 text-teal-700" /> Message coordinator</button>
              <button className="w-full px-3 py-2.5 flex items-center gap-2 text-[13px] hover:bg-ink-100"><Icon name="map-pin" className="w-3.5 h-3.5 text-violet-700" /> Directions</button>
            </div>
          </div>
        </div>
      </IOSDevice>
    </div>
  );
}
function SMSPreview() {
  return (
    <div className="relative" style={{ width:402, height:874 }}>
      <IOSDevice width={402} height={874}>
        <div className="h-full flex flex-col">
          <div className="pt-14 px-4 pb-2 text-center border-b border-ink-200">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white inline-flex items-center justify-center font-medium mb-1">A</div>
            <div className="text-[14px] font-semibold tracking-tight">AsNeeded</div>
            <div className="text-[11px] font-mono text-ink-500">+1 (415) 555-0142 · text</div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-paper/40">
            <div className="text-center text-[10px] font-mono text-ink-400 py-1">— Today 16:30 —</div>
            <div className="flex justify-start"><div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white text-ink-900 px-3 py-2 text-[13px] leading-snug shadow-sm border border-ink-100">⏰ <strong>Shift reminder</strong>: Tonight 19:00 — Mercy Mt. Sinai · ICU. Briefing 18:45.<br/><span className="text-ink-600">Reply Y to confirm, N to release. Reply STOP to opt out.</span></div></div>
            <div className="flex justify-end"><div className="max-w-[60%] rounded-2xl rounded-br-sm bg-[#3b82f6] text-white px-3 py-2 text-[14px] leading-snug">Y</div></div>
            <div className="flex justify-start"><div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white text-ink-900 px-3 py-2 text-[13px] leading-snug shadow-sm border border-ink-100">✓ <strong>Confirmed</strong>. Coordinator L. Mahoney has been notified. Open AsNeeded for directions and check-in.<br/><span className="text-teal-700 underline">asneeded.app/shift/2849</span></div></div>
            <div className="text-center text-[10px] font-mono text-ink-400 py-1">— 17:00 (in 30m) —</div>
            <div className="flex justify-start"><div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white text-ink-900 px-3 py-2 text-[13px] leading-snug shadow-sm border border-ink-100">📍 <strong>Check-in available in 1h</strong>. Tap arrived: <span className="text-teal-700 underline">asneeded.app/in/2849</span></div></div>
          </div>
          <div className="border-t border-ink-200 bg-paper px-3 py-3 flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-ink-600"><Icon name="plus" className="w-4 h-4" /></button>
            <div className="flex-1 h-9 rounded-full bg-white border border-ink-200 px-3 flex items-center text-[12px] text-ink-400">iMessage</div>
            <button className="w-9 h-9 rounded-full bg-ink-900 text-paper inline-flex items-center justify-center"><Icon name="mic" className="w-4 h-4" /></button>
          </div>
        </div>
      </IOSDevice>
    </div>
  );
}
function InAppReminder() {
  return (
    <div style={{ width:402, height:874 }}>
      <IOSDevice width={402} height={874}>
        <div className="h-full bg-paper flex flex-col">
          <div className="pt-14 px-5 pb-3 flex items-center gap-2.5">
            <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="arrow-left" className="w-4 h-4" /></button>
            <div className="flex-1"><div className="text-[18px] font-medium tracking-tight">Reminders</div><div className="text-[10px] font-mono text-ink-500">3 active</div></div>
            <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="bell" className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
            {/* Hero — next shift */}
            <div className="rounded-2xl bg-ink-900 text-paper p-5 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal-700/30 blur-2xl" />
              <div className="relative">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-300">Next shift · 2h to start</div>
                <div className="text-[22px] font-medium tracking-tight mt-1">Mercy Mt. Sinai</div>
                <div className="text-[12px] font-mono text-paper/70">ICU · 19:00 — 07:00 · 12h</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                  <div><div className="text-paper/50 font-mono uppercase tracking-wider text-[9px]">Coord.</div><div className="mt-0.5 inline-flex items-center gap-1"><Avatar initials="LM" tone="teal" size={14} /> L. Mahoney</div></div>
                  <div><div className="text-paper/50 font-mono uppercase tracking-wider text-[9px]">Briefing</div><div className="mt-0.5">18:45 · 4N</div></div>
                  <div><div className="text-paper/50 font-mono uppercase tracking-wider text-[9px]">Distance</div><div className="mt-0.5">3.2 mi · 12m</div></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 h-10 rounded-full bg-paper text-ink-900 text-[13px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" /> Confirm</button>
                  <button className="w-10 h-10 rounded-full bg-paper/15 inline-flex items-center justify-center"><Icon name="map-pin" className="w-4 h-4" /></button>
                  <button className="w-10 h-10 rounded-full bg-paper/15 inline-flex items-center justify-center"><Icon name="message-circle" className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Reminder rows */}
            {[
              { i:"calendar-clock", tone:"teal",   l:"Tomorrow 07:00 · L&D", s:"St. Bartholomew · awaiting confirmation", w:"in 16h", action:"Confirm" },
              { i:"map-pin",        tone:"violet", l:"Check-in available", s:"Mercy Mt. Sinai · within 0.5mi at 18:30", w:"in 2h", action:"Set up" },
              { i:"shield-check",   tone:"amber",  l:"Hep B booster reminder", s:"Expires Apr 14 · upload after appt", w:"5d", action:"Upload" },
            ].map((r:any, i:number) => (
              <div key={i} className="rounded-xl bg-white border border-ink-200 p-4 flex items-start gap-3">
                <span className={`w-9 h-9 rounded-md inline-flex items-center justify-center bg-${r.tone}-50 text-${r.tone}-700 shrink-0`}><Icon name={r.i} className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium tracking-tight">{r.l}</div>
                  <div className="text-[11.5px] text-ink-600 leading-snug mt-0.5">{r.s}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="h-7 px-3 rounded-full bg-ink-900 text-paper text-[11px] font-medium">{r.action}</button>
                    <span className="text-[10px] font-mono text-ink-500">{r.w}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IOSDevice>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 4 · CANCELLATION ALERTS
// ═══════════════════════════════════════════════════════
function S4_Cancellation() {
  return (
    <div className="bg-paper p-7" style={{ width:1100, height:820 }}>
      <Eyebrow>Critical operational flow</Eyebrow>
      <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.015em] font-medium">Cancellation alert<span className="font-serif italic text-rose-700"> · replacement needed.</span></h1>

      {/* Main alert */}
      <div className="mt-5 rounded-2xl bg-white border border-rose-300 overflow-hidden ring-2 ring-rose-200 ring-offset-4 ring-offset-paper">
        {/* Strip */}
        <div className="bg-rose-600 text-white px-6 py-3 flex items-center gap-3">
          <span className="relative inline-flex"><span className="absolute inset-0 rounded-full bg-white/30 ping-slow" /><span className="relative w-7 h-7 rounded-full bg-white text-rose-700 inline-flex items-center justify-center"><Icon name="x-octagon" className="w-3.5 h-3.5" /></span></span>
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-100">Cancellation · L2 escalation · INC-0411</div>
          <div className="ml-auto text-[11px] font-mono inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white blink" /> live · updated 18s ago</div>
        </div>
        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityPill p="Critical" />
              <span className="text-[10px] font-mono text-ink-500">REQ-2851 · Mercy Mt. Sinai</span>
            </div>
            <h2 className="mt-2 text-[22px] font-medium tracking-tight leading-tight">Brielle Okafor cancelled tonight's ER shift<span className="font-serif italic text-ink-600"> · 11h to start.</span></h2>
            <div className="mt-1 text-[13px] text-ink-700 leading-relaxed">Reason: family emergency. Released at 14:32. Match engine is searching backup pool within 25mi for ER-credentialed RNs. <span className="text-rose-700 font-medium">2 candidates already responded.</span></div>

            {/* Impact */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3"><div className="text-[10px] font-mono uppercase tracking-wider text-rose-700">Shift impact</div><div className="text-[14px] font-medium mt-1">1/2 → 1/2 unfilled</div><div className="text-[11px] text-rose-700 mt-0.5">facility minimum: 2 RN ER coverage</div></div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3"><div className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Time to start</div><div className="text-[14px] font-medium mt-1 tabular-nums">11h 02m</div><div className="text-[11px] text-amber-700 mt-0.5">enters critical window in 5h</div></div>
            </div>

            {/* Recommended actions */}
            <div className="mt-5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Recommended next actions · ranked</div>
              <div className="space-y-2">
                {[
                  { i:"zap",     l:"Auto-broadcast to backup pool",    s:"22 ER-credentialed RNs within 25mi · est. 3-7m response", primary:true },
                  { i:"users",   l:"Find replacement manually",         s:"3 top-match candidates ready to confirm" },
                  { i:"phone",   l:"Notify facility · charge nurse",    s:"Mercy Mt. Sinai · T. Okafor · standard SLA" },
                  { i:"shield",  l:"Escalate to ops director",          s:"L3 escalation · paged to Sara Lin" },
                ].map((act:any, i:number) => (
                  <button key={i} className={`w-full rounded-md border px-3 py-2.5 flex items-center gap-3 text-left ${act.primary ? "bg-ink-900 border-ink-900 text-paper hover:bg-ink-800" : "bg-white border-ink-200 hover:border-ink-400"}`}>
                    <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center ${act.primary ? "bg-paper/15 text-paper" : "bg-paper/30 text-ink-700"}`}><Icon name={act.i} className="w-3.5 h-3.5" /></span>
                    <div className="flex-1 min-w-0"><div className={`text-[12.5px] font-medium tracking-tight ${act.primary ? "text-paper" : "text-ink-900"}`}>{act.l}</div><div className={`text-[10.5px] ${act.primary ? "text-paper/70" : "text-ink-600"}`}>{act.s}</div></div>
                    <Icon name="arrow-right" className={`w-3.5 h-3.5 ${act.primary ? "text-paper" : "text-ink-400"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side — replacement candidates + timeline */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Match candidates · live</div>
              <div className="rounded-lg border border-ink-200 bg-paper/30 divide-y divide-ink-100">
                {[
                  { i:"SK", n:"Sayuri Kim",     score:96, dist:"4.1mi", t:"teal",   status:"responded · 30s",  s:"green" },
                  { i:"MV", n:"Marcus Voss",    score:91, dist:"7.8mi", t:"violet", status:"contacted · 1m",   s:"amber" },
                  { i:"PN", n:"Priya Nair",     score:88, dist:"11mi", t:"sky",    status:"contacted · 2m",   s:"amber" },
                  { i:"RT", n:"Rafael Torres",  score:84, dist:"14mi", t:"amber",  status:"queued",            s:"ink" },
                ].map((c:any, i:number) => (
                  <div key={i} className="px-3 py-2.5 flex items-center gap-2.5">
                    <Avatar initials={c.i} tone={c.t} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium tracking-tight truncate">{c.n}</div>
                      <div className="text-[10px] font-mono text-ink-500 inline-flex items-center gap-1.5">match {c.score} · {c.dist}<span className="w-1 h-1 rounded-full bg-ink-300" /><Dot tone={c.s} pulse={c.s === "amber"} />{c.status}</div>
                    </div>
                    {i === 0 && <button className="h-7 px-2.5 rounded-md bg-emerald-600 text-white text-[10.5px] font-medium">Confirm</button>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Cancellation timeline</div>
              <ol className="rounded-lg border border-ink-200 bg-paper/30 divide-y divide-ink-100 text-[11.5px]">
                <li className="px-3 py-2 inline-flex items-center gap-2 w-full"><Icon name="user-x" className="w-3 h-3 text-rose-600" /> RN cancelled<span className="ml-auto font-mono text-ink-500">14:32</span></li>
                <li className="px-3 py-2 inline-flex items-center gap-2 w-full"><Icon name="bell" className="w-3 h-3 text-amber-600" /> Coordinator paged<span className="ml-auto font-mono text-ink-500">14:32</span></li>
                <li className="px-3 py-2 inline-flex items-center gap-2 w-full"><Icon name="radar" className="w-3 h-3 text-teal-700" /> Match engine triggered<span className="ml-auto font-mono text-ink-500">14:33</span></li>
                <li className="px-3 py-2 inline-flex items-center gap-2 w-full"><Icon name="send" className="w-3 h-3 text-sky-700" /> 22 RNs contacted<span className="ml-auto font-mono text-ink-500">14:34</span></li>
                <li className="px-3 py-2 inline-flex items-center gap-2 w-full bg-emerald-50/50"><Icon name="check" className="w-3 h-3 text-emerald-700" /> 2 candidates responded<span className="ml-auto font-mono text-ink-500">now</span></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 5 · COMPLIANCE ALERTS
// ═══════════════════════════════════════════════════════
const COMP = [
  { who:"Priya Vance",  i:"PV", t:"ink",    role:"RN · Med-Surg",  cred:"Hep B series",   d:5,  status:"Urgent",     pct:80 },
  { who:"Jordan Reyes", i:"JR", t:"sky",    role:"RN · Med-Surg",  cred:"BLS certification", d:8, status:"Warning",  pct:60 },
  { who:"Kira Kim",     i:"KK", t:"violet", role:"RN · ICU",       cred:"State license",  d:3,  status:"Urgent",     pct:90 },
  { who:"Tomás Marín",  i:"TM", t:"amber",  role:"RN · Med-Surg",  cred:"TB skin test",   d:14, status:"Warning",   pct:40 },
  { who:"Devon Carter", i:"DC", t:"amber",  role:"RN · ICU",       cred:"Background check (annual)", d:0, status:"Suspended", pct:100 },
  { who:"Sayuri Nguyen",i:"SN", t:"violet", role:"RN · ER",        cred:"Flu vaccination", d:21, status:"Warning",  pct:25 },
];
function S5_Compliance() {
  const tone: any = { Warning:{bg:"bg-amber-50", tx:"text-amber-800", bar:"bg-amber-500"}, Urgent:{bg:"bg-rose-50", tx:"text-rose-800", bar:"bg-rose-500"}, Suspended:{bg:"bg-ink-900", tx:"text-paper", bar:"bg-ink-700"} };
  return (
    <div className="bg-paper p-7" style={{ width:1280, height:820 }}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <Eyebrow>Workforce credentials</Eyebrow>
          <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.015em] font-medium">Compliance alerts<span className="font-serif italic text-amber-700"> · 6 require action.</span></h1>
        </div>
        <div className="flex items-center gap-2"><button className="h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="users" className="w-3.5 h-3.5" /> Notify compliance team</button><button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-800 inline-flex items-center gap-1.5"><Icon name="send" className="w-3.5 h-3.5" /> Bulk request updates</button></div>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 rounded-xl bg-white border border-ink-200 p-5">
          <div className="flex items-start gap-5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Compliance health</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text-[44px] font-medium tabular-nums leading-none">94<span className="text-[18px] text-ink-500">%</span></span><span className="text-[11px] font-mono text-emerald-700 mb-1">+1.2 vs last week</span></div>
              <div className="text-[11px] text-ink-600 mt-1">209 of 222 active RNs fully credentialed</div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3"><div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700"><Icon name="check-circle-2" className="w-3 h-3" /> Verified</div><div className="text-[20px] font-medium tabular-nums leading-none mt-1.5 text-emerald-800">209</div></div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3"><div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-700"><Icon name="alert-triangle" className="w-3 h-3" /> Expiring · 30d</div><div className="text-[20px] font-medium tabular-nums leading-none mt-1.5 text-amber-800">12</div></div>
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3"><div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-rose-700"><Icon name="x-octagon" className="w-3 h-3" /> Suspended</div><div className="text-[20px] font-medium tabular-nums leading-none mt-1.5 text-rose-800">1</div></div>
            </div>
          </div>
          {/* Stack of expirations */}
          <div className="mt-5 pt-5 border-t border-ink-100">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Expirations · next 30 days</div>
            <div className="space-y-1.5">
              {[
                { l:"State licenses", v:5, max:30, tone:"rose" },
                { l:"BLS / ACLS",      v:4, max:30, tone:"amber" },
                { l:"Hep B / TB / Flu",v:8, max:30, tone:"amber" },
                { l:"Background checks",v:3, max:30, tone:"sky" },
              ].map((b:any, i:number) => (
                <div key={i} className="flex items-center gap-3 text-[11.5px]">
                  <div className="w-32 text-ink-700">{b.l}</div>
                  <div className="flex-1 h-2 rounded bg-ink-100 overflow-hidden"><div className={`h-full bg-${b.tone}-500`} style={{ width:`${(b.v/b.max)*100}%` }} /></div>
                  <div className="w-10 text-right font-mono text-ink-700">{b.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5 rounded-xl bg-white border border-ink-200 p-5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-3">By facility · staffing impact</div>
          <div className="space-y-3">
            {[
              { f:"Mercy Mt. Sinai",  m:3, s:"2 RNs auto-suspend Apr 14 if not resolved" },
              { f:"St. Bartholomew",  m:2, s:"BLS group expires this week" },
              { f:"Sunrise Hospice",  m:1, s:"Annual background check overdue" },
            ].map((r:any, i:number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-ink-200 bg-paper/30 p-3">
                <span className="w-9 h-9 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-medium text-[12px]">{r.f[0]}</span>
                <div className="flex-1"><div className="text-[12.5px] font-medium tracking-tight">{r.f}</div><div className="text-[11px] text-ink-600">{r.s}</div></div>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 h-5 inline-flex items-center rounded">{r.m} at risk</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <section className="col-span-12 rounded-xl bg-white border border-ink-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <Icon name="shield-check" className="w-4 h-4 text-amber-700" />
            <div className="text-[13px] font-medium tracking-tight">Credentials requiring action</div>
            <span className="text-[10px] font-mono text-ink-500 ml-1">{COMP.length} alerts</span>
            <div className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-ink-500"><Icon name="filter" className="w-3 h-3" /> filter · sort</div>
          </div>
          <table className="w-full text-[12px]">
            <thead><tr className="text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
              <th className="text-left font-normal py-2.5 px-5">Professional</th>
              <th className="text-left font-normal py-2.5">Credential</th>
              <th className="text-left font-normal py-2.5">Expiration timeline</th>
              <th className="text-left font-normal py-2.5">Status</th>
              <th className="py-2.5 pr-5"></th>
            </tr></thead>
            <tbody>
              {COMP.map((c:any, i:number) => {
                const t = tone[c.status];
                return (
                  <tr key={i} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2"><Avatar initials={c.i} tone={c.t} size={28} /><div><div className="text-[12.5px] font-medium tracking-tight">{c.who}</div><div className="text-[10px] font-mono text-ink-500">{c.role}</div></div></div>
                    </td>
                    <td className="py-3"><div className="font-medium">{c.cred}</div><div className="text-[10px] font-mono text-ink-500">CRD-{1000+i}</div></td>
                    <td className="py-3 w-72">
                      <div className="flex items-center gap-2 text-[10px] font-mono mb-1"><span className="text-ink-500">issued</span><div className="flex-1 h-1 rounded bg-ink-100 overflow-hidden relative"><div className={`absolute inset-y-0 left-0 ${t.bar}`} style={{ width: `${c.pct}%` }} /></div><span className="text-ink-700">{c.d === 0 ? "today" : `${c.d}d`}</span></div>
                      <div className="text-[10.5px] text-ink-600">{c.d === 0 ? "expired today · auto-suspend triggered" : `expires Apr ${10+c.d}`}</div>
                    </td>
                    <td className="py-3"><span className={`inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${t.bg} ${t.tx}`}>{c.status === "Suspended" ? <Icon name="x-octagon" className="w-3 h-3" /> : <Dot tone={c.status === "Urgent" ? "red" : "amber"} pulse={c.status === "Urgent"} />}{c.status}</span></td>
                    <td className="py-3 pr-5">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="h-7 px-2.5 rounded-md bg-ink-900 text-paper text-[11px] font-medium inline-flex items-center gap-1"><Icon name="upload" className="w-3 h-3" /> Upload</button>
                        <button className="h-7 px-2.5 rounded-md border border-ink-200 bg-white text-[11px] inline-flex items-center gap-1"><Icon name="send" className="w-3 h-3" /> Request update</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 6 · URGENT STAFFING ALERT (single hero card)
// ═══════════════════════════════════════════════════════
function Countdown() {
  const [t, setT] = useState({ h:8, m:24, s:31 });
  useEffect(() => {
    const id = setInterval(() => setT(p => {
      let s = p.s - 1, m = p.m, h = p.h;
      if (s < 0) { s = 59; m -= 1; }
      if (m < 0) { m = 59; h -= 1; }
      if (h < 0) { h = 0; m = 0; s = 0; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n:number) => String(n).padStart(2, "0");
  return <span className="font-mono tabular-nums">{pad(t.h)}<span className="text-paper/40">:</span>{pad(t.m)}<span className="text-paper/40">:</span>{pad(t.s)}</span>;
}
function S6_UrgentStaffing() {
  return (
    <div className="bg-paper p-7" style={{ width:1280, height:820 }}>
      <Eyebrow><span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 urgent-pulse" /> Critical coverage gap</span></Eyebrow>
      <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.015em] font-medium">Urgent staffing alert<span className="font-serif italic text-rose-700"> · ICU shift unfilled.</span></h1>

      <div className="mt-5 rounded-2xl bg-ink-900 text-paper p-7 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-rose-600/30 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative grid grid-cols-12 gap-7">
          <div className="col-span-7">
            <div className="flex items-center gap-2"><span className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-300">Critical · L2 escalation · INC-0411</span><span className="text-[10px] font-mono text-paper/50">REQ-2849 · Mercy Mt. Sinai</span></div>
            <div className="mt-2 text-[36px] leading-tight tracking-[-0.015em] font-medium">2 of 3 ICU RNs<span className="font-serif italic text-rose-200"> still unmatched</span></div>
            <div className="mt-1 text-[14px] text-paper/75 leading-relaxed max-w-[520px]">Match engine has contacted 22 ER-credentialed RNs across 25mi catchment. 7 declines, 0 accepts in last 4 minutes. Manual broadcast and ops escalation eligible.</div>

            {/* Countdown */}
            <div className="mt-7 rounded-xl bg-paper/8 ring-1 ring-paper/15 p-4 flex items-center gap-5">
              <div className="text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-paper/60">Time to start</div>
                <div className="mt-1.5 text-[44px] font-medium leading-none tracking-tight text-rose-200"><Countdown /></div>
              </div>
              <div className="w-px h-12 bg-paper/15" />
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div><div className="text-[10px] font-mono uppercase tracking-wider text-paper/50">Filled</div><div className="text-[24px] font-medium tabular-nums leading-none mt-1 text-rose-200">1<span className="text-[14px] text-paper/50">/3</span></div></div>
                <div><div className="text-[10px] font-mono uppercase tracking-wider text-paper/50">Declines</div><div className="text-[24px] font-medium tabular-nums leading-none mt-1 text-amber-200">7</div></div>
                <div><div className="text-[10px] font-mono uppercase tracking-wider text-paper/50">Catchment</div><div className="text-[24px] font-medium tabular-nums leading-none mt-1">25mi</div></div>
              </div>
            </div>

            {/* Live status feed */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { i:"send",        l:"Broadcast pinged",       s:"22 ER RNs · 25mi", w:"3m" },
                { i:"user-x",      l:"Decline · S. Park",       s:"already on shift",    w:"1m" },
                { i:"phone-call",  l:"Director paged",          s:"Sara Lin · L3",       w:"6m" },
                { i:"radar",       l:"Catchment expanding",    s:"25 → 35mi auto-trigger", w:"4m" },
              ].map((r:any, i:number) => (
                <div key={i} className="rounded-md bg-paper/5 ring-1 ring-paper/10 p-2.5 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-paper/10 inline-flex items-center justify-center text-paper/80"><Icon name={r.i} className="w-3.5 h-3.5" /></span>
                  <div className="flex-1 min-w-0"><div className="text-[12px] font-medium">{r.l}</div><div className="text-[10px] font-mono text-paper/60 truncate">{r.s}</div></div>
                  <span className="text-[10px] font-mono text-paper/50">{r.w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — actions */}
          <div className="col-span-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-paper/60 mb-2">Operations console · pick fastest path</div>
            <div className="space-y-2">
              <button className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-4 text-left flex items-center gap-3 ring-2 ring-rose-300/50 ring-offset-2 ring-offset-ink-900 urgent-pulse">
                <span className="w-10 h-10 rounded-full bg-white/15 inline-flex items-center justify-center"><Icon name="megaphone" className="w-4 h-4" /></span>
                <div className="flex-1"><div className="text-[15px] font-medium tracking-tight">Broadcast to entire workforce</div><div className="text-[11px] text-rose-100">All ER + ICU RNs · 480 pros · est. 2-5m response</div></div>
                <Icon name="arrow-right" className="w-4 h-4" />
              </button>
              <button className="w-full rounded-xl bg-paper/10 hover:bg-paper/15 px-4 py-3 text-left flex items-center gap-3 ring-1 ring-paper/15">
                <span className="w-9 h-9 rounded-full bg-paper/10 inline-flex items-center justify-center"><Icon name="radar" className="w-4 h-4" /></span>
                <div className="flex-1"><div className="text-[14px] font-medium">Expand search radius · 25 → 50mi</div><div className="text-[11px] text-paper/60">+38 candidates · travel premium applies</div></div>
                <Icon name="arrow-right" className="w-4 h-4 text-paper/60" />
              </button>
              <button className="w-full rounded-xl bg-paper/10 hover:bg-paper/15 px-4 py-3 text-left flex items-center gap-3 ring-1 ring-paper/15">
                <span className="w-9 h-9 rounded-full bg-paper/10 inline-flex items-center justify-center"><Icon name="phone" className="w-4 h-4" /></span>
                <div className="flex-1"><div className="text-[14px] font-medium">Notify facility · charge nurse</div><div className="text-[11px] text-paper/60">T. Okafor · floor briefing pending</div></div>
                <Icon name="arrow-right" className="w-4 h-4 text-paper/60" />
              </button>
              <button className="w-full rounded-xl bg-paper/10 hover:bg-paper/15 px-4 py-3 text-left flex items-center gap-3 ring-1 ring-paper/15">
                <span className="w-9 h-9 rounded-full bg-paper/10 inline-flex items-center justify-center"><Icon name="shield" className="w-4 h-4" /></span>
                <div className="flex-1"><div className="text-[14px] font-medium">Escalate to Operations VP</div><div className="text-[11px] text-paper/60">L4 escalation · executive page</div></div>
                <Icon name="arrow-right" className="w-4 h-4 text-paper/60" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-paper/5 ring-1 ring-paper/10 p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-paper/60 mb-2">Coordinator on call</div>
              <div className="flex items-center gap-2.5">
                <Avatar initials="LM" tone="teal" size={32} />
                <div className="flex-1"><div className="text-[13px] font-medium">Lena Mahoney</div><div className="text-[10px] font-mono text-paper/60 inline-flex items-center gap-1.5"><Dot tone="green" pulse /> active · responding</div></div>
                <button className="h-8 px-3 rounded-full bg-paper text-ink-900 text-[11.5px] font-medium">Open thread</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 7 · MOBILE NOTIFICATION DRAWER
// ═══════════════════════════════════════════════════════
function MobileDrawer() {
  return (
    <div style={{ width:402, height:874 }}>
      <IOSDevice width={402} height={874}>
        <div className="h-full bg-paper flex flex-col">
          <div className="pt-14 px-5 pb-3 flex items-center gap-2.5">
            <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="x" className="w-4 h-4" /></button>
            <div className="flex-1"><div className="text-[18px] font-medium tracking-tight">Notifications</div><div className="text-[10px] font-mono text-ink-500">5 new · 12 today</div></div>
            <button className="h-8 px-3 rounded-full bg-white border border-ink-200 text-[11px] font-medium">Mark read</button>
          </div>
          <div className="px-5 flex items-center gap-1.5 pb-3 overflow-x-auto">
            {["All","Critical","Shifts","Comms"].map((c,i) => (
              <button key={c} className={`shrink-0 h-7 px-3 rounded-full text-[11px] ${i === 0 ? "bg-ink-900 text-paper" : "bg-white border border-ink-200 text-ink-700"}`}>{c}{i === 1 && <span className="ml-1 text-rose-400">2</span>}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5">
            {/* Swipe action revealed */}
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-emerald-600 to-emerald-500 flex items-center justify-end pr-5 gap-2">
                <Icon name="check" className="w-5 h-5 text-white" />
                <span className="text-white text-[11px] font-medium uppercase tracking-wider">Accept</span>
              </div>
              <div className="rounded-xl bg-white border border-ink-200 p-4 -translate-x-24 transition-transform">
                <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-md bg-rose-50 text-rose-700 inline-flex items-center justify-center"><Icon name="alert-octagon" className="w-3.5 h-3.5" /></span><span className="text-[10px] font-mono text-rose-700 uppercase tracking-wider">Urgent · 2h to start</span><span className="ml-auto text-[10px] font-mono text-ink-400">2m</span></div>
                <div className="text-[14px] font-medium tracking-tight mt-2">Last-minute ICU shift available</div>
                <div className="text-[12px] text-ink-700 mt-0.5">Mercy Mt. Sinai · 19:00 — 07:00 · $78/hr · 3.2mi</div>
              </div>
            </div>

            {/* Standard rows */}
            {[
              { i:"check-circle-2", t:"green", l:"Tonight's shift confirmed", s:"Mercy Mt. Sinai · ICU · briefing 18:45", w:"6m", unread:true },
              { i:"shield-check",   t:"amber", l:"Hep B booster expires in 5d", s:"Upload after appointment to keep eligibility", w:"14m", unread:true },
              { i:"message-circle", t:"teal",  l:"L. Mahoney: arrive 18:30 to badge in", s:"reply expected", w:"22m", unread:true },
              { i:"x-octagon",      t:"rose",  l:"Wednesday shift cancelled by facility", s:"REQ-2860 · automatic re-broadcast in queue", w:"1h" },
              { i:"calendar-clock", t:"sky",   l:"Reminder: tomorrow 07:00 L&D", s:"St. Bartholomew · awaiting confirmation", w:"2h" },
              { i:"trending-up",    t:"violet",l:"Reliability score now 98", s:"+1 vs last month — top 5% in your region", w:"4h" },
            ].map((r:any, i:number) => (
              <div key={i} className={`relative rounded-xl border p-4 flex items-start gap-3 ${r.unread ? "bg-paper/0 border-ink-200 shadow-sm" : "bg-white/60 border-ink-100"}`}>
                {r.unread && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-teal-700" />}
                <span className={`w-8 h-8 rounded-md inline-flex items-center justify-center bg-${r.t}-50 text-${r.t}-700 shrink-0`}><Icon name={r.i} className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12.5px] tracking-tight ${r.unread ? "font-medium" : "text-ink-700"}`}>{r.l}</div>
                  <div className="text-[11px] text-ink-600 mt-0.5 leading-snug">{r.s}</div>
                  <div className="text-[10px] font-mono text-ink-400 mt-1.5">{r.w} ago</div>
                </div>
              </div>
            ))}

            {/* Quick action card */}
            <div className="rounded-xl bg-ink-900 text-paper p-4 mt-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-300">Coordinator nudge · 5m ago</div>
              <div className="text-[14px] font-medium mt-1">Confirm tomorrow's L&D shift?</div>
              <div className="text-[11.5px] text-paper/70 mt-0.5">St. Bartholomew · 07:00. Reply to keep your slot.</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-9 rounded-full bg-paper text-ink-900 text-[12px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" /> Confirm</button>
                <button className="flex-1 h-9 rounded-full bg-paper/15 text-paper text-[12px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="message-circle" className="w-3.5 h-3.5" /> Message</button>
              </div>
            </div>
          </div>
        </div>
      </IOSDevice>
    </div>
  );
}
function MobileToast() {
  return (
    <div style={{ width:402, height:874 }}>
      <IOSDevice width={402} height={874}>
        <div className="h-full bg-paper flex flex-col">
          {/* Top in-app banner */}
          <div className="absolute left-3 right-3 top-12 z-20 rounded-2xl bg-ink-900 text-paper px-4 py-3 shadow-mobile flex items-center gap-3 rise-in">
            <span className="w-8 h-8 rounded-full bg-teal-700 inline-flex items-center justify-center"><Icon name="check" className="w-4 h-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium leading-tight">Shift confirmed</div>
              <div className="text-[11px] text-paper/70 truncate">Mercy Mt. Sinai · tonight 19:00</div>
            </div>
            <button className="h-7 px-3 rounded-full bg-paper/15 text-[11px] font-medium">View</button>
          </div>

          {/* Content underneath */}
          <div className="pt-14 px-5 pb-3 flex items-center gap-2 mt-12">
            <div className="flex-1"><div className="text-[10px] font-mono uppercase tracking-wider text-teal-700">Today</div><div className="text-[20px] font-medium tracking-tight">Your shifts</div></div>
            <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="calendar" className="w-4 h-4" /></button>
          </div>
          <div className="px-5 space-y-3">
            <div className="rounded-xl bg-white border border-ink-200 p-4">
              <div className="flex items-center justify-between"><div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1"><Dot tone="green" /> confirmed</div><div className="text-[10px] font-mono text-ink-500">in 4h 24m</div></div>
              <div className="mt-1 text-[16px] font-medium tracking-tight">Mercy Mt. Sinai · ICU</div>
              <div className="text-[12px] font-mono text-ink-600">19:00 — 07:00 · 12h</div>
            </div>

            {/* Inline urgent banner */}
            <div className="rounded-xl bg-rose-50 border border-rose-300 p-3.5 flex items-start gap-3 urgent-pulse">
              <span className="relative inline-flex shrink-0"><span className="absolute inset-0 rounded-full bg-rose-300 ping-slow" /><span className="relative w-8 h-8 rounded-full bg-rose-600 text-white inline-flex items-center justify-center"><Icon name="alert-octagon" className="w-4 h-4" /></span></span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-700">Urgent replacement needed</div>
                <div className="text-[13px] font-medium tracking-tight text-rose-900 mt-0.5">ER · tonight 19:00 · $96/hr</div>
                <div className="text-[11px] text-rose-700 mt-0.5">2.8mi from you · respond within 8m</div>
                <div className="mt-2 flex gap-2">
                  <button className="h-8 px-3 rounded-full bg-rose-600 text-white text-[11.5px] font-medium">Accept</button>
                  <button className="h-8 px-3 rounded-full border border-rose-300 bg-white text-rose-700 text-[11.5px] font-medium">Decline</button>
                </div>
              </div>
            </div>

            {/* Compliance warning row */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-3">
              <span className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 inline-flex items-center justify-center shrink-0"><Icon name="shield-alert" className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium tracking-tight text-amber-900">Hep B expires in 5 days</div><div className="text-[11px] text-amber-700">Upload renewal to avoid suspension</div></div>
              <button className="h-7 px-3 rounded-md bg-amber-600 text-white text-[11px] font-medium">Upload</button>
            </div>
          </div>
        </div>
      </IOSDevice>
    </div>
  );
}
function MobileLockPush() { return <PushPreview /> }

// ═══════════════════════════════════════════════════════
// 8 · TOASTS / BANNERS
// ═══════════════════════════════════════════════════════
function S8_Toasts() {
  return (
    <div className="bg-paper p-7" style={{ width:1100, height:920 }}>
      <Eyebrow>System patterns · ephemeral feedback</Eyebrow>
      <h1 className="mt-2 text-[28px] leading-tight tracking-[-0.015em] font-medium">Toasts & banners<span className="font-serif italic text-teal-800"> · the system speaks.</span></h1>

      <div className="mt-6 grid grid-cols-12 gap-5">
        {/* Toasts column */}
        <div className="col-span-7 rounded-xl bg-white border border-ink-200 p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-4">Toasts · bottom center · 4s</div>
          <div className="space-y-3">
            {/* Success */}
            <div className="rounded-full bg-ink-900 text-paper px-4 py-2.5 inline-flex items-center gap-2.5 max-w-fit shadow-lifted">
              <span className="w-5 h-5 rounded-full bg-emerald-500 inline-flex items-center justify-center"><Icon name="check" className="w-3 h-3 text-white" /></span>
              <span className="text-[12.5px]">Shift confirmed successfully</span>
              <span className="text-[10px] font-mono text-paper/50 ml-2">Mercy · ICU · 19:00</span>
              <button className="text-[10px] font-mono text-paper/60 ml-1 hover:text-paper">undo</button>
            </div>
            {/* Info */}
            <div className="rounded-full bg-ink-900 text-paper px-4 py-2.5 inline-flex items-center gap-2.5 max-w-fit shadow-lifted">
              <span className="w-5 h-5 rounded-full bg-sky-400 inline-flex items-center justify-center"><Icon name="info" className="w-3 h-3 text-ink-900" /></span>
              <span className="text-[12.5px]">Match engine running for 2 open ICU slots</span>
              <span className="text-[10px] font-mono text-paper/50 ml-2">REQ-2849</span>
            </div>
            {/* Warning */}
            <div className="rounded-full bg-amber-600 text-white px-4 py-2.5 inline-flex items-center gap-2.5 max-w-fit shadow-lifted">
              <Icon name="alert-triangle" className="w-3.5 h-3.5" />
              <span className="text-[12.5px] font-medium">Credential expires tomorrow</span>
              <span className="text-[10px] font-mono text-white/70 ml-2">Hep B · upload</span>
              <button className="text-[10px] font-mono text-white/80 ml-1 underline">Upload</button>
            </div>
            {/* Critical */}
            <div className="rounded-full bg-rose-600 text-white px-4 py-2.5 inline-flex items-center gap-2.5 max-w-fit shadow-lifted urgent-pulse">
              <span className="relative inline-flex"><span className="absolute inset-0 rounded-full bg-white/40 ping-slow" /><span className="relative w-5 h-5 rounded-full bg-white text-rose-700 inline-flex items-center justify-center"><Icon name="alert-octagon" className="w-3 h-3" /></span></span>
              <span className="text-[12.5px] font-medium">Urgent replacement required · REQ-2851</span>
              <button className="text-[11px] font-medium text-white underline ml-1">Open</button>
            </div>
            {/* Loading / progress */}
            <div className="rounded-full bg-ink-900 text-paper px-4 py-2.5 inline-flex items-center gap-2.5 max-w-fit shadow-lifted">
              <span className="w-5 h-5 rounded-full inline-flex items-center justify-center">
                <svg className="animate-spin w-4 h-4 text-teal-400" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity=".25" strokeWidth="2"/><path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <span className="text-[12.5px]">Broadcasting to 22 RNs…</span>
              <span className="text-[10px] font-mono text-paper/50 ml-2">est. 4-7s</span>
            </div>

            {/* Stacked toasts */}
            <div className="pt-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Stacked · most recent on top</div>
              <div className="space-y-1.5">
                <div className="rounded-2xl bg-ink-900 text-paper px-4 py-2.5 shadow-lifted flex items-center gap-2.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[12.5px]">Aria Martinez confirmed</span><span className="ml-auto text-[10px] font-mono text-paper/50">just now</span>
                </div>
                <div className="rounded-2xl bg-ink-800 text-paper px-4 py-2 shadow-lifted flex items-center gap-2.5 mx-3 opacity-90">
                  <Icon name="user-plus" className="w-3.5 h-3.5 text-teal-300" /><span className="text-[12px]">Devon Carter checked in</span><span className="ml-auto text-[10px] font-mono text-paper/50">2m</span>
                </div>
                <div className="rounded-2xl bg-ink-700 text-paper px-4 py-1.5 shadow-lifted flex items-center gap-2.5 mx-6 opacity-75">
                  <Icon name="bell" className="w-3 h-3 text-teal-300" /><span className="text-[11px]">Reminder sent · 4 RNs</span><span className="ml-auto text-[9px] font-mono text-paper/50">5m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banners column */}
        <div className="col-span-5 space-y-3">
          {/* Critical banner */}
          <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 flex items-start gap-3 urgent-pulse">
            <span className="relative inline-flex shrink-0"><span className="absolute inset-0 rounded-full bg-rose-300 ping-slow" /><span className="relative w-9 h-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center"><Icon name="siren" className="w-4 h-4" /></span></span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-rose-700">Critical · system-wide</div>
              <div className="text-[14px] font-medium tracking-tight text-rose-900 mt-0.5">3 critical alerts open · directors paged</div>
              <div className="text-[11.5px] text-rose-700 mt-0.5">Last update 18s ago · INC-0411</div>
              <div className="mt-2 inline-flex items-center gap-1.5"><button className="h-7 px-3 rounded-md bg-rose-600 text-white text-[11px] font-medium">Open command view</button><button className="h-7 px-3 rounded-md border border-rose-300 bg-white text-rose-700 text-[11px]">Acknowledge</button></div>
            </div>
            <button className="text-rose-500 hover:text-rose-700"><Icon name="x" className="w-3.5 h-3.5" /></button>
          </div>

          {/* Warning banner */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-amber-200 text-amber-800 inline-flex items-center justify-center shrink-0"><Icon name="alert-triangle" className="w-4 h-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-amber-800">Compliance warning</div>
              <div className="text-[14px] font-medium tracking-tight text-amber-900 mt-0.5">12 credentials expiring in next 30 days</div>
              <div className="text-[11.5px] text-amber-700 mt-0.5">Auto-suspension begins Apr 14 · resolve in bulk</div>
              <button className="mt-2 text-[11px] font-medium text-amber-800 inline-flex items-center gap-1 underline">Resolve in compliance hub <Icon name="arrow-right" className="w-3 h-3" /></button>
            </div>
            <button className="text-amber-600 hover:text-amber-800"><Icon name="x" className="w-3.5 h-3.5" /></button>
          </div>

          {/* Success banner */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-800 inline-flex items-center justify-center shrink-0"><Icon name="check-circle-2" className="w-4 h-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-800">Confirmation received</div>
              <div className="text-[14px] font-medium tracking-tight text-emerald-900 mt-0.5">All 4 Wed Med-Surg RNs confirmed</div>
              <div className="text-[11.5px] text-emerald-700 mt-0.5">Briefings auto-sent · coordinator notified</div>
            </div>
          </div>

          {/* Inline status bar / sticky */}
          <div className="rounded-xl bg-ink-900 text-paper p-3.5 flex items-center gap-3">
            <span className="relative inline-flex"><Dot tone="green" pulse /></span>
            <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">Live operations connected</div><div className="text-[10.5px] font-mono text-paper/60">14 facilities · 480 pros · last sync 2s ago</div></div>
            <span className="text-[10px] font-mono text-paper/50">v4.12.3</span>
          </div>

          {/* Maintenance banner */}
          <div className="rounded-xl bg-ink-100 border border-ink-200 p-3.5 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white inline-flex items-center justify-center"><Icon name="wrench" className="w-4 h-4 text-ink-700" /></span>
            <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium tracking-tight">Scheduled maintenance · Sat 02:00 — 04:00 PT</div><div className="text-[11px] text-ink-600">Push notifications will be queued during window</div></div>
            <button className="h-7 px-3 rounded-md border border-ink-300 bg-white text-[11px]">Details</button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-5 rounded-xl bg-white border border-ink-200 p-4 grid grid-cols-4 gap-5">
        {[
          { l:"Info",     k:"sky",      d:"Operational status · non-blocking",  ic:"info" },
          { l:"Success",  k:"emerald",  d:"Action completed · auto-dismiss",    ic:"check-circle-2" },
          { l:"Warning",  k:"amber",    d:"Action recommended · stays sticky",  ic:"alert-triangle" },
          { l:"Critical", k:"rose",     d:"Action required now · pulses",       ic:"alert-octagon" },
        ].map((p:any) => (
          <div key={p.l} className="flex items-start gap-2.5">
            <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center bg-${p.k}-50 text-${p.k}-700 shrink-0`}><Icon name={p.ic} className="w-3.5 h-3.5" /></span>
            <div><div className="text-[12px] font-medium tracking-tight">{p.l}</div><div className="text-[10.5px] text-ink-600 leading-snug">{p.d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Root — design canvas of all 8 experiences
// ═══════════════════════════════════════════════════════
export function NotificationsApp() {
  const sections = [
    { id:"hub",     title:"Notification hub & live alerts", subtitle:"Operational alert center + real-time dashboard",
      boards: [
        { id:"s1",  label:"01 · Global notification center", w:1280, h:920, cmp:<S1_NotificationCenter /> },
        { id:"s2",  label:"02 · Real-time operational alerts", w:1280, h:840, cmp:<S2_LiveAlerts /> },
      ]
    },
    { id:"flows",   title:"Time-sensitive flows", subtitle:"Reminders, cancellations, compliance, urgency",
      boards: [
        { id:"s3a", label:"03 · Push (lock screen)", w:402,  h:874, cmp:<MobileLockPush /> },
        { id:"s3b", label:"03 · SMS / iMessage",     w:402,  h:874, cmp:<SMSPreview /> },
        { id:"s3c", label:"03 · In-app reminders",   w:402,  h:874, cmp:<InAppReminder /> },
      ]
    },
    { id:"critical", title:"Critical alerts", subtitle:"Cancellation handling and urgent staffing coverage",
      boards: [
        { id:"s4",  label:"04 · Cancellation alert", w:1100, h:820, cmp:<S4_Cancellation /> },
        { id:"s6",  label:"06 · Urgent staffing alert", w:1280, h:820, cmp:<S6_UrgentStaffing /> },
      ]
    },
    { id:"compliance", title:"Compliance & system patterns", subtitle:"Workforce credentials, mobile UX, toasts & banners",
      boards: [
        { id:"s5",  label:"05 · Compliance alerts", w:1280, h:820, cmp:<S5_Compliance /> },
        { id:"s7a", label:"07 · Mobile drawer (swipe)", w:402,  h:874, cmp:<MobileDrawer /> },
        { id:"s7b", label:"07 · Mobile toasts & inline", w:402, h:874, cmp:<MobileToast /> },
        { id:"s8",  label:"08 · Toasts & banners", w:1100, h:920, cmp:<S8_Toasts /> },
      ]
    },
  ];

  return (
    <DesignCanvas>
      {sections.map(sec => (
        <DCSection key={sec.id} id={sec.id} title={sec.title} subtitle={sec.subtitle}>
          {sec.boards.map(b => (
            <DCArtboard key={b.id} id={b.id} label={b.label} width={b.w} height={b.h}>
              {b.cmp}
            </DCArtboard>
          ))}
        </DCSection>
      ))}
    </DesignCanvas>
  );
}
