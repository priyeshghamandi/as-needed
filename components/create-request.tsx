"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, Dot, Avatar, Badge } from "@/components/primitives";

// ───────────── Mock data ─────────────
const FACILITIES = [
  { id:"mercy",     name:"Mercy Mt. Sinai",      type:"Acute care · 320 beds", city:"San Francisco", units:["ICU","Step-down","ER","Med-Surg 4N","Med-Surg 4S","PACU"] },
  { id:"green",     name:"Green Valley Hospital",type:"Acute care · 180 beds", city:"Oakland",        units:["ICU","ER","Med-Surg","Telemetry"] },
  { id:"bayview",   name:"Bayview Care",         type:"Long-term acute",       city:"San Mateo",      units:["Med-Surg","Telemetry","Rehab"] },
  { id:"carebridge",name:"CareBridge Nursing Center", type:"SNF · 120 beds",   city:"San Jose",       units:["Floor 1","Floor 2","Memory care"] },
  { id:"sunrise",   name:"Sunrise Assisted Living",  type:"Assisted living",   city:"Berkeley",       units:["West wing","East wing"] },
  { id:"pinegrove", name:"Pinegrove SNF",        type:"SNF · 96 beds",         city:"Santa Clara",    units:["Floor 1","Floor 2"] },
  { id:"northridge",name:"Northridge Health",    type:"Acute care · 240 beds", city:"Daly City",      units:["ICU","ER","OR","Med-Surg"] },
];
const ROLES = [
  { id:"RN",  label:"RN",  sub:"Registered Nurse",     icon:"stethoscope" },
  { id:"LPN", label:"LPN", sub:"Licensed Practical",   icon:"clipboard-list" },
  { id:"CNA", label:"CNA", sub:"Certified Nursing Aide",icon:"user-round" },
  { id:"EMT", label:"EMT", sub:"Emergency Medical",    icon:"ambulance" },
];
const SPECIALTIES = ["ICU","ER","Med-Surg","Telemetry","Pediatrics","Oncology","L&D","PACU","Cath Lab","Rehab","Psych","Hospice"];
const COORDS = [
  { id:"LM", name:"Lena Mahoney",  load:"6 reqs", t:"teal"   },
  { id:"RT", name:"Ravi Tan",      load:"4 reqs", t:"violet" },
  { id:"EV", name:"Elena Vargas",  load:"5 reqs", t:"amber"  },
  { id:"JP", name:"Jordan Park",   load:"3 reqs", t:"rose"   },
];
const CERTS = [
  { id:"rn-license", label:"RN License",        sub:"State-verified" },
  { id:"cpr",        label:"CPR",               sub:"American Heart" },
  { id:"acls",       label:"ACLS",              sub:"Advanced cardiac" },
  { id:"bls",        label:"BLS",               sub:"Basic life support" },
  { id:"bg-check",   label:"Background check",  sub:"7-year scope" },
  { id:"vax",        label:"Vaccination records",sub:"Flu · Hep B · TB" },
  { id:"covid",      label:"COVID-19",          sub:"Up to date" },
];
const PRIORITIES = [
  { id:"Normal",   label:"Normal",                 sub:"Standard turnaround", icon:"circle",        cls:"border-ink-200 bg-white",        accent:"bg-ink-100 text-ink-700" },
  { id:"High",     label:"High priority",          sub:"Within 6 hours",      icon:"trending-up",   cls:"border-amber-200 bg-amber-50/30",accent:"bg-amber-100 text-amber-800" },
  { id:"Critical", label:"Critical · immediate",    sub:"Coverage gap now",    icon:"flame",         cls:"border-rose-300 bg-rose-50/30",  accent:"bg-rose-700 text-white" },
];

const STEPS = [
  { id:1, label:"Facility & need",    sub:"Where & what" },
  { id:2, label:"Shift",              sub:"When"          },
  { id:3, label:"Requirements",       sub:"Who qualifies" },
  { id:4, label:"Coordination",       sub:"Internal"      },
  { id:5, label:"Review",             sub:"Confirm"       },
];

