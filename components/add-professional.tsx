"use client";

import { useEffect, useState } from "react";
import { Icon, Avatar, Dot } from "@/components/primitives";

const ROLE_OPTIONS = ["RN","LPN","CNA","EMT","CNS"];
const SPEC_OPTIONS = ["ICU","ER","Med-Surg","Telemetry","Pediatrics","Oncology","L&D","PACU","Rehab","Hospice"];
const SHIFT_PREFS = [{id:"day",l:"Day"},{id:"night",l:"Night"},{id:"weekend",l:"Weekend"},{id:"oncall",l:"On-call"}];

function Label({ children, hint, required }: any) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-[11px] font-mono uppercase tracking-wider text-ink-600">{children}{required && <span className="text-rose-600 ml-0.5">*</span>}</label>
      {hint && <span className="text-[10px] font-mono text-ink-400">{hint}</span>}
    </div>
  );
}

function ModeCard({ active, icon, label, sub, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-3.5 py-3 rounded-lg border text-left transition-colors ${active ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-600" : "border-ink-200 bg-white hover:border-ink-400"}`}>
      <Icon name={icon} className={`w-4 h-4 ${active ? "text-teal-700" : "text-ink-500"}`} />
      <div className="mt-1.5 text-[13px] font-medium tracking-tight">{label}</div>
      <div className="text-[10px] font-mono text-ink-500">{sub}</div>
    </button>
  );
}

function ManualForm({ s, set }: any) {
  const prefs = new Set(s.prefs ?? ["day","night"]);
  const togglePref = (id: string) => { const n = new Set(prefs); if (n.has(id)) n.delete(id); else n.add(id); set({ prefs: Array.from(n) }); };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Full name</Label><input value={s.name ?? ""} onChange={(e:any) => set({ name: e.target.value })} placeholder="e.g. Aria Martinez" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></div>
        <div>
          <Label required>Role</Label>
          <div className="flex gap-1.5 flex-wrap">
            {ROLE_OPTIONS.map(r => (
              <button key={r} onClick={() => set({ role: r })} className={`h-10 px-3 rounded-md border text-[12px] font-mono ${s.role === r ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label required>Specialty</Label>
        <div className="flex flex-wrap gap-1.5">
          {SPEC_OPTIONS.map(sp => <button key={sp} onClick={() => set({ specialty: sp })} className={`h-7 px-2.5 rounded-full border text-[11px] font-mono ${s.specialty === sp ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{sp}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Phone</Label><input value={s.phone ?? ""} onChange={(e:any) => set({ phone: e.target.value })} placeholder="(415) 555-0142" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></div>
        <div><Label>Email</Label><input value={s.email ?? ""} onChange={(e:any) => set({ email: e.target.value })} placeholder="aria@example.com" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Location · base ZIP</Label><input value={s.zip ?? ""} onChange={(e:any) => set({ zip: e.target.value })} placeholder="94110" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none" /></div>
        <div>
          <Label>Years experience</Label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[0,1,2,3,5,7,10].map(y => <button key={y} onClick={() => set({ years: y })} className={`h-9 px-3 rounded-md border text-[11px] font-mono ${(s.years ?? 3) === y ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 hover:border-ink-400 text-ink-700"}`}>{y === 0 ? "<1" : `${y}+ yr`}</button>)}
          </div>
        </div>
      </div>
      <div>
        <Label>Preferred shift types</Label>
        <div className="grid grid-cols-4 gap-2">
          {SHIFT_PREFS.map(p => {
            const on = prefs.has(p.id);
            return (
              <button key={p.id} onClick={() => togglePref(p.id)} className={`h-10 rounded-md border text-[12px] inline-flex items-center justify-center gap-1.5 ${on ? "border-teal-600 bg-teal-50/40 text-teal-800" : "border-ink-200 bg-white hover:border-ink-400 text-ink-700"}`}>
                {on && <Icon name="check" className="w-3 h-3" strokeWidth={3} />} {p.l}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InviteSMS({ s, set }: any) {
  const msg = `Hi ${s.firstName ?? "[first name]"} — you've been invited to join Apex Staffing's network. Tap to accept and pick your first shift: asneeded.app/i/x9k`;
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="space-y-3">
        <div><Label required>Full name</Label><input value={s.firstName ?? ""} onChange={(e:any) => set({ firstName: e.target.value })} placeholder="Aria Martinez" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none" /></div>
        <div><Label required>Phone</Label><input value={s.phone ?? ""} onChange={(e:any) => set({ phone: e.target.value })} placeholder="+1 (415) 555-0142" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none" /></div>
        <div><Label>Role · pre-fill</Label>
          <div className="flex gap-1.5 flex-wrap">{ROLE_OPTIONS.map(r => <button key={r} onClick={() => set({ role: r })} className={`h-9 px-3 rounded-md border text-[12px] font-mono ${s.role === r ? "bg-ink-900 border-ink-900 text-paper" : "bg-white border-ink-200 text-ink-700"}`}>{r}</button>)}</div>
        </div>
        <div className="rounded-lg border border-ink-200 bg-paper/40 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Invite link</div>
          <div className="flex items-center gap-2"><div className="flex-1 truncate text-[12px] font-mono text-ink-700">asneeded.app/i/x9k</div><button className="text-[10px] font-mono text-teal-700 hover:text-teal-900">copy</button></div>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">SMS preview</div>
        <div className="rounded-2xl border border-ink-200 bg-paper p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-teal-700 text-white inline-flex items-center justify-center"><Icon name="message-circle" className="w-3.5 h-3.5" /></span>
            <div><div className="text-[12px] font-medium tracking-tight">Apex Staffing</div><div className="text-[10px] font-mono text-ink-500">via SMS · just now</div></div>
          </div>
          <div className="rounded-2xl rounded-tl-md bg-white border border-ink-100 px-3.5 py-2.5 text-[12px] leading-relaxed">{msg}</div>
          <div className="mt-3 text-[10px] font-mono text-ink-500">Delivery: AT&T · Twilio · sender “85410”</div>
        </div>
        <div className="mt-3 rounded-lg border border-ink-100 bg-white px-3 py-2.5 flex items-center gap-2 text-[11px] font-mono">
          <Dot tone="ink" />
          <span className="text-ink-600">Status</span>
          <span className="ml-auto text-ink-700">Ready to send</span>
        </div>
      </div>
    </div>
  );
}

function InviteEmail({ s, set }: any) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="space-y-3">
        <div><Label required>Full name</Label><input value={s.firstName ?? ""} onChange={(e:any) => set({ firstName: e.target.value })} placeholder="Aria Martinez" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none" /></div>
        <div><Label required>Email</Label><input value={s.email ?? ""} onChange={(e:any) => set({ email: e.target.value })} placeholder="aria@example.com" className="w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-[13px] font-mono outline-none" /></div>
        <div><Label>Personal message</Label><textarea rows={4} value={s.note ?? ""} onChange={(e:any) => set({ note: e.target.value })} placeholder="Optional · adds a coordinator note above the invite CTA" className="w-full p-3 rounded-md border border-ink-200 bg-white text-[13px] outline-none resize-none" /></div>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Email preview</div>
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <div className="px-4 py-2 border-b border-ink-100 bg-paper/40 text-[10px] font-mono text-ink-500 flex items-center gap-3"><span>From <span className="text-ink-700">team@apexstaffing.com</span></span><span>·</span><span>To <span className="text-ink-700">{s.email || "—"}</span></span></div>
          <div className="px-5 py-5 space-y-3">
            <div className="text-[16px] font-medium tracking-tight">You're invited to join Apex Staffing</div>
            <div className="text-[12px] text-ink-700 leading-relaxed">Hi {s.firstName ?? "[first name]"}, you've been invited to join Apex Staffing's network of healthcare professionals. Accept the invite to set availability and pick up shifts at facilities near you.</div>
            {s.note && <div className="rounded-md border-l-2 border-teal-600 bg-teal-50/40 px-3 py-2 text-[12px] text-ink-700 italic">{s.note}</div>}
            <button className="h-9 px-4 rounded-full bg-ink-900 text-paper text-[12px] font-medium">Accept invitation</button>
            <div className="text-[10px] font-mono text-ink-400">Or paste this link · asneeded.app/i/x9k</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSV_ROWS = [
  { ok:true,  cells:["Aria Martinez","RN","ICU","(415) 555-0142","aria@example.com","94110"] },
  { ok:true,  cells:["Devon Carter","RN","Med-Surg","(415) 555-0188","devon.c@example.com","94121"] },
  { ok:false, err:"Invalid phone format", cells:["Sayuri Nguyen","RN","ICU","415.555.0199","sayuri@example.com","94103"] },
  { ok:true,  cells:["Jamal Reyes","RN","ER","(510) 555-0117","jamal@example.com","94609"] },
  { ok:false, err:"Missing required: email", cells:["Mei Sato","CNA","Pedi","(415) 555-0133","","94115"] },
  { ok:true,  cells:["Grace Hall","LPN","Rehab","(650) 555-0144","g.hall@example.com","94025"] },
];
const CSV_FIELDS = ["Full name","Role","Specialty","Phone","Email","ZIP"];

function CsvImport() {
  const [stage, setStage] = useState<"drop"|"map"|"review">("map");
  const [drag, setDrag] = useState(false);
  const valid = CSV_ROWS.filter(r => r.ok).length;
  const errors = CSV_ROWS.length - valid;

  if (stage === "drop") {
    return (
      <div className="space-y-3">
        <div onDragOver={(e:any) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e:any) => { e.preventDefault(); setDrag(false); setStage("map"); }} className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${drag ? "border-teal-500 bg-teal-50/40" : "border-ink-300 bg-paper/40"}`}>
          <span className="inline-flex w-12 h-12 rounded-full bg-white border border-ink-200 items-center justify-center text-ink-500 mb-3"><Icon name="upload-cloud" className="w-5 h-5" /></span>
          <div className="text-[14px] font-medium tracking-tight">Drop your CSV here</div>
          <div className="text-[11px] font-mono text-ink-500 mt-1">or <button onClick={() => setStage("map")} className="text-teal-700 hover:text-teal-900">browse files</button> · max 10MB · UTF-8</div>
        </div>
        <div className="text-[11px] font-mono text-ink-500">Need a template? <button className="text-teal-700 hover:text-teal-900">Download workforce.csv</button></div>
      </div>
    );
  }
  if (stage === "map") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-ink-200 bg-white">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
            <Icon name="file-text" className="w-3.5 h-3.5 text-ink-600" />
            <div className="text-[12px] font-medium tracking-tight">workforce.csv</div>
            <span className="text-[10px] font-mono text-ink-500">· 24 rows · 6 columns</span>
            <button onClick={() => setStage("drop")} className="ml-auto text-[10px] font-mono text-ink-500 hover:text-ink-900">change file</button>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Map columns to AsNeeded fields</div>
            <div className="space-y-1.5">
              {CSV_FIELDS.map((f, i) => (
                <div key={f} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2 rounded-md bg-paper/40 border border-ink-100">
                  <div className="text-[12px] font-mono text-ink-700">{f.toLowerCase().replace(/\s/g,"_")}</div>
                  <Icon name="arrow-right" className="w-3 h-3 text-ink-400" />
                  <div className="flex items-center gap-2"><Icon name="check-circle-2" className="w-3.5 h-3.5 text-teal-700" /><span className="text-[12px] font-medium tracking-tight">{f}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end"><button onClick={() => setStage("review")} className="h-10 px-5 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-800 inline-flex items-center gap-2">Validate <Icon name="arrow-right" className="w-3.5 h-3.5" /></button></div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-ink-200 bg-white p-3"><div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Rows</div><div className="text-[20px] font-medium tabular-nums">{CSV_ROWS.length}</div></div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3"><div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800">Valid</div><div className="text-[20px] font-medium tabular-nums text-emerald-700">{valid}</div></div>
        <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3"><div className="text-[10px] font-mono uppercase tracking-wider text-rose-800">Errors</div><div className="text-[20px] font-medium tabular-nums text-rose-700">{errors}</div></div>
      </div>
      <div className="rounded-lg border border-ink-200 bg-white overflow-hidden">
        <div className="overflow-x-auto scrollarea">
          <table className="w-full text-[12px]">
            <thead className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100 bg-paper/40">
              <tr><th className="px-3 py-2 w-8"></th>{CSV_FIELDS.map(f => <th key={f} className="px-3 py-2">{f}</th>)}</tr>
            </thead>
            <tbody>
              {CSV_ROWS.map((r, i) => (
                <tr key={i} className={`border-b last:border-0 border-ink-100 ${!r.ok ? "bg-rose-50/30" : ""}`}>
                  <td className="px-3 py-2.5">{r.ok ? <Icon name="check-circle-2" className="w-3.5 h-3.5 text-emerald-600" /> : <Icon name="alert-circle" className="w-3.5 h-3.5 text-rose-600" />}</td>
                  {r.cells.map((c, j) => <td key={j} className={`px-3 py-2.5 ${!r.ok && (j === 3 || j === 4) ? "text-rose-700" : "text-ink-700"}`}>{c || <span className="font-mono text-rose-500">missing</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {errors > 0 && (
          <div className="px-4 py-2.5 border-t border-ink-100 bg-rose-50/30 text-[11px] font-mono text-rose-700 flex items-center gap-2"><Icon name="alert-triangle" className="w-3.5 h-3.5" /> {errors} rows have validation errors · fix in CSV or skip on import</div>
        )}
      </div>
    </div>
  );
}

export function AddProfessionalSheet({ open, onClose }: any) {
  const [mode, setMode] = useState<"sms"|"email"|"manual"|"csv">("sms");
  const [s, setS] = useState<any>({});
  const [success, setSuccess] = useState<any>(null);
  const set = (p: any) => setS({ ...s, ...p });

  useEffect(() => { if (!open) { setMode("sms"); setS({}); setSuccess(null); } }, [open]);
  useEffect(() => {
    function k(e: any) { if (e.key === "Escape" && open) onClose(); }
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    setSuccess({ mode, name: s.firstName || s.name || "Aria Martinez" });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[820px] max-w-[96vw] bg-paper shadow-2xl flex flex-col rise-in">
        {success ? (
          <div className="h-full flex flex-col">
            <div className="px-8 pt-10 pb-6 bg-gradient-to-b from-teal-50/60 to-transparent border-b border-ink-100">
              <div className="relative w-14 h-14 rounded-full bg-teal-700 text-white inline-flex items-center justify-center mb-4">
                <span className="absolute inset-0 rounded-full bg-teal-500/40 ping-slow" />
                <Icon name="check" className="w-6 h-6 relative" strokeWidth={3} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800">{success.mode === "csv" ? "Import complete" : success.mode === "manual" ? "Added" : "Invite sent"}</div>
              <h2 className="mt-1 text-[24px] leading-tight tracking-[-0.01em] font-medium">
                {success.mode === "csv" ? <>4 RNs imported.<span className="font-serif italic text-teal-800"> 2 errors flagged.</span></> : success.mode === "manual" ? <>{success.name} added.<span className="font-serif italic text-teal-800"> Compliance pending.</span></> : <>Invite delivered to {success.name}.<span className="font-serif italic text-teal-800"> Awaiting acceptance.</span></>}
              </h2>
            </div>
            <div className="flex-1 px-8 py-6 space-y-3">
              {success.mode !== "csv" && (
                <div className="rounded-lg border border-ink-200 bg-white p-4 flex items-center gap-3">
                  <Avatar initials={(success.name || "??").split(" ").map((p:string) => p[0]).join("").slice(0,2)} tone="teal" size={36} />
                  <div className="flex-1"><div className="text-[14px] font-medium tracking-tight">{success.name}</div><div className="text-[11px] font-mono text-ink-500">{success.mode === "manual" ? "Manual entry · awaiting credential upload" : success.mode === "sms" ? "SMS sent · expires in 7 days" : "Email sent · expires in 7 days"}</div></div>
                  <span className="text-[10px] font-mono px-1.5 h-5 rounded bg-amber-100 text-amber-800 inline-flex items-center">pending</span>
                </div>
              )}
              <div className="rounded-lg border border-ink-200 bg-white p-4">
                <div className="text-[12px] font-medium tracking-tight mb-2">Next operational steps</div>
                <ol className="text-[12px] text-ink-700 space-y-1.5">
                  <li className="flex items-center gap-2"><Icon name="dot" className="w-3 h-3 text-teal-700" /> Compliance team will request credential uploads</li>
                  <li className="flex items-center gap-2"><Icon name="dot" className="w-3 h-3 text-teal-700" /> RN sets availability via mobile app</li>
                  <li className="flex items-center gap-2"><Icon name="dot" className="w-3 h-3 text-teal-700" /> Auto-enrolled into match engine for {s.specialty ?? "their specialty"} requests</li>
                </ol>
              </div>
            </div>
            <div className="border-t border-ink-200 bg-paper/60 px-8 py-4 flex items-center gap-2">
              <button onClick={() => { setSuccess(null); }} className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] hover:bg-ink-50">Add another</button>
              <button onClick={onClose} className="ml-auto h-10 px-5 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800">Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-8 pt-6 pb-5 border-b border-ink-200">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Workforce · onboarding</div>
                  <h2 className="mt-1 text-[22px] leading-tight tracking-[-0.01em] font-medium">Add healthcare professional<span className="font-serif italic text-teal-800"> · expand the network.</span></h2>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="x" className="w-4 h-4" /></button>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                <ModeCard active={mode === "sms"}    icon="message-circle" label="Invite via SMS"  sub="Tap-to-accept link" onClick={() => setMode("sms")} />
                <ModeCard active={mode === "email"}  icon="mail"           label="Invite via email" sub="Branded message"   onClick={() => setMode("email")} />
                <ModeCard active={mode === "manual"} icon="user-plus"      label="Add manually"     sub="Coordinator entry"  onClick={() => setMode("manual")} />
                <ModeCard active={mode === "csv"}    icon="upload-cloud"   label="Import CSV"       sub="Bulk onboard"       onClick={() => setMode("csv")} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollarea px-8 py-6">
              <div key={mode} className="rise-in">
                {mode === "sms"    && <InviteSMS s={s} set={set} />}
                {mode === "email"  && <InviteEmail s={s} set={set} />}
                {mode === "manual" && <ManualForm s={s} set={set} />}
                {mode === "csv"    && <CsvImport />}
              </div>
            </div>
            <div className="border-t border-ink-200 bg-paper/80 backdrop-blur px-8 py-4 flex items-center gap-2">
              <button onClick={onClose} className="text-[12px] font-mono text-ink-500 hover:text-ink-900">Cancel</button>
              <button onClick={submit} className="ml-auto h-10 px-5 rounded-full bg-teal-700 text-white text-[13px] font-medium hover:bg-teal-800 inline-flex items-center gap-2">
                {mode === "sms" ? <><Icon name="send" className="w-3.5 h-3.5" /> Send SMS invite</> : mode === "email" ? <><Icon name="send" className="w-3.5 h-3.5" /> Send email invite</> : mode === "manual" ? <><Icon name="user-plus" className="w-3.5 h-3.5" /> Add to workforce</> : <><Icon name="upload" className="w-3.5 h-3.5" /> Import 4 valid rows</>}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
