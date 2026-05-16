"use client";

import { useState } from "react";
import { Icon, Avatar, Dot } from "@/components/primitives";

// ─── Shared mobile primitives ─────────────────────
function PhoneShell({ children, header, footer, bg = "bg-paper" }: any) {
  return (
    <div className={`relative w-full h-full ${bg} flex flex-col`} style={{ paddingTop: 54 }}>
      {header}
      <div className="flex-1 overflow-y-auto scrollarea" style={{ paddingBottom: footer ? 96 : 34 }}>
        {children}
      </div>
      {footer && <div className="absolute left-0 right-0 bottom-0 pb-[34px] bg-gradient-to-t from-white via-white/95 to-white/60 border-t border-ink-200/80">{footer}</div>}
    </div>
  );
}

function AppHeader({ title, sub, leading, trailing, accent }: any) {
  return (
    <div className="px-5 pt-3 pb-3 bg-paper/95 backdrop-blur sticky top-0 z-20 border-b border-ink-200/60">
      <div className="flex items-center gap-2 min-h-[28px]">
        {leading}
        <div className="flex-1 min-w-0">
          {sub && <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">{sub}</div>}
          <div className="text-[20px] leading-tight font-medium tracking-tight">
            {title}{accent && <span className="font-serif italic text-teal-800"> {accent}</span>}
          </div>
        </div>
        {trailing}
      </div>
    </div>
  );
}

function IconBtn({ name, onClick, badge }: any) {
  return (
    <button onClick={onClick} className="relative w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-ink-700 hover:bg-ink-50">
      <Icon name={name} className="w-4 h-4" />
      {badge && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-paper text-[8px] text-white font-mono inline-flex items-center justify-center">{badge}</span>}
    </button>
  );
}

function UrgencyChip({ level }: any) {
  const m: any = {
    Critical: "bg-rose-50 text-rose-700 border-rose-200",
    High:     "bg-amber-50 text-amber-700 border-amber-200",
    Normal:   "bg-ink-100 text-ink-700 border-ink-200",
  };
  const dot: any = { Critical:"red", High:"amber", Normal:"ink" };
  return <span className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[10px] font-mono border ${m[level]}`}><Dot tone={dot[level]} pulse={level !== "Normal"} />{level}</span>;
}

// ════════════════════════════════════════════════════
// SCREEN 1 · NOTIFICATIONS
// ════════════════════════════════════════════════════
function S1_Notifications() {
  const [tab, setTab] = useState("inApp");
  return (
    <PhoneShell
      header={<AppHeader sub="Operational alerts" title="Notifications" accent="· stay ready." trailing={<IconBtn name="check-check" />} />}
    >
      {/* Channel toggle */}
      <div className="px-5 pt-3">
        <div className="grid grid-cols-3 gap-1 p-1 bg-ink-100 rounded-full">
          {[{id:"inApp",l:"In-app"},{id:"push",l:"Push"},{id:"sms",l:"SMS"}].map((t:any) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`h-7 rounded-full text-[11px] font-medium tracking-tight ${tab === t.id ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      {tab === "inApp" && <div className="p-4 space-y-3">
        {/* Featured invite card */}
        <div className="rounded-2xl bg-white border border-teal-200 p-4 shadow-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-teal-50" />
          <div className="relative">
            <div className="flex items-center gap-2"><UrgencyChip level="High" /><span className="text-[10px] font-mono text-ink-500">expires in <span className="text-rose-700 tabular-nums">14:32</span></span></div>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.14em] text-teal-700">Shift invite</div>
            <div className="mt-1 text-[17px] leading-snug font-medium tracking-tight">ICU RN · Green Valley Hospital</div>
            <div className="mt-0.5 text-[12px] font-mono text-ink-600">Tomorrow · 19:00 — 07:00 · 12h</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-paper border border-ink-200 px-2 py-1.5">
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">Pay</div>
                <div className="text-[12px] font-medium tabular-nums">$72/hr</div>
              </div>
              <div className="rounded-md bg-paper border border-ink-200 px-2 py-1.5">
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">Distance</div>
                <div className="text-[12px] font-medium tabular-nums">4.2 mi</div>
              </div>
              <div className="rounded-md bg-paper border border-ink-200 px-2 py-1.5">
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">Specialty</div>
                <div className="text-[12px] font-medium">ICU</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 h-10 rounded-full bg-teal-700 text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" /> Accept</button>
              <button className="flex-1 h-10 rounded-full border border-ink-200 bg-white text-[13px] font-medium">View shift</button>
              <button className="w-10 h-10 rounded-full border border-ink-200 bg-white inline-flex items-center justify-center text-ink-700"><Icon name="x" className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Other notifications */}
        {[
          { type:"Reminder",  tone:"teal",   title:"Shift starts in 2h", body:"Mercy Mt. Sinai · ICU · 19:00 tonight",   time:"5m",  icon:"alarm-clock" },
          { type:"Urgent",    tone:"rose",   title:"Replacement needed", body:"L&D RN · today 15:00 — 23:00 · 1.4 mi away",  time:"12m", icon:"siren",   urgent:true },
          { type:"Schedule",  tone:"amber",  title:"Wed shift moved",     body:"Pinegrove SNF — start 19:00 → 21:00",     time:"1h",  icon:"calendar-clock" },
          { type:"Cancel",    tone:"ink",    title:"Shift cancelled",     body:"Bayview Care · Med-Surg · Sat Mar 14",    time:"3h",  icon:"x-circle" },
          { type:"Confirmed", tone:"green",  title:"You're confirmed",    body:"Mercy Mt. Sinai · ICU · tonight 19:00",   time:"1d",  icon:"check-circle-2" },
        ].map((n, i) => (
          <button key={i} className="w-full text-left rounded-xl bg-white border border-ink-200 p-3 flex items-start gap-3 active:bg-ink-50">
            <span className={`w-9 h-9 rounded-lg inline-flex items-center justify-center bg-${n.tone}-50 text-${n.tone}-700 shrink-0`}><Icon name={n.icon} className="w-4 h-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-mono uppercase tracking-[0.12em] ${n.tone === "rose" ? "text-rose-700" : n.tone === "amber" ? "text-amber-700" : n.tone === "green" ? "text-emerald-700" : n.tone === "ink" ? "text-ink-500" : "text-teal-700"}`}>{n.type}</span>
                {n.urgent && <Dot tone="red" pulse />}
                <span className="ml-auto text-[10px] font-mono text-ink-400">{n.time}</span>
              </div>
              <div className="text-[13px] font-medium tracking-tight mt-0.5">{n.title}</div>
              <div className="text-[12px] text-ink-600 mt-0.5 leading-snug">{n.body}</div>
            </div>
          </button>
        ))}
      </div>}

      {tab === "push" && <div className="p-4">
        {/* iOS-style lock screen preview */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background:"linear-gradient(135deg,#0c615e 0%,#0e1318 60%,#1d242c 100%)" }}>
          <div className="text-center">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/60">Wednesday, Mar 11</div>
            <div className="mt-1 text-[64px] leading-none font-semibold tracking-tight" style={{ fontFamily:'-apple-system,system-ui' }}>9:41</div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3 flex items-start gap-3">
              <span className="w-8 h-8 rounded-md bg-teal-500 inline-flex items-center justify-center"><Icon name="zap" className="w-4 h-4 text-white" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5"><span className="text-[12px] font-semibold">AsNeeded</span><span className="text-white/50 text-[10px] font-mono">now</span></div>
                <div className="text-[13px] font-medium leading-snug mt-0.5">ICU RN · Green Valley · tomorrow 7p–7a</div>
                <div className="text-[11px] text-white/70 leading-snug">Tap to accept · expires in 14m</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3 flex items-start gap-3">
              <span className="w-8 h-8 rounded-md bg-rose-500 inline-flex items-center justify-center"><Icon name="siren" className="w-4 h-4 text-white" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5"><span className="text-[12px] font-semibold">AsNeeded</span><span className="text-white/50 text-[10px] font-mono">12m</span></div>
                <div className="text-[13px] font-medium leading-snug mt-0.5">Urgent: replacement needed · 1.4 mi</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white border border-ink-200 p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Push channel preferences</div>
          <div className="mt-3 space-y-2.5">
            {[{l:"New shift invites",on:true},{l:"Urgent replacements",on:true},{l:"Shift reminders (2h prior)",on:true},{l:"Schedule updates",on:true},{l:"Cancellation alerts",on:false}].map((p:any,i:number) => (
              <div key={i} className="flex items-center justify-between"><span className="text-[13px]">{p.l}</span>
                <span className={`relative w-9 h-5 rounded-full ${p.on ? "bg-teal-700" : "bg-ink-200"} transition-colors`}><span className={`absolute top-0.5 ${p.on ? "left-[18px]" : "left-0.5"} w-4 h-4 rounded-full bg-white shadow transition-all`} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {tab === "sms" && <div className="p-4 space-y-3">
        <div className="rounded-2xl bg-[#E5E5EA] p-4">
          <div className="text-center text-[10px] font-mono text-ink-500 mb-2">SMS · +1 (415) 555-0142 · 9:24 AM</div>
          <div className="space-y-2">
            <div className="rounded-2xl bg-white px-3 py-2 max-w-[88%]" style={{ borderRadius:"18px 18px 18px 4px" }}>
              <div className="text-[13px] leading-snug">AsNeeded: New shift invite. ICU RN · Green Valley Hospital · tomorrow 7p–7a · $72/hr · 4.2mi.</div>
              <div className="text-[12px] mt-1"><span className="text-teal-700 underline">Accept</span> · <span className="text-ink-700 underline">View</span> · <span className="text-rose-700 underline">Decline</span></div>
              <div className="text-[10px] font-mono text-ink-400 mt-1">Expires 14m · Reply STOP to opt out</div>
            </div>
            <div className="rounded-2xl bg-[#34C759] text-white px-3 py-2 max-w-[60%] ml-auto" style={{ borderRadius:"18px 18px 4px 18px" }}>
              <div className="text-[13px]">Accept</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2 max-w-[78%]" style={{ borderRadius:"18px 18px 18px 4px" }}>
              <div className="text-[13px] leading-snug">✓ Confirmed for ICU RN · Green Valley · tomorrow 19:00. Coordinator: L. Mahoney.</div>
              <div className="text-[10px] font-mono text-ink-400 mt-1">Delivered · 9:24 AM</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-ink-200 p-3 text-[11px] font-mono text-ink-600 flex items-center gap-2"><Icon name="info" className="w-3.5 h-3.5 text-teal-700" /> SMS keeps shift coordination working when push is off.</div>
      </div>}
    </PhoneShell>
  );
}

// ════════════════════════════════════════════════════
// SCREEN 2 · SHIFT DETAILS
// ════════════════════════════════════════════════════
function S2_Details() {
  return (
    <PhoneShell
      header={<AppHeader sub="REQ-2849 · Shift invite" title="Shift Details" leading={<button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-ink-700"><Icon name="chevron-left" className="w-4 h-4" /></button>} trailing={<IconBtn name="more-horizontal" />} />}
      footer={
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <button className="w-11 h-11 rounded-full border border-ink-200 bg-white inline-flex items-center justify-center text-ink-700"><Icon name="message-circle" className="w-4 h-4" /></button>
          <button className="flex-1 h-11 rounded-full border border-ink-200 bg-white text-[13px] font-medium text-rose-700">Decline</button>
          <button className="flex-[1.4] h-11 rounded-full bg-teal-700 text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Accept Shift</button>
        </div>
      }
    >
      <div className="p-4 space-y-3">
        {/* Hero card */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-start gap-3">
            <span className="w-12 h-12 rounded-xl bg-teal-50 inline-flex items-center justify-center text-teal-700"><Icon name="building-2" className="w-6 h-6" /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <UrgencyChip level="High" />
                <span className="text-[10px] font-mono text-ink-500">expires in <span className="text-rose-700 tabular-nums">14:32</span></span>
              </div>
              <div className="mt-1.5 text-[18px] font-medium leading-tight tracking-tight">Green Valley Hospital</div>
              <div className="text-[12px] font-mono text-ink-500">ICU · Floor 4 · Bed 412</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field icon="calendar" label="Date" value="Wed, Mar 12" sub="Tomorrow" />
            <Field icon="clock" label="Hours" value="12 h" sub="0.5h break" />
            <Field icon="sun-moon" label="Shift" value="19:00 — 07:00" sub="Night" />
            <Field icon="dollar-sign" label="Rate" value="$72/hr" sub="$864 total" />
          </div>
        </div>

        {/* Compliance readiness */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center gap-2"><Icon name="shield-check" className="w-4 h-4 text-emerald-600" /><div className="text-[13px] font-medium tracking-tight">Compliance readiness</div><span className="ml-auto text-[11px] font-mono text-emerald-700">Verified</span></div>
          <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width:"100%" }} /></div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {[
              { l:"RN License (CA)", ok:true },
              { l:"BLS · CPR",        ok:true },
              { l:"ACLS",             ok:true },
              { l:"Background check", ok:true },
              { l:"COVID vaccine",    ok:true },
              { l:"Hep B",            ok:false, sub:"expires 4/14" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                <Icon name={c.ok ? "check-circle-2" : "alert-circle"} className={`w-3.5 h-3.5 ${c.ok ? "text-emerald-600" : "text-amber-600"}`} />
                <span className={c.ok ? "text-ink-700" : "text-amber-700"}>{c.l}</span>
                {c.sub && <span className="text-[10px] font-mono text-amber-700">· {c.sub}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements checklist */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[13px] font-medium tracking-tight">Shift requirements</div>
          <div className="mt-3 space-y-2.5">
            {[
              { l:"ICU specialty experience · 2+ yrs", ok:true },
              { l:"Vent management certified",          ok:true },
              { l:"Cerner EHR familiarity",             ok:true },
              { l:"Scrubs · facility provides badge",   ok:null },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className={`w-4 h-4 rounded-full inline-flex items-center justify-center ${r.ok === true ? "bg-emerald-100 text-emerald-700" : r.ok === null ? "bg-ink-100 text-ink-500" : "bg-rose-100 text-rose-700"}`}>
                  <Icon name={r.ok === true ? "check" : "info"} className="w-2.5 h-2.5" />
                </span>
                <span className="text-ink-800">{r.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-teal-50 via-white to-paper">
            <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none" viewBox="0 0 200 100">
              <path d="M0 60 Q40 45 80 55 T160 50 T200 55" stroke="#aae0dc" strokeWidth="0.8" fill="none" />
              <path d="M0 75 Q60 70 120 70 T200 78" stroke="#aae0dc" strokeWidth="0.8" fill="none" />
              <path d="M30 0 L40 100" stroke="#dadde1" strokeWidth="0.5" />
              <path d="M120 0 L140 100" stroke="#dadde1" strokeWidth="0.5" />
              <path d="M0 30 L200 35" stroke="#dadde1" strokeWidth="0.5" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative inline-flex"><span className="absolute inset-0 rounded-full bg-teal-500 ping-slow" /><span className="relative w-3 h-3 rounded-full bg-teal-700 ring-2 ring-white" /></span>
            </div>
            <div className="absolute top-3 left-3 text-[10px] font-mono bg-white/90 backdrop-blur px-2 py-1 rounded">📍 4.2 mi · 12 min drive</div>
          </div>
          <div className="px-4 py-3 flex items-center gap-2">
            <Icon name="map-pin" className="w-3.5 h-3.5 text-ink-500" />
            <div className="flex-1 text-[12px] text-ink-700">2401 California St, San Francisco</div>
            <button className="text-[11px] font-medium text-teal-700">Directions</button>
          </div>
        </div>

        {/* Coordinator */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4 flex items-center gap-3">
          <Avatar initials="LM" tone="teal" size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Coordinator</div>
            <div className="text-[13px] font-medium tracking-tight">Lena Mahoney</div>
            <div className="text-[11px] font-mono text-ink-500">Apex Staffing · responds within 4m</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-paper border border-ink-200 inline-flex items-center justify-center text-ink-700"><Icon name="phone" className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-full bg-teal-700 text-white inline-flex items-center justify-center"><Icon name="message-circle" className="w-4 h-4" /></button>
        </div>

        {/* Facility instructions */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Facility instructions</div>
          <div className="mt-1 text-[13px] leading-relaxed text-ink-800 italic">
            "Park in Lot C and check in at the security desk. Charge nurse will meet you at the 4th floor ICU station. Bring stethoscope; we provide everything else."
          </div>
          <div className="mt-2 text-[11px] font-mono text-ink-500">— Charge: T. Okafor</div>
        </div>
      </div>
    </PhoneShell>
  );
}

function Field({ icon, label, value, sub }: any) {
  return (
    <div className="rounded-lg bg-paper/60 border border-ink-100 p-2.5">
      <div className="flex items-center gap-1.5"><Icon name={icon} className="w-3 h-3 text-ink-500" /><span className="text-[9px] font-mono uppercase tracking-wider text-ink-500">{label}</span></div>
      <div className="mt-1 text-[14px] font-medium tracking-tight tabular-nums">{value}</div>
      {sub && <div className="text-[10px] font-mono text-ink-500">{sub}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════
// SCREEN 3 · ACCEPT/DECLINE FLOW
// ════════════════════════════════════════════════════
function S3_AcceptDecline() {
  const [phase, setPhase] = useState<"confirm"|"success"|"decline">("confirm");
  const [reason, setReason] = useState<string|null>(null);
  return (
    <PhoneShell
      header={<AppHeader sub="REQ-2849" title={phase === "success" ? "Confirmed" : phase === "decline" ? "Decline shift" : "Confirm shift"} leading={<button onClick={() => setPhase("confirm")} className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-ink-700"><Icon name="chevron-left" className="w-4 h-4" /></button>} />}
    >
      {phase === "confirm" && <div className="p-4 space-y-3">
        {/* Mini summary */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">You're accepting</div>
          <div className="mt-1 text-[16px] font-medium tracking-tight">ICU RN · Green Valley Hospital</div>
          <div className="text-[12px] font-mono text-ink-600">Wed Mar 12 · 19:00 — 07:00 · 12h · $864</div>
        </div>

        {/* Schedule conflict warning */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2.5">
            <Icon name="triangle-alert" className="w-4 h-4 text-amber-700 mt-0.5" />
            <div className="flex-1">
              <div className="text-[12px] font-medium text-amber-800">Schedule overlap detected</div>
              <div className="text-[11px] text-amber-700 mt-0.5 leading-snug">You have an on-call window Thu 03:00 — 07:00. Accepting this shift removes you from on-call.</div>
              <div className="mt-2 flex items-center gap-1.5"><label className="inline-flex items-center gap-1.5 text-[11px] text-amber-800"><input type="checkbox" defaultChecked className="accent-amber-600" /> Release on-call window</label></div>
            </div>
          </div>
        </div>

        {/* Compliance verification */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center gap-2"><Icon name="shield-check" className="w-4 h-4 text-emerald-600" /><div className="text-[13px] font-medium tracking-tight">Compliance verified</div></div>
          <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3">
            {["RN License","BLS · CPR","ACLS","Background","COVID vax","TB screen"].map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]"><Icon name="check-circle-2" className="w-3 h-3 text-emerald-600" /><span className="text-ink-700">{c}</span></div>
            ))}
          </div>
          <div className="mt-3 text-[11px] font-mono text-ink-500 flex items-center gap-1.5"><Icon name="info" className="w-3 h-3" /> Hep B expires 4/14 — renewal reminder will fire after this shift.</div>
        </div>

        {/* Acknowledgements */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4 space-y-2.5">
          {[{l:"I will arrive at least 15m early"},{l:"I will notify coordinator if running late"},{l:"I understand the cancellation policy (<24h)"}].map((c, i) => (
            <label key={i} className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" defaultChecked className="mt-0.5 accent-teal-700 w-4 h-4" /><span className="text-[12px] text-ink-800 leading-snug">{c.l}</span></label>
          ))}
        </div>

        <button onClick={() => setPhase("success")} className="w-full h-12 rounded-full bg-teal-700 text-white text-[14px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Confirm acceptance</button>
        <button onClick={() => setPhase("decline")} className="w-full h-11 rounded-full border border-ink-200 bg-white text-[13px] font-medium text-rose-700">Decline instead</button>
      </div>}

      {phase === "success" && <div className="p-4 space-y-3">
        <div className="rounded-2xl bg-white border border-ink-200 p-6 text-center">
          <span className="relative inline-flex w-16 h-16">
            <span className="absolute inset-0 rounded-full bg-emerald-200 ping-slow" />
            <span className="relative w-16 h-16 rounded-full bg-emerald-500 inline-flex items-center justify-center"><Icon name="check" className="w-8 h-8 text-white" strokeWidth={3} /></span>
          </span>
          <div className="mt-4 text-[20px] font-medium tracking-tight">You're confirmed<span className="font-serif italic text-teal-800"> · see you tomorrow.</span></div>
          <div className="mt-1 text-[12px] font-mono text-ink-600">Mercy ICU · Tomorrow 19:00</div>
        </div>

        <div className="rounded-2xl bg-white border border-ink-200 divide-y divide-ink-100">
          {[
            { i:"calendar-plus", l:"Added to your shift calendar", s:"Wed Mar 12 · 19:00 — 07:00" },
            { i:"bell",          l:"Reminder set for 17:00",       s:"2 hours prior · push + SMS" },
            { i:"map-pin",       l:"Directions saved",              s:"4.2 mi · 12 min drive" },
            { i:"user",           l:"Coordinator notified",          s:"Lena Mahoney" },
          ].map((x:any, i:number) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center"><Icon name={x.i} className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0"><div className="text-[12px] font-medium tracking-tight">{x.l}</div><div className="text-[11px] font-mono text-ink-500">{x.s}</div></div>
              <Icon name="check-circle-2" className="w-4 h-4 text-emerald-600" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="h-11 rounded-full border border-ink-200 bg-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="message-circle" className="w-3.5 h-3.5" /> Message coord</button>
          <button className="h-11 rounded-full bg-ink-900 text-paper text-[13px] font-medium inline-flex items-center justify-center gap-1.5">View my shifts <Icon name="arrow-right" className="w-3.5 h-3.5" /></button>
        </div>

        {/* Toast preview */}
        <div className="rounded-xl bg-ink-900 text-paper px-4 py-2.5 flex items-center gap-2"><Dot tone="green" pulse /><div className="text-[12px] flex-1">Shift confirmed · sync'd to facility</div><span className="text-[10px] font-mono text-paper/60">undo</span></div>
      </div>}

      {phase === "decline" && <div className="p-4 space-y-3">
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[12px] text-ink-700">Quick reason helps coordinators rebuild this match faster.</div>
        </div>
        <div className="space-y-2">
          {[
            { l:"Unavailable",        i:"calendar-x" },
            { l:"Schedule conflict",   i:"refresh-ccw" },
            { l:"Too far",              i:"map-pin-off" },
            { l:"Personal reason",      i:"user-x" },
            { l:"Other",                i:"more-horizontal" },
          ].map(r => (
            <button key={r.l} onClick={() => setReason(r.l)} className={`w-full text-left rounded-xl border p-3.5 flex items-center gap-3 ${reason === r.l ? "bg-teal-50 border-teal-300" : "bg-white border-ink-200"}`}>
              <span className={`w-8 h-8 rounded-md inline-flex items-center justify-center ${reason === r.l ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-600"}`}><Icon name={r.i} className="w-4 h-4" /></span>
              <span className="flex-1 text-[13px] font-medium">{r.l}</span>
              {reason === r.l && <Icon name="check" className="w-4 h-4 text-teal-700" />}
            </button>
          ))}
        </div>
        {reason === "Other" && <textarea rows={3} placeholder="Add a quick note (optional)" className="w-full rounded-xl border border-ink-200 bg-white p-3 text-[12px] outline-none focus:border-teal-500" />}
        <button disabled={!reason} onClick={() => setPhase("confirm")} className={`w-full h-12 rounded-full text-[14px] font-medium ${reason ? "bg-rose-600 text-white" : "bg-ink-200 text-ink-500"}`}>Send decline</button>
        <div className="text-center text-[11px] font-mono text-ink-500">No penalty · stays anonymous to facility</div>
      </div>}
    </PhoneShell>
  );
}

// ════════════════════════════════════════════════════
// SCREEN 4 · MY SHIFTS
// ════════════════════════════════════════════════════
function S4_MyShifts() {
  const [tab, setTab] = useState("Upcoming");
  const [view, setView] = useState<"list"|"cal">("list");
  const upcoming = [
    { id:"S-1041", facility:"Mercy Mt. Sinai", unit:"ICU · Floor 4", date:"Tonight",   time:"19:00 — 07:00", state:"Confirmed",            tone:"green",  coord:"L. Mahoney", coordI:"LM", coordT:"teal",   checkin:"30m before", reminder:"2h" },
    { id:"S-1058", facility:"Bayview Care",     unit:"Med-Surg",     date:"Sat Mar 14", time:"07:00 — 19:00", state:"Pending Confirmation", tone:"amber",  coord:"R. Tan",     coordI:"RT", coordT:"violet", checkin:"—",          reminder:"—" },
    { id:"S-1062", facility:"Mercy Mt. Sinai", unit:"ICU · Floor 4", date:"Mon Mar 16", time:"19:00 — 07:00", state:"Confirmed",            tone:"green",  coord:"L. Mahoney", coordI:"LM", coordT:"teal",   checkin:"—",          reminder:"—" },
    { id:"S-1067", facility:"Pinegrove SNF",    unit:"Floor 2",       date:"Thu Mar 19", time:"07:00 — 15:00", state:"Pending Confirmation", tone:"amber",  coord:"L. Mahoney", coordI:"LM", coordT:"teal",   checkin:"—",          reminder:"—" },
  ];
  const active = [
    { id:"S-1037", facility:"Mercy Mt. Sinai", unit:"ICU · Floor 4", date:"In progress · 4h 22m", time:"19:00 — 07:00", state:"Checked In", tone:"teal", coord:"L. Mahoney", coordI:"LM", coordT:"teal", checkin:"19:02", reminder:"—", live:true },
  ];
  const completed = [
    { id:"S-1018", facility:"Mercy Mt. Sinai", unit:"ICU · Floor 4", date:"Mar 9",  time:"19:00 — 07:00", state:"Completed", tone:"ink", coord:"L. Mahoney", coordI:"LM", coordT:"teal", checkin:"on time", reminder:"—" },
    { id:"S-1014", facility:"Bayview Care",    unit:"Med-Surg",      date:"Mar 6",  time:"07:00 — 15:00", state:"Completed", tone:"ink", coord:"R. Tan",     coordI:"RT", coordT:"violet", checkin:"on time", reminder:"—" },
    { id:"S-1011", facility:"Northridge",      unit:"ER",             date:"Feb 28", time:"19:00 — 07:00", state:"Cancelled", tone:"rose", coord:"L. Mahoney", coordI:"LM", coordT:"teal", checkin:"—",       reminder:"—" },
  ];
  const list = tab === "Upcoming" ? upcoming : tab === "Active" ? active : completed;

  return (
    <PhoneShell
      header={<AppHeader sub="Operational schedule" title="My Shifts" accent="· this week." trailing={<IconBtn name="search" />} />}
    >
      {/* Hours strip */}
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-ink-900 text-paper p-3.5 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-paper/60">This week</div>
            <div className="mt-0.5 text-[20px] font-medium tabular-nums">36 h <span className="text-paper/50 text-[12px] font-mono">/ 48 cap</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-paper/60">Earnings</div>
            <div className="mt-0.5 text-[20px] font-medium tabular-nums">$2,592</div>
          </div>
          <div className="w-12 h-12 rounded-full ring-2 ring-paper/20 inline-flex items-center justify-center relative">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" stroke="#46b1aa" strokeWidth="3" fill="none" strokeDasharray={`${(36/48)*88} 100`} strokeLinecap="round" /></svg>
            <span className="text-[11px] font-mono">75%</span>
          </div>
        </div>
      </div>

      {/* Tabs + view */}
      <div className="px-4 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1 p-0.5 bg-ink-100 rounded-full">
          {["Upcoming","Active","Completed"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 h-7 rounded-full text-[11px] font-medium ${tab === t ? "bg-white shadow-sm text-ink-900" : "text-ink-600"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-ink-100 rounded-full">
          <button onClick={() => setView("list")} className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${view === "list" ? "bg-white shadow-sm" : ""}`}><Icon name="list" className="w-3.5 h-3.5" /></button>
          <button onClick={() => setView("cal")} className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${view === "cal" ? "bg-white shadow-sm" : ""}`}><Icon name="calendar" className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {view === "cal" && tab === "Upcoming" && (
        <div className="px-4 mt-3">
          <div className="rounded-2xl bg-white border border-ink-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] font-medium">March 2026</div>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 rounded hover:bg-ink-100 inline-flex items-center justify-center"><Icon name="chevron-left" className="w-3 h-3" /></button>
                <button className="w-6 h-6 rounded hover:bg-ink-100 inline-flex items-center justify-center"><Icon name="chevron-right" className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-[10px] font-mono text-ink-500 text-center mb-1">{["S","M","T","W","T","F","S"].map((d,i) => <div key={i}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({length:35}, (_,i) => i - 2).map((d,i) => {
                const real = d > 0 && d <= 31;
                const today = d === 11;
                const has = [12,14,16,19].includes(d);
                const conf = [12,16].includes(d);
                return (
                  <div key={i} className={`aspect-square rounded text-[11px] font-mono flex flex-col items-center justify-center ${today ? "bg-ink-900 text-paper" : real ? "" : "text-ink-300"}`}>
                    <span>{real ? d : ""}</span>
                    {has && <span className={`mt-0.5 w-1 h-1 rounded-full ${conf ? "bg-emerald-500" : "bg-amber-500"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2.5">
        {list.map((s:any, i:number) => (
          <div key={i} className="rounded-2xl bg-white border border-ink-200 p-3.5 relative overflow-hidden">
            {s.live && <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-500" />}
            <div className="flex items-start gap-3">
              <div className="text-center w-12 shrink-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-ink-500">{s.date.split(" ")[0] === "Tonight" || s.date === "Tonight" ? "TONIGHT" : s.date.split(" ").slice(0,1)[0]}</div>
                <div className="text-[18px] font-medium leading-none mt-0.5 tabular-nums">{s.date.split(" ").slice(1)[0] || (s.date === "Tonight" ? "11" : "")}</div>
              </div>
              <div className="w-px self-stretch bg-ink-100" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StateBadge s={s.state} tone={s.tone} pulse={s.live} />
                  <span className="text-[10px] font-mono text-ink-400">{s.id}</span>
                </div>
                <div className="mt-1 text-[14px] font-medium tracking-tight">{s.facility}</div>
                <div className="text-[11px] font-mono text-ink-600">{s.unit}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-ink-600"><Icon name="clock" className="w-3 h-3" />{s.time}{s.live && <span className="text-teal-700">· in shift</span>}</div>
                <div className="mt-2 flex items-center gap-2"><Avatar initials={s.coordI} tone={s.coordT} size={18} /><span className="text-[11px] text-ink-600">{s.coord}</span>{s.checkin !== "—" && <span className="ml-auto text-[10px] font-mono text-ink-500">check-in {s.checkin}</span>}</div>
                <div className="mt-3 flex items-center gap-1.5">
                  {tab === "Active" ? (
                    <>
                      <button className="flex-1 h-9 rounded-full bg-teal-700 text-white text-[12px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="log-out" className="w-3.5 h-3.5" /> Check out</button>
                      <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="message-circle" className="w-3.5 h-3.5" /></button>
                    </>
                  ) : tab === "Upcoming" ? (
                    <>
                      <button className="flex-1 h-9 rounded-full bg-white border border-ink-200 text-[12px] font-medium">View details</button>
                      <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center"><Icon name="message-circle" className="w-3.5 h-3.5" /></button>
                      <button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-amber-700"><Icon name="user-round-x" className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 h-9 rounded-full bg-white border border-ink-200 text-[12px] font-medium">Receipt</button>
                      <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(n => <Icon key={n} name="star" className={`w-3.5 h-3.5 ${n <= (i === 2 ? 3 : 5) ? "text-amber-500 fill-amber-500" : "text-ink-200"}`} />)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}

function StateBadge({ s, tone, pulse }: any) {
  const m: any = {
    green:  "bg-emerald-50 text-emerald-700",
    teal:   "bg-teal-50 text-teal-800",
    amber:  "bg-amber-50 text-amber-700",
    rose:   "bg-rose-50 text-rose-700",
    ink:    "bg-ink-100 text-ink-600",
  };
  const dot: any = { green:"green", teal:"teal", amber:"amber", rose:"red", ink:"ink" };
  return <span className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${m[tone]}`}><Dot tone={dot[tone]} pulse={pulse} />{s}</span>;
}

// ════════════════════════════════════════════════════
// SCREEN 5 · AVAILABILITY
// ════════════════════════════════════════════════════
function S5_Availability() {
  const [grid, setGrid] = useState(() => {
    const g: any = {};
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    days.forEach(d => g[d] = { day: false, night: false });
    g.Mon.night = true; g.Tue.night = true; g.Wed.day = true; g.Thu.day = true; g.Fri.night = true; g.Sat.day = true;
    return g;
  });
  const [prefs, setPrefs] = useState(["Night shifts","Weekends","On-call"]);
  const [facilities, setFacilities] = useState(["Mercy Mt. Sinai","Bayview Care"]);
  const togglePref = (p:string) => setPrefs(prefs.includes(p) ? prefs.filter((x:string) => x !== p) : [...prefs, p]);
  const toggleFac = (f:string) => setFacilities(facilities.includes(f) ? facilities.filter((x:string) => x !== f) : [...facilities, f]);
  const toggleSlot = (d:string, slot:"day"|"night") => setGrid({ ...grid, [d]: { ...grid[d], [slot]: !grid[d][slot] } });

  return (
    <PhoneShell
      header={<AppHeader sub="Workforce participation" title="Availability" accent="· tell us when." trailing={<IconBtn name="check" />} />}
    >
      <div className="p-4 space-y-3">
        {/* Quick actions */}
        <div className="rounded-2xl bg-white border border-ink-200 p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">Quick set</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { l:"Available this weekend", i:"sun",          t:"teal" },
              { l:"Unavailable this week",   i:"x-circle",     t:"rose" },
              { l:"Open to urgent shifts",    i:"siren",        t:"amber" },
              { l:"Nights only · 30 days",    i:"moon",          t:"ink" },
            ].map((q:any) => (
              <button key={q.l} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] ${q.t === "teal" ? "bg-teal-700 text-white border-teal-700" : q.t === "rose" ? "bg-rose-50 text-rose-700 border-rose-200" : q.t === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-ink-700 border-ink-200"}`}>
                <Icon name={q.i} className="w-3.5 h-3.5" /> {q.l}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly grid */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center gap-2"><div className="text-[13px] font-medium tracking-tight">Weekly availability</div><span className="ml-auto text-[10px] font-mono text-ink-500">Mar 9 — 15</span></div>
          <div className="mt-3 space-y-1.5">
            <div className="grid grid-cols-[40px_1fr_1fr] gap-2 text-[9px] font-mono uppercase tracking-wider text-ink-500"><div /><div className="text-center">Day · 7a-7p</div><div className="text-center">Night · 7p-7a</div></div>
            {Object.entries(grid).map(([d, s]: any) => (
              <div key={d} className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center">
                <div className="text-[12px] font-mono text-ink-700">{d}</div>
                <button onClick={() => toggleSlot(d,"day")} className={`h-9 rounded-md border text-[11px] inline-flex items-center justify-center gap-1.5 ${s.day ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-paper/50 border-ink-200 text-ink-400"}`}>
                  <Icon name="sun" className="w-3 h-3" /> {s.day ? "Available" : "—"}
                </button>
                <button onClick={() => toggleSlot(d,"night")} className={`h-9 rounded-md border text-[11px] inline-flex items-center justify-center gap-1.5 ${s.night ? "bg-teal-50 border-teal-200 text-teal-800" : "bg-paper/50 border-ink-200 text-ink-400"}`}>
                  <Icon name="moon" className="w-3 h-3" /> {s.night ? "Available" : "—"}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200" /> Day</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-100 border border-teal-200" /> Night</div>
            <div className="ml-auto text-ink-700 tabular-nums">
              {(Object.values(grid) as { day: boolean; night: boolean }[]).reduce(
                (acc, d) => acc + (d.day ? 1 : 0) + (d.night ? 1 : 0),
                0,
              )}{" "}
              slots open
            </div>
          </div>
        </div>

        {/* Shift type prefs */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[13px] font-medium tracking-tight">Preferred shift types</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Day shifts","Night shifts","Weekends","On-call","Holidays","Back-to-back"].map(p => (
              <button key={p} onClick={() => togglePref(p)} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] ${prefs.includes(p) ? "bg-ink-900 text-paper border-ink-900" : "bg-white text-ink-700 border-ink-200"}`}>
                {prefs.includes(p) && <Icon name="check" className="w-3 h-3" />}{p}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred facilities */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center"><div className="text-[13px] font-medium tracking-tight">Preferred facilities</div><span className="ml-auto text-[11px] font-mono text-ink-500">{facilities.length} selected</span></div>
          <div className="mt-2 space-y-2">
            {[
              { n:"Mercy Mt. Sinai",  s:"ICU · 4.2 mi", t:"teal" },
              { n:"Bayview Care",     s:"Med-Surg · 6.1 mi", t:"sky" },
              { n:"Pinegrove SNF",    s:"Floor 2 · 8.4 mi", t:"violet" },
              { n:"Northridge Hosp",  s:"ER · 11.2 mi", t:"amber" },
            ].map((f:any) => (
              <button key={f.n} onClick={() => toggleFac(f.n)} className="w-full flex items-center gap-2.5 rounded-xl border border-ink-200 bg-paper/40 p-2.5 text-left">
                <Avatar initials={f.n.split(" ").map((w:string) => w[0]).slice(0,2).join("")} tone={f.t} size={32} />
                <div className="flex-1 min-w-0"><div className="text-[12px] font-medium tracking-tight">{f.n}</div><div className="text-[10px] font-mono text-ink-500">{f.s}</div></div>
                <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center ${facilities.includes(f.n) ? "bg-teal-700 text-white" : "border border-ink-300 bg-white"}`}>
                  {facilities.includes(f.n) && <Icon name="check" className="w-3 h-3" strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Location radius */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-center"><div className="text-[13px] font-medium tracking-tight">Travel radius</div><span className="ml-auto text-[12px] font-mono tabular-nums text-teal-700">15 mi</span></div>
          <input type="range" min={1} max={50} defaultValue={15} className="w-full mt-3 accent-teal-700" />
          <div className="flex justify-between text-[10px] font-mono text-ink-500"><span>1 mi</span><span>25 mi</span><span>50+ mi</span></div>
        </div>

        <button className="w-full h-12 rounded-full bg-teal-700 text-white text-[14px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Save availability</button>
        <div className="text-center text-[10px] font-mono text-ink-500">Auto-applies to next 4 weeks · agencies see updates instantly</div>
      </div>
    </PhoneShell>
  );
}

// ════════════════════════════════════════════════════
// SCREEN 6 · CANCELLATION/REPLACEMENT
// ════════════════════════════════════════════════════
function S6_Cancellation() {
  const [reason, setReason] = useState<string|null>("Illness");
  const [findRep, setFindRep] = useState(true);
  return (
    <PhoneShell
      header={<AppHeader sub="REQ-2849 · ICU RN" title="Request cancellation" leading={<button className="w-9 h-9 rounded-full bg-white border border-ink-200 inline-flex items-center justify-center text-ink-700"><Icon name="chevron-left" className="w-4 h-4" /></button>} />}
      footer={
        <div className="px-4 pt-3 pb-1 grid grid-cols-2 gap-2">
          <button className="h-11 rounded-full border border-ink-200 bg-white text-[13px] font-medium">Keep shift</button>
          <button className="h-11 rounded-full bg-rose-600 text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5"><Icon name="send" className="w-3.5 h-3.5" /> Notify coordinator</button>
        </div>
      }
    >
      <div className="p-4 space-y-3">
        {/* Urgency warning */}
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
          <div className="flex items-start gap-2.5">
            <span className="relative inline-flex shrink-0"><span className="absolute inset-0 rounded-full bg-rose-300 ping-slow" /><span className="relative w-7 h-7 rounded-full bg-rose-600 inline-flex items-center justify-center"><Icon name="triangle-alert" className="w-3.5 h-3.5 text-white" /></span></span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5"><span className="text-[10px] font-mono uppercase tracking-[0.12em] text-rose-700">Critical timing</span><span className="text-[10px] font-mono text-rose-600">·  &lt; 12h notice</span></div>
              <div className="text-[13px] font-medium text-rose-800 mt-0.5">Shift starts in <span className="tabular-nums">8h 24m</span></div>
              <div className="text-[11px] text-rose-700 mt-1 leading-snug">Late cancellations may affect your reliability score and trigger an escalation to facility leadership.</div>
            </div>
          </div>
        </div>

        {/* Shift snapshot */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 inline-flex items-center justify-center"><Icon name="building-2" className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium tracking-tight">Mercy Mt. Sinai · ICU</div>
              <div className="text-[11px] font-mono text-ink-600">Tonight · 19:00 — 07:00 · 12h</div>
            </div>
            <div className="text-right"><div className="text-[10px] font-mono text-ink-500">Coordinator</div><div className="text-[12px] font-medium">L. Mahoney</div></div>
          </div>
        </div>

        {/* Reason */}
        <div className="rounded-2xl bg-white border border-ink-200 p-4">
          <div className="text-[13px] font-medium tracking-tight">Reason</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {[
              { l:"Emergency",         i:"siren",            t:"rose" },
              { l:"Illness",           i:"thermometer",      t:"amber" },
              { l:"Schedule conflict", i:"refresh-ccw",      t:"violet" },
              { l:"Transportation",     i:"car",              t:"sky" },
              { l:"Family",             i:"users",            t:"teal" },
              { l:"Other",              i:"more-horizontal",  t:"ink" },
            ].map((r:any) => (
              <button key={r.l} onClick={() => setReason(r.l)} className={`flex items-center gap-2 rounded-xl border p-2.5 ${reason === r.l ? "border-teal-300 bg-teal-50/50" : "border-ink-200 bg-white"}`}>
                <span className={`w-7 h-7 rounded-md inline-flex items-center justify-center bg-${r.t}-50 text-${r.t}-700`}><Icon name={r.i} className="w-3.5 h-3.5" /></span>
                <span className="text-[12px] font-medium">{r.l}</span>
                {reason === r.l && <Icon name="check" className="w-3.5 h-3.5 text-teal-700 ml-auto" />}
              </button>
            ))}
          </div>
          <textarea rows={2} placeholder="Add detail for the coordinator…" className="mt-3 w-full rounded-lg border border-ink-200 bg-paper/50 p-2.5 text-[12px] outline-none focus:border-teal-500" />
        </div>

        {/* Help find replacement */}
        <button onClick={() => setFindRep(!findRep)} className="w-full text-left rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-lg inline-flex items-center justify-center ${findRep ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-600"}`}><Icon name="user-round-search" className="w-5 h-5" /></span>
            <div className="flex-1"><div className="text-[13px] font-medium tracking-tight">Help find a replacement</div><div className="text-[11px] font-mono text-ink-500 mt-0.5">Auto-broadcast to qualified RNs in your network</div></div>
            <span className={`relative w-9 h-5 rounded-full ${findRep ? "bg-teal-700" : "bg-ink-200"}`}><span className={`absolute top-0.5 ${findRep ? "left-[18px]" : "left-0.5"} w-4 h-4 rounded-full bg-white shadow`} /></span>
          </div>
          {findRep && (
            <div className="mt-3 pt-3 border-t border-ink-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-ink-600"><Icon name="zap" className="w-3 h-3 text-teal-700" /> 3 ICU RNs available now within 5 mi</div>
              <div className="flex -space-x-1.5">{[
                { i:"DC", t:"amber" }, { i:"JR", t:"rose" }, { i:"BO", t:"violet" }
              ].map((p:any,i:number) => <span key={i} className="ring-2 ring-white rounded-full"><Avatar initials={p.i} tone={p.t} size={28} /></span>)}</div>
            </div>
          )}
        </button>

        {/* Escalation note */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
          <Icon name="info" className="w-4 h-4 text-amber-700 mt-0.5" />
          <div className="flex-1 text-[11px] text-amber-800 leading-snug">If no replacement is found within <span className="font-mono">2h</span>, this will escalate to the facility's on-duty supervisor.</div>
        </div>
      </div>
    </PhoneShell>
  );
}

export { S1_Notifications, S2_Details, S3_AcceptDecline, S4_MyShifts, S5_Availability, S6_Cancellation };