// ───────────── Inputs ─────────────
function Label({ children, hint, required }: any) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-[11px] font-mono uppercase tracking-wider text-ink-600">
        {children}{required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10px] font-mono text-ink-400">{hint}</span>}
    </div>
  );
}
function Help({ children }: any) {
  return <div className="mt-1 text-[11px] text-ink-500 leading-snug">{children}</div>;
}
function TextField({ value, onChange, placeholder, mono }: any) {
  return <input value={value ?? ""} onChange={(e:any)=>onChange(e.target.value)} placeholder={placeholder} className={`w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${mono ? "font-mono" : ""}`} />;
}
function Toggle({ on, onChange, label, sub }: any) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border border-ink-200 bg-white hover:border-ink-400 text-left">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium tracking-tight">{label}</div>
        {sub && <div className="text-[11px] font-mono text-ink-500 mt-0.5">{sub}</div>}
      </div>
      <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${on ? "bg-teal-700" : "bg-ink-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
function Stepper({ value, min = 1, max = 20, onChange }: any) {
  return (
    <div className="inline-flex items-center rounded-md border border-ink-200 bg-white">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-9 h-10 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="minus" className="w-3.5 h-3.5" /></button>
      <input value={value} onChange={(e:any) => onChange(Math.max(min, Math.min(max, Number(e.target.value)||min)))} className="w-12 h-10 text-center text-[14px] font-mono tabular-nums border-x border-ink-200 outline-none" />
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-9 h-10 inline-flex items-center justify-center hover:bg-ink-50"><Icon name="plus" className="w-3.5 h-3.5" /></button>
    </div>
  );
}
function Combobox({ items, value, onChange, placeholder, render, footer }: any) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = items.find((i:any) => i.id === value);
  const filtered = items.filter((i:any) => (i.name + (i.type ?? "") + (i.city ?? "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-left text-[13px] flex items-center gap-2 hover:border-ink-400">
        {selected ? render(selected) : <span className="text-ink-400">{placeholder}</span>}
        <Icon name="chevron-down" className="w-3.5 h-3.5 text-ink-400 ml-auto" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 w-full rounded-lg border border-ink-200 bg-white shadow-lifted overflow-hidden">
            <div className="px-2.5 py-2 border-b border-ink-100 flex items-center gap-2">
              <Icon name="search" className="w-3.5 h-3.5 text-ink-400" />
              <input autoFocus value={q} onChange={(e:any)=>setQ(e.target.value)} placeholder="Search…" className="flex-1 text-[13px] outline-none" />
            </div>
            <div className="max-h-64 overflow-y-auto scrollarea">
              {filtered.map((i:any) => (
                <button key={i.id} onClick={() => { onChange(i.id); setOpen(false); setQ(""); }} className={`w-full text-left px-3 py-2 hover:bg-ink-50 flex items-start gap-2 ${value === i.id ? "bg-teal-50/40" : ""}`}>
                  <div className="flex-1">{render(i)}</div>
                  {value === i.id && <Icon name="check" className="w-3.5 h-3.5 text-teal-700 mt-1" />}
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-[12px] text-ink-500">No matches</div>}
            </div>
            {footer && <div className="border-t border-ink-100">{footer}</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ───────────── Step content ─────────────
function StepFacility({ s, set }: any) {
  const facility = FACILITIES.find(f => f.id === s.facility);
  return (
    <div className="space-y-5">
      <div>
        <Label required hint="searchable">Facility</Label>
        <Combobox
          items={FACILITIES}
          value={s.facility}
          onChange={(id:string) => set({ facility: id, unit: undefined })}
          placeholder="Select facility…"
          render={(f:any) => (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-600 shrink-0"><Icon name="building-2" className="w-3.5 h-3.5" /></span>
              <div className="min-w-0">
                <div className="text-[13px] font-medium tracking-tight truncate">{f.name}</div>
                <div className="text-[10px] font-mono text-ink-500 truncate">{f.type} · {f.city}</div>
              </div>
            </div>
          )}
          footer={
            <button className="w-full px-3 py-2.5 text-left text-[12px] font-medium text-teal-700 hover:bg-teal-50 inline-flex items-center gap-2"><Icon name="plus" className="w-3.5 h-3.5" /> Quick-add new facility</button>
          }
        />
        <Help>Connected to your facility roster · escalation contacts auto-populate at create.</Help>
      </div>

      <div>
        <Label required>Unit / department</Label>
        {facility ? (
          <div className="flex flex-wrap gap-1.5">
            {facility.units.map((u:string) => (
              <button key={u} onClick={() => set({ unit: u })} className={`h-9 px-3 rounded-md border text-[12px] tracking-tight ${s.unit === u ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{u}</button>
            ))}
            <button className="h-9 px-3 rounded-md border border-dashed border-ink-300 text-[12px] text-ink-500 hover:border-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5" /> other</button>
          </div>
        ) : (
          <div className="text-[12px] text-ink-400 font-mono italic">Select a facility to see units</div>
        )}
      </div>

      <div>
        <Label required>Role needed</Label>
        <div className="grid grid-cols-4 gap-2">
          {ROLES.map(r => (
            <button key={r.id} onClick={() => set({ role: r.id })} className={`relative px-3 py-3 rounded-lg border text-left transition-colors ${s.role === r.id ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-600" : "border-ink-200 bg-white hover:border-ink-400"}`}>
              <Icon name={r.icon} className={`w-4 h-4 ${s.role === r.id ? "text-teal-700" : "text-ink-500"}`} />
              <div className="mt-1.5 text-[14px] font-medium tracking-tight">{r.label}</div>
              <div className="text-[10px] font-mono text-ink-500">{r.sub}</div>
              {s.role === r.id && <Icon name="check" className="w-3.5 h-3.5 text-teal-700 absolute top-2 right-2" />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Specialty</Label>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTIES.map(sp => (
              <button key={sp} onClick={() => set({ specialty: sp })} className={`h-7 px-2.5 rounded-full border text-[11px] font-mono ${s.specialty === sp ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{sp}</button>
            ))}
          </div>
        </div>
        <div>
          <Label required>Professionals required</Label>
          <div className="flex items-center gap-3">
            <Stepper value={s.count} onChange={(v:number) => set({ count: v })} />
            <div className="text-[11px] font-mono text-ink-500">{s.count === 1 ? "1 slot" : `${s.count} slots will be opened`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShift({ s, set }: any) {
  const dur = useMemo(() => {
    if (!s.start || !s.end) return null;
    const [sh,sm] = s.start.split(":").map(Number);
    const [eh,em] = s.end.split(":").map(Number);
    let mins = (eh*60+em) - (sh*60+sm);
    if (mins <= 0) mins += 24*60;
    return mins;
  }, [s.start, s.end]);
  const totalH = dur ? (dur/60).toFixed(2) : null;
  const breakH = (s.breakMin ?? 30) / 60;
  const billableH = totalH ? (Number(totalH) - breakH).toFixed(2) : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <Label required>Shift date</Label>
          <div className="relative">
            <input type="date" value={s.date} onChange={(e:any) => set({ date: e.target.value })} className="w-full h-10 px-3 pr-9 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            <Icon name="calendar" className="w-4 h-4 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <Label required>Start</Label>
          <input type="time" value={s.start} onChange={(e:any) => set({ start: e.target.value })} className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div>
          <Label required>End</Label>
          <input type="time" value={s.end} onChange={(e:any) => set({ end: e.target.value })} className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
      </div>

      {/* Duration banner */}
      <div className="rounded-lg border border-ink-200 bg-paper/50 px-4 py-3 flex items-center gap-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Shift duration</div>
          <div className="text-[20px] font-medium tabular-nums tracking-tight">{totalH ? `${totalH} h` : "—"}</div>
        </div>
        <div className="w-px self-stretch bg-ink-200" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Break</div>
          <div className="text-[20px] font-medium tabular-nums tracking-tight">{(s.breakMin ?? 30)} m</div>
        </div>
        <div className="w-px self-stretch bg-ink-200" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Billable</div>
          <div className="text-[20px] font-medium tabular-nums tracking-tight text-teal-800">{billableH ? `${billableH} h` : "—"}</div>
        </div>
        <div className="ml-auto text-[11px] font-mono text-ink-500 max-w-[180px] text-right leading-snug">Auto-calculated · used to compute pay & shift offers</div>
      </div>

      <div>
        <Label required>Shift type</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id:"Day",     icon:"sun",    sub:"~07–19" },
            { id:"Night",   icon:"moon",   sub:"~19–07" },
            { id:"Weekend", icon:"calendar", sub:"Sat / Sun" },
            { id:"On-call", icon:"bell",   sub:"Page-in" },
          ].map(t => (
            <button key={t.id} onClick={() => set({ shiftType: t.id })} className={`px-3 py-3 rounded-lg border text-left ${s.shiftType === t.id ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-600" : "border-ink-200 bg-white hover:border-ink-400"}`}>
              <Icon name={t.icon} className={`w-4 h-4 ${s.shiftType === t.id ? "text-teal-700" : "text-ink-500"}`} />
              <div className="mt-1.5 text-[13px] font-medium tracking-tight">{t.id}</div>
              <div className="text-[10px] font-mono text-ink-500">{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Break duration</Label>
          <div className="flex items-center gap-1.5">
            {[0,15,30,45,60].map(m => (
              <button key={m} onClick={() => set({ breakMin: m })} className={`h-9 px-3 rounded-md border text-[12px] font-mono ${(s.breakMin ?? 30) === m ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{m}m</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Recurring shift</Label>
          <Toggle on={!!s.recurring} onChange={(v:boolean) => set({ recurring: v })} label={s.recurring ? "Repeats weekly · same days" : "One-time shift"} sub={s.recurring ? "Adjust pattern after creation" : "Toggle to repeat"} />
        </div>
      </div>
    </div>
  );
}

function StepRequirements({ s, set }: any) {
  const certs = new Set(s.certs ?? ["rn-license","cpr"]);
  const toggle = (id:string) => {
    const n = new Set(certs);
    if (n.has(id)) n.delete(id); else n.add(id);
    set({ certs: Array.from(n) });
  };
  return (
    <div className="space-y-5">
      <div>
        <Label required>Priority level</Label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map(p => (
            <button key={p.id} onClick={() => set({ priority: p.id })} className={`relative px-4 py-3.5 rounded-lg border text-left ${s.priority === p.id ? "ring-2 ring-offset-1 ring-teal-600" : ""} ${p.cls} ${s.priority === p.id ? "" : "hover:border-ink-400"}`}>
              <div className="flex items-center gap-2">
                <Icon name={p.icon} className={`w-4 h-4 ${p.id === "Critical" ? "text-rose-700" : p.id === "High" ? "text-amber-700" : "text-ink-600"}`} />
                <span className={`text-[10px] font-mono px-1.5 h-4 inline-flex items-center rounded ${p.accent}`}>{p.id}</span>
              </div>
              <div className="mt-2 text-[14px] font-medium tracking-tight">{p.label}</div>
              <div className="text-[11px] font-mono text-ink-500">{p.sub}</div>
              {s.priority === p.id && <Icon name="check" className="w-3.5 h-3.5 text-teal-700 absolute top-2 right-2" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label required hint={`${certs.size} required`}>Required certifications</Label>
        <div className="grid grid-cols-2 gap-2">
          {CERTS.map(c => {
            const on = certs.has(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left ${on ? "border-teal-600 bg-teal-50/40" : "border-ink-200 bg-white hover:border-ink-400"}`}>
                <span className={`w-5 h-5 rounded inline-flex items-center justify-center mt-0.5 shrink-0 ${on ? "bg-teal-700 text-white" : "bg-paper border border-ink-200 text-transparent"}`}><Icon name="check" className="w-3 h-3" strokeWidth={3} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium tracking-tight">{c.label}</div>
                  <div className="text-[11px] font-mono text-ink-500">{c.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
        <Help>Compliance gating · only RNs meeting all selected creds will appear in matches.</Help>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Minimum years experience</Label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[0,1,2,3,5,7,10].map(y => (
              <button key={y} onClick={() => set({ minYears: y })} className={`h-9 px-3 rounded-md border text-[12px] font-mono ${(s.minYears ?? 2) === y ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{y === 0 ? "Any" : `${y}+ yr`}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Specialty experience</Label>
          <Toggle on={!!s.specExp} onChange={(v:boolean) => set({ specExp: v })} label={`Require ${s.specialty ?? "specialty"} experience`} sub="Limits matches to RNs with prior unit-specific shifts" />
        </div>
      </div>

      <div>
        <Label>Facility-specific requirements</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(s.facReqs ?? ["Cerner cleared","Mercy badge"]).map((t:string, i:number) => (
            <span key={i} className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-ink-900 text-paper text-[11px] font-mono">
              {t}
              <button onClick={() => set({ facReqs: (s.facReqs ?? ["Cerner cleared","Mercy badge"]).filter((_:any,j:number) => j !== i) })} className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-paper/20"><Icon name="x" className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
        <input placeholder="Add a requirement and press Enter" onKeyDown={(e:any) => { if (e.key === "Enter" && e.target.value) { set({ facReqs: [...(s.facReqs ?? ["Cerner cleared","Mercy badge"]), e.target.value] }); e.target.value = ""; } }} className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </div>
    </div>
  );
}

function StepCoordination({ s, set }: any) {
  return (
    <div className="space-y-5">
      <div>
        <Label required>Assigned coordinator</Label>
        <div className="grid grid-cols-2 gap-2">
          {COORDS.map(c => (
            <button key={c.id} onClick={() => set({ coord: c.id })} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left ${s.coord === c.id ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-600" : "border-ink-200 bg-white hover:border-ink-400"}`}>
              <Avatar initials={c.id} tone={c.t as any} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium tracking-tight">{c.name}</div>
                <div className="text-[11px] font-mono text-ink-500">Active load · {c.load}</div>
              </div>
              {s.coord === c.id && <Icon name="check" className="w-3.5 h-3.5 text-teal-700" />}
            </button>
          ))}
        </div>
        <Help>Auto-suggested based on facility ownership and current load.</Help>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Internal notes</Label>
          <textarea value={s.notes ?? ""} onChange={(e:any) => set({ notes: e.target.value })} rows={4} placeholder="Notes for the coordination team only…" className="w-full p-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
        </div>
        <div>
          <Label>Facility instructions</Label>
          <textarea value={s.facNotes ?? ""} onChange={(e:any) => set({ facNotes: e.target.value })} rows={4} placeholder="Visible to assigned RNs · check-in, parking, contacts…" className="w-full p-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
        </div>
      </div>

      <div>
        <Label>Automation</Label>
        <div className="space-y-2">
          <Toggle on={s.autoSuggest !== false} onChange={(v:boolean) => set({ autoSuggest: v })} label="Auto-suggest professionals" sub="Run match engine the moment this request is created · ranks top candidates" />
          <Toggle on={!!s.broadcast} onChange={(v:boolean) => set({ broadcast: v })} label="Broadcast shift immediately" sub="Push to all eligible RNs · first-to-accept rules apply" />
          <Toggle on={s.notify !== false} onChange={(v:boolean) => set({ notify: v })} label="Notify available RNs" sub="SMS + push to RNs marked available for this shift window" />
        </div>
      </div>
    </div>
  );
}

function StepReview({ s }: any) {
  const facility = FACILITIES.find(f => f.id === s.facility);
  const coord = COORDS.find(c => c.id === s.coord);
  const certs = (s.certs ?? ["rn-license","cpr"]).map((id:string) => CERTS.find(c => c.id === id)?.label).filter(Boolean);
  const dur = useMemo(() => {
    if (!s.start || !s.end) return null;
    const [sh,sm] = s.start.split(":").map(Number);
    const [eh,em] = s.end.split(":").map(Number);
    let mins = (eh*60+em) - (sh*60+sm);
    if (mins <= 0) mins += 24*60;
    return (mins/60).toFixed(1);
  }, [s.start, s.end]);
  const dateStr = s.date ? new Date(s.date + "T00:00").toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" }) : "—";
  const priority = PRIORITIES.find(p => p.id === s.priority);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100 bg-paper/40">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Draft preview</div>
          <div className="mt-1 text-[20px] leading-tight tracking-[-0.01em] font-medium">
            {s.count} {s.role ?? "—"} · {s.specialty ?? "—"} <span className="font-serif italic text-teal-800">at {facility?.name ?? "—"}</span>
          </div>
          <div className="mt-1 text-[12px] font-mono text-ink-600">{dateStr} · {s.start ?? "—"}–{s.end ?? "—"} · {dur ? `${dur} h` : "—"} · {s.unit ?? "unit —"}</div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${priority?.accent ?? "bg-ink-100 text-ink-700"}`}>{s.priority ?? "Normal"}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-600 px-1.5 h-5 rounded bg-ink-100">{s.shiftType ?? "Day"} shift</span>
            {s.recurring && <span className="inline-flex items-center gap-1 text-[10px] font-mono text-teal-700 px-1.5 h-5 rounded bg-teal-50">recurring weekly</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-ink-100">
          <ReviewCell icon="building-2" label="Facility"      value={facility?.name ?? "—"}     sub={facility?.type} />
          <ReviewCell icon="map-pin"    label="Unit"           value={s.unit ?? "—"}              sub={facility?.city} />
          <ReviewCell icon="stethoscope" label="Role · spec"   value={`${s.role ?? "—"} · ${s.specialty ?? "—"}`} sub={`${s.minYears ?? 2}+ yrs experience`} />
          <ReviewCell icon="users"      label="Professionals"  value={`${s.count} required`}      sub={`${s.broadcast ? "broadcast on create" : "matched in queue"}`} />
          <ReviewCell icon="clock"      label="Shift timing"   value={`${dateStr} · ${s.start ?? "—"}–${s.end ?? "—"}`} sub={dur ? `${dur} h · break ${(s.breakMin ?? 30)}m` : ""} />
          <ReviewCell icon="shield-check" label="Compliance"   value={`${certs.length} required`} sub={certs.join(" · ")} />
          <ReviewCell icon="user"       label="Coordinator"    value={coord?.name ?? "—"}         sub={coord ? `Active load · ${coord.load}` : ""} />
          <ReviewCell icon="zap"        label="On creation"    value={[s.autoSuggest !== false && "auto-match", s.broadcast && "broadcast", s.notify !== false && "notify available"].filter(Boolean).join(" · ") || "—"} sub="Runs the moment you confirm" />
        </div>
      </div>
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4 flex items-start gap-3">
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center shrink-0"><Icon name="wand-2" className="w-3.5 h-3.5" /></span>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium tracking-tight text-teal-900">Match engine ready</div>
          <div className="text-[11px] font-mono text-teal-800/80">7 RNs in catchment match {s.specialty ?? "specialty"} · 5 cleared compliance · {s.broadcast ? "broadcast will fire" : "queued for coordinator"} · est. time-to-fill <span className="font-medium">~12m</span></div>
        </div>
      </div>
    </div>
  );
}
function ReviewCell({ icon, label, value, sub }: any) {
  return (
    <div className="px-5 py-3 border-b border-ink-100 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <span className="w-7 h-7 rounded-md bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-500 shrink-0 mt-0.5"><Icon name={icon} className="w-3.5 h-3.5" /></span>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
          <div className="text-[13px] font-medium tracking-tight">{value}</div>
          {sub && <div className="text-[11px] font-mono text-ink-500 truncate">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ───────────── Success ─────────────
function SuccessSheet({ s, onClose, onOpen }: any) {
  const facility = FACILITIES.find(f => f.id === s.facility);
  const coord = COORDS.find(c => c.id === s.coord);
  const id = "REQ-2849";
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-10 pb-6 bg-gradient-to-b from-teal-50/60 to-transparent border-b border-ink-100">
        <div className="relative w-14 h-14 rounded-full bg-teal-700 text-white inline-flex items-center justify-center mb-4">
          <span className="absolute inset-0 rounded-full bg-teal-500/40 ping-slow" />
          <Icon name="check" className="w-6 h-6 relative" strokeWidth={3} />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800">{id} · created</div>
        <h2 className="mt-1 text-[24px] leading-tight tracking-[-0.01em] font-medium">
          Staffing request created.<span className="font-serif italic text-teal-800"> Matching is running.</span>
        </h2>
        <div className="mt-2 text-[13px] font-mono text-ink-700">{s.count} {s.role} · {s.specialty} · {facility?.name} · {s.start}–{s.end}</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollarea">
        <div className="rounded-lg border border-ink-200 bg-white">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
            <Dot tone="green" pulse />
            <div className="text-[12px] font-medium tracking-tight">Matching workflow started</div>
            <span className="ml-auto text-[10px] font-mono text-ink-500">live</span>
          </div>
          <ol className="px-4 py-3 space-y-2.5">
            {[
              { l:"Coordinator assigned", v:coord?.name, done:true },
              { l:"Catchment scanned",    v:"7 RNs in range",        done:true },
              { l:"Compliance gate",      v:"5 RNs cleared",         done:true },
              { l:"Top matches ranked",   v:"awaiting outreach",     active:true },
              { l:"Confirmations",        v:"pending RN response",   pending:true },
            ].map((x:any, i:number) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-mono ${x.done ? "bg-teal-700 text-white" : x.active ? "bg-ink-900 text-paper" : "bg-white border border-ink-200 text-ink-400"}`}>{x.done ? <Icon name="check" className="w-2.5 h-2.5" strokeWidth={3} /> : i + 1}</span>
                <div className="flex-1 text-[12px] tracking-tight">{x.l}</div>
                <div className={`text-[11px] font-mono ${x.active ? "text-ink-900" : "text-ink-500"}`}>{x.v}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
            <Icon name="wand-2" className="w-3.5 h-3.5 text-teal-700" />
            <div className="text-[12px] font-medium tracking-tight">Top suggested professionals</div>
            <span className="ml-auto text-[10px] font-mono text-teal-700">5 matches</span>
          </div>
          <div className="divide-y divide-ink-100">
            {[
              { i:"AM", t:"teal",   n:"Aria Martinez", spec:`RN · ${s.specialty}`, dist:"3.2 mi", rel:97 },
              { i:"DC", t:"amber",  n:"Devon Carter",  spec:`RN · ${s.specialty}`, dist:"7.0 mi", rel:96 },
              { i:"SN", t:"violet", n:"Sayuri Nguyen", spec:`RN · ${s.specialty}`, dist:"4.8 mi", rel:94 },
            ].map((p:any, i:number) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <Avatar initials={p.i} tone={p.t} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium tracking-tight truncate">{p.n}</div>
                  <div className="text-[10px] font-mono text-ink-500">{p.spec} · {p.dist}</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 h-4 rounded bg-teal-50 text-teal-700 inline-flex items-center">match {p.rel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-200 bg-paper/60 px-8 py-4 flex items-center gap-2">
        <button onClick={onClose} className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] hover:bg-ink-50">Back to queue</button>
        <button onClick={onOpen} className="ml-auto inline-flex items-center gap-2 h-10 px-5 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800">Open request <Icon name="arrow-right" className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ───────────── Sheet ─────────────
export function CreateRequestSheet({ open, onClose, onCreated }: any) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [s, setS] = useState<any>({ count: 2, breakMin: 30, shiftType:"Night", priority:"High", certs:["rn-license","cpr","bls"], minYears: 2, specExp: true, autoSuggest: true, notify: true, broadcast: false, facReqs:["Cerner cleared","Mercy badge"], date: new Date(Date.now()+86400000).toISOString().slice(0,10), start:"19:00", end:"07:00", facility:"mercy", unit:"ICU", role:"RN", specialty:"ICU", coord:"LM" });
  const set = (patch: any) => setS({ ...s, ...patch });

  useEffect(() => { if (!open) { setStep(1); setDone(false); } }, [open]);
  useEffect(() => {
    function onKey(e: any) { if (e.key === "Escape" && open) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const valid: Record<number, boolean> = {
    1: !!(s.facility && s.unit && s.role && s.specialty && s.count),
    2: !!(s.date && s.start && s.end && s.shiftType),
    3: !!(s.priority && (s.certs ?? []).length),
    4: !!s.coord,
    5: true,
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[760px] max-w-[96vw] bg-paper shadow-2xl flex flex-col rise-in">
        {done ? (
          <SuccessSheet s={s} onClose={onClose} onOpen={() => { onCreated?.(s); onClose(); }} />
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-ink-200 bg-paper">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Operations · new</div>
                  <h2 className="mt-1 text-[22px] leading-tight tracking-[-0.01em] font-medium">
                    Create staffing request<span className="font-serif italic text-teal-800"> · {STEPS[step-1].sub.toLowerCase()}.</span>
                  </h2>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="x" className="w-4 h-4" /></button>
              </div>
              {/* Step indicator */}
              <div className="mt-5 grid grid-cols-5 gap-2">
                {STEPS.map(st => {
                  const active = st.id === step, doneStep = st.id < step;
                  return (
                    <button key={st.id} onClick={() => st.id < step && setStep(st.id)} className="flex flex-col gap-1.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-mono ${doneStep ? "bg-teal-700 text-white" : active ? "bg-ink-900 text-paper" : "bg-white border border-ink-200 text-ink-400"}`}>
                          {doneStep ? <Icon name="check" className="w-2.5 h-2.5" strokeWidth={3} /> : st.id}
                        </span>
                        <span className={`flex-1 h-0.5 rounded-full ${doneStep ? "bg-teal-700" : active ? "bg-ink-900" : "bg-ink-200"}`} />
                      </div>
                      <div>
                        <div className={`text-[12px] tracking-tight ${active ? "text-ink-900 font-medium" : doneStep ? "text-ink-700" : "text-ink-400"}`}>{st.label}</div>
                        <div className={`text-[10px] font-mono ${active ? "text-teal-800" : "text-ink-400"}`}>{st.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollarea px-8 py-6">
              <div key={step} className="rise-in">
                {step === 1 && <StepFacility s={s} set={set} />}
                {step === 2 && <StepShift s={s} set={set} />}
                {step === 3 && <StepRequirements s={s} set={set} />}
                {step === 4 && <StepCoordination s={s} set={set} />}
                {step === 5 && <StepReview s={s} />}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-ink-200 bg-paper/80 backdrop-blur px-8 py-4 flex items-center gap-2">
              <button onClick={onClose} className="text-[12px] font-mono text-ink-500 hover:text-ink-900">Cancel</button>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] font-mono text-ink-400 mr-2">step {step} of {STEPS.length}</span>
                {step > 1 && <button onClick={() => setStep(step - 1)} className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] hover:bg-ink-50 inline-flex items-center gap-1.5"><Icon name="arrow-left" className="w-3.5 h-3.5" /> Back</button>}
                {step === 5 ? (
                  <>
                    <button className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] hover:bg-ink-50">Save as draft</button>
                    <button onClick={() => setDone(true)} className="h-10 px-5 rounded-full bg-teal-700 text-white text-[13px] font-medium hover:bg-teal-800 inline-flex items-center gap-2"><Icon name="zap" className="w-3.5 h-3.5" /> Create staffing request</button>
                  </>
                ) : (
                  <button disabled={!valid[step]} onClick={() => setStep(step + 1)} className={`h-10 px-5 rounded-full text-[13px] font-medium inline-flex items-center gap-2 ${valid[step] ? "bg-ink-900 text-paper hover:bg-ink-800" : "bg-ink-200 text-ink-400 cursor-not-allowed"}`}>Continue <Icon name="arrow-right" className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
