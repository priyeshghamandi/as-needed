// Post-signup onboarding wizard
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const { useState, useMemo, useEffect } = React;
const { Icon, Button, Badge, Dot, Eyebrow, Avatar } = window;

type StepId = "welcome" | "team" | "professionals" | "facilities" | "compliance" | "first-request" | "complete";
const STEPS: { id: StepId; label: string; short: string; icon: string }[] = [
  { id: "welcome",        label: "Welcome",                short: "Welcome",        icon: "sparkles" },
  { id: "team",           label: "Operations team",        short: "Team",           icon: "users" },
  { id: "professionals",  label: "Healthcare professionals", short: "Professionals",icon: "stethoscope" },
  { id: "facilities",     label: "Facilities",             short: "Facilities",     icon: "building-2" },
  { id: "compliance",     label: "Compliance",             short: "Compliance",     icon: "shield-check" },
  { id: "first-request",  label: "First staffing request", short: "First request",  icon: "send" },
  { id: "complete",       label: "All set",                short: "Done",           icon: "check" },
];

// ────────────────────────────────────────────────────────────────────────────
// Header / progress
// ────────────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

function Header({ idx, onSkip }: { idx: number; onSkip: () => void }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/85 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-8 h-14 flex items-center gap-6">
        <a className="flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 ml-1 px-1.5 py-0.5 border border-ink-200 rounded">setup</span>
        </a>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] font-mono text-ink-500 hidden md:inline">Step {idx + 1} of {STEPS.length}</span>
          <Avatar initials="LM" tone="teal" size={28} />
          {idx > 0 && idx < STEPS.length - 1 && (
            <button onClick={onSkip} className="text-[12px] font-mono text-ink-500 hover:text-ink-900 px-2 h-7 rounded hover:bg-ink-100">Save & exit</button>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="max-w-[1240px] mx-auto px-8 pb-4 pt-2">
        <ol className="grid grid-cols-7 gap-2">
          {STEPS.map((s, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <li key={s.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-mono border transition ${
                    done ? "bg-teal-700 border-teal-700 text-white" :
                    active ? "bg-ink-900 border-ink-900 text-paper" :
                    "bg-white border-ink-200 text-ink-500"
                  }`}>
                    {done ? <Icon name="check" className="w-3 h-3" strokeWidth={2.5} /> : (i + 1).toString().padStart(2, "0")}
                  </span>
                  <span className={`h-px flex-1 ${done ? "bg-teal-700" : "bg-ink-200"}`} />
                </div>
                <div className={`text-[11px] tracking-tight truncate ${active ? "text-ink-900 font-medium" : "text-ink-500"}`}>{s.short}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Step shell
// ────────────────────────────────────────────────────────────────────────────
function StepShell({ children }: { children: any }) {
  return <div className="max-w-[1100px] mx-auto px-8 py-12 rise-in">{children}</div>;
}

function StepHeader({ eyebrow, heading, italic, sub }: { eyebrow: string; heading: string; italic?: string; sub: string }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 text-[40px] leading-[1.06] tracking-[-0.02em] font-medium max-w-2xl">
        {heading} {italic && <span className="font-serif italic text-teal-800">{italic}</span>}
      </h1>
      <p className="mt-3 text-[15px] text-ink-600 max-w-xl leading-relaxed">{sub}</p>
    </div>
  );
}

function StepFooter({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, skipLabel, onSkip, primary = "ink" }: any) {
  return (
    <div className="mt-10 flex items-center gap-3 border-t border-ink-200 pt-6">
      {onBack && (
        <button onClick={onBack} className="inline-flex items-center gap-2 h-11 px-4 rounded-full border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50">
          <Icon name="arrow-left" className="w-3.5 h-3.5" /> Back
        </button>
      )}
      {skipLabel && (
        <button onClick={onSkip} className="text-[12px] font-mono text-ink-500 hover:text-ink-900 px-3 h-11 rounded hover:bg-ink-100">
          {skipLabel}
        </button>
      )}
      <div className="ml-auto" />
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`inline-flex items-center gap-2 h-11 px-5 rounded-full font-medium tracking-tight text-[14px] transition ${
          nextDisabled ? "bg-ink-200 text-ink-500 cursor-not-allowed" :
          primary === "teal" ? "bg-teal-700 text-white hover:bg-teal-800" :
          "bg-ink-900 text-paper hover:bg-ink-800"
        }`}
      >
        {nextLabel} <Icon name="arrow-right" className="w-4 h-4" />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Welcome
// ────────────────────────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: any) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-paper/0 via-paper/70 to-paper" aria-hidden />
      <StepShell>
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-7">
            <Badge tone="teal"><Dot tone="green" pulse /> Workspace ready</Badge>
            <h1 className="mt-6 text-[56px] leading-[1.02] tracking-[-0.02em] font-medium">
              Welcome to your<br/>
              staffing operations<br/>
              <span className="font-serif italic text-teal-800">workspace.</span>
            </h1>
            <p className="mt-5 text-[17px] text-ink-600 max-w-xl leading-relaxed">
              Let's set up your agency so you can start coordinating staffing requests and
              workforce availability. We'll cover six quick steps — invite your team, add your
              workforce, connect facilities, and create your first request.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 px-3 h-9 rounded-full border border-ink-200 bg-white text-[12px] font-mono text-ink-700">
              <Icon name="timer" className="w-3.5 h-3.5 text-teal-700" />
              Estimated setup time · 5–10 minutes
              <span className="text-ink-300">·</span>
              <span className="text-ink-500">you can save & resume any time</span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={onNext}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink-900 text-paper font-medium tracking-tight text-[14px] hover:bg-ink-800"
              >
                Start setup <Icon name="arrow-right" className="w-4 h-4" />
              </button>
              <a className="text-[13px] text-ink-700 hover:underline">I'll do this later</a>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-ink-200 bg-white shadow-card p-6">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">What you'll set up</div>
              <ul className="mt-4 divide-y divide-ink-100">
                {STEPS.slice(1, -1).map((s, i) => (
                  <li key={s.id} className="py-3 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center shrink-0">
                      <Icon name={s.icon} className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <div className="text-[13px] font-medium tracking-tight">{s.label}</div>
                        <div className="text-[10px] font-mono text-ink-400">~{[1,2,1,1,1][i]} min</div>
                      </div>
                      <div className="text-[11px] font-mono text-ink-500">
                        {[
                          "Coordinators, recruiters, compliance",
                          "Invite or import RNs, CNAs, EMTs",
                          "Hospitals, SNFs, clinics",
                          "Credentials & certifications",
                          "Coordinate your first shift",
                        ][i]}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </StepShell>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Field primitives
// ────────────────────────────────────────────────────────────────────────────
function Input(props: any) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition ${props.className ?? ""}`}
    />
  );
}
function Select({ children, ...rest }: any) {
  return (
    <div className="relative">
      <select {...rest} className="w-full h-11 px-3.5 pr-10 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none appearance-none transition">
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500">
        <Icon name="chevron-down" className="w-4 h-4" />
      </span>
    </div>
  );
}
function Field({ label, sub, children }: any) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12px] font-medium tracking-tight text-ink-800">{label}</div>
        {sub && <div className="text-[10px] font-mono text-ink-500">{sub}</div>}
      </div>
      {children}
    </label>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Team
// ────────────────────────────────────────────────────────────────────────────
type TeamRow = { id: number; email: string; role: string };
const TEAM_ROLES = ["Staffing Coordinator","Recruiter","Compliance Manager","Operations Manager"];

function TeamStep({ data, set, onBack, onNext, onSkip }: any) {
  const rows: TeamRow[] = data.team.length ? data.team : [{ id: 1, email: "", role: "Staffing Coordinator" }];

  function setRows(rs: TeamRow[]) { set({ team: rs }); }
  function update(i: number, patch: Partial<TeamRow>) { setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)); }
  function add() { setRows([...rows, { id: Date.now(), email: "", role: "Staffing Coordinator" }]); }
  function remove(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 02 · Operations team" heading="Invite your" italic="operations team." sub="Add staffing coordinators, recruiters, compliance staff, and managers. They'll get an email to set up their accounts." />

      <div className="mt-10 grid grid-cols-12 gap-10 items-start">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-ink-200 bg-white">
            <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
              <div className="col-span-7">Work email</div>
              <div className="col-span-4">Role</div>
              <div className="col-span-1"></div>
            </div>
            {rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b last:border-0 border-ink-100">
                <div className="col-span-7">
                  <Input value={r.email} onChange={(e: any) => update(i, { email: e.target.value })} placeholder="name@apexstaffing.com" type="email" />
                </div>
                <div className="col-span-4">
                  <Select value={r.role} onChange={(e: any) => update(i, { role: e.target.value })}>
                    {TEAM_ROLES.map(role => <option key={role}>{role}</option>)}
                  </Select>
                </div>
                <div className="col-span-1 flex justify-end">
                  {rows.length > 1 && (
                    <button onClick={() => remove(i)} className="w-8 h-8 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500">
                      <Icon name="x" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="px-4 py-2.5">
              <button onClick={add} className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-dashed border-ink-300 text-[12px] font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-400">
                <Icon name="plus" className="w-3.5 h-3.5" /> Add another
              </button>
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-ink-200 bg-paper/40 p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Roles · what they unlock</div>
            <ul className="mt-3 space-y-2.5 text-[12px] text-ink-700">
              <RoleHint label="Staffing Coordinator" hint="Owns request queue & fulfillment" />
              <RoleHint label="Recruiter"            hint="Sources & onboards professionals" />
              <RoleHint label="Compliance Manager"   hint="Credentials, expirations, audits" />
              <RoleHint label="Operations Manager"   hint="Cross-team visibility & reports" />
            </ul>
          </div>
          <div className="mt-3 text-[11px] font-mono text-ink-500 px-1">
            Invitations expire in 7 days. You can resend or revoke them anytime.
          </div>
        </aside>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} skipLabel="Skip for now" onSkip={onSkip} />
    </StepShell>
  );
}
function RoleHint({ label, hint }: { label: string; hint: string }) {
  return (
    <li className="flex items-start gap-2">
      <Icon name="shield" className="w-3.5 h-3.5 text-teal-700 mt-0.5" />
      <div>
        <div className="font-medium tracking-tight text-ink-900">{label}</div>
        <div className="text-ink-500">{hint}</div>
      </div>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Healthcare professionals
// ────────────────────────────────────────────────────────────────────────────
type HcpRow = { id: number; name: string; role: string; phone: string; email: string; location: string };
const HCP_ROLES = ["RN · ICU","RN · Med-Surg","RN · ER","CNA","EMT","LPN","Allied health"];

function ProfessionalsStep({ data, set, onBack, onNext, onSkip }: any) {
  const [mode, setMode] = useState<"csv" | "invite" | "manual">(data.hcpMode ?? "manual");
  const rows: HcpRow[] = data.hcps.length ? data.hcps : [{ id: 1, name: "", role: "RN · ICU", phone: "", email: "", location: "" }];

  function setRows(rs: HcpRow[]) { set({ hcps: rs }); }
  function update(i: number, patch: Partial<HcpRow>) { setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)); }
  function add() { setRows([...rows, { id: Date.now(), name: "", role: "RN · ICU", phone: "", email: "", location: "" }]); }
  function remove(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }

  function setModeAndPersist(m: "csv"|"invite"|"manual") { setMode(m); set({ hcpMode: m }); }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 03 · Workforce" heading="Add your healthcare" italic="professionals." sub="Import or invite RNs and healthcare professionals into your staffing network." />

      <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-ink-200 bg-white">
        {[
          { id: "csv",     label: "Upload CSV",       icon: "upload" },
          { id: "invite",  label: "Invite via SMS/email", icon: "send" },
          { id: "manual",  label: "Add manually",      icon: "user-plus" },
        ].map((t: any) => (
          <button
            key={t.id}
            onClick={() => setModeAndPersist(t.id)}
            className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-[13px] tracking-tight ${
              mode === t.id ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-50"
            }`}
          >
            <Icon name={t.icon} className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-12 gap-10 items-start">
        <div className="col-span-12 lg:col-span-8">
          {mode === "csv" && <CsvDrop />}
          {mode === "invite" && <InvitePanel />}
          {mode === "manual" && (
            <div className="rounded-xl border border-ink-200 bg-white">
              <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Location</div>
              </div>
              {rows.map((r, i) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 border-b last:border-0 border-ink-100">
                  <div className="col-span-3"><Input value={r.name} onChange={(e: any) => update(i, { name: e.target.value })} placeholder="A. Martinez" /></div>
                  <div className="col-span-2"><Select value={r.role} onChange={(e: any) => update(i, { role: e.target.value })}>{HCP_ROLES.map(x => <option key={x}>{x}</option>)}</Select></div>
                  <div className="col-span-2"><Input value={r.phone} onChange={(e: any) => update(i, { phone: e.target.value })} placeholder="(555) 010-2841" /></div>
                  <div className="col-span-3"><Input value={r.email} onChange={(e: any) => update(i, { email: e.target.value })} placeholder="rn@email.com" type="email" /></div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Input value={r.location} onChange={(e: any) => update(i, { location: e.target.value })} placeholder="Bay Area" />
                    {rows.length > 1 && (
                      <button onClick={() => remove(i)} className="shrink-0 w-8 h-8 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500"><Icon name="x" className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))}
              <div className="px-3 py-2.5">
                <button onClick={add} className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-dashed border-ink-300 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
                  <Icon name="plus" className="w-3.5 h-3.5" /> Add another
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-teal-50/60 border border-teal-200 px-4 py-3 flex items-start gap-2.5">
            <Icon name="info" className="w-4 h-4 text-teal-700 mt-0.5" />
            <div className="text-[12px] text-teal-900 leading-relaxed">
              Healthcare professionals join through agency invitation. They'll receive a link to
              set up their account, upload credentials, and start receiving shift offers.
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-ink-200 bg-paper/40 p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">In your workforce so far</div>
            <div className="mt-2 text-[36px] font-medium tabular-nums tracking-tight">{rows.filter(r => r.name).length}</div>
            <div className="text-[11px] font-mono text-ink-500">of an unlimited roster</div>
            <div className="mt-4 pt-4 border-t border-ink-200 text-[11px] font-mono text-ink-600 space-y-1.5">
              <div className="flex items-center gap-2"><Icon name="file-spreadsheet" className="w-3.5 h-3.5 text-teal-700" /> CSV template available</div>
              <div className="flex items-center gap-2"><Icon name="message-circle" className="w-3.5 h-3.5 text-teal-700" /> Bulk invite up to 500 at once</div>
              <div className="flex items-center gap-2"><Icon name="shield-check" className="w-3.5 h-3.5 text-teal-700" /> Compliance prompts on first sign-in</div>
            </div>
          </div>
        </aside>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} skipLabel="Skip for now" onSkip={onSkip} />
    </StepShell>
  );
}

function CsvDrop() {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e: any) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e: any) => { e.preventDefault(); setHover(false); }}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition ${hover ? "border-teal-500 bg-teal-50/50" : "border-ink-200 bg-white"}`}
    >
      <span className="inline-flex w-12 h-12 rounded-full bg-teal-50 text-teal-700 items-center justify-center">
        <Icon name="upload-cloud" className="w-6 h-6" />
      </span>
      <div className="mt-4 text-[16px] font-medium tracking-tight">Drop a CSV file here</div>
      <div className="mt-1 text-[12px] font-mono text-ink-500">name · role · phone · email · location</div>
      <div className="mt-4 inline-flex items-center gap-2">
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50">
          <Icon name="file-up" className="w-4 h-4" /> Browse files
        </button>
        <a className="text-[12px] font-mono text-teal-700 hover:underline">Download template</a>
      </div>
    </div>
  );
}

function InvitePanel() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <Field label="Phone numbers or emails" sub="Comma- or newline-separated">
        <textarea rows={5} className="w-full px-3.5 py-2.5 rounded-lg border border-ink-200 bg-white text-[14px] font-mono tracking-tight focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" placeholder={"a.martinez@gmail.com\n+1 555 010 2841\nk.park@gmail.com"} />
      </Field>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Field label="Default role">
          <Select defaultValue="RN · ICU">{HCP_ROLES.map(x => <option key={x}>{x}</option>)}</Select>
        </Field>
        <Field label="Channel">
          <Select defaultValue="both"><option value="both">SMS + Email</option><option value="sms">SMS only</option><option value="email">Email only</option></Select>
        </Field>
      </div>
      <div className="mt-3 text-[11px] font-mono text-ink-500">Invitations include credential setup and your agency name.</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Facilities
// ────────────────────────────────────────────────────────────────────────────
type FacilityRow = { id: number; name: string; type: string; contact: string; email: string; phone: string; location: string };
const FAC_TYPES = ["Hospital","Nursing Home","Clinic","Assisted Living","Home Healthcare"];

function FacilitiesStep({ data, set, onBack, onNext, onSkip }: any) {
  const rows: FacilityRow[] = data.facilities.length ? data.facilities : [{ id: 1, name: "", type: "Hospital", contact: "", email: "", phone: "", location: "" }];
  function setRows(rs: FacilityRow[]) { set({ facilities: rs }); }
  function update(i: number, patch: Partial<FacilityRow>) { setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)); }
  function add() { setRows([...rows, { id: Date.now(), name: "", type: "Hospital", contact: "", email: "", phone: "", location: "" }]); }
  function remove(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 04 · Facilities" heading="Connect your" italic="facilities and customers." sub="Connect hospitals, clinics, nursing homes, and healthcare facilities. Each gets a portal to submit and track requests." />

      <div className="mt-10 space-y-3">
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center"><Icon name="building-2" className="w-4 h-4" /></span>
              <div className="text-[12px] font-mono text-ink-500">Facility {String(i + 1).padStart(2, "0")}</div>
              <div className="ml-auto">
                {rows.length > 1 && (
                  <button onClick={() => remove(i)} className="text-[11px] font-mono text-ink-500 hover:text-rose-700 px-2 h-7 rounded hover:bg-rose-50 inline-flex items-center gap-1.5">
                    <Icon name="trash-2" className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-5"><Field label="Facility name"><Input value={r.name} onChange={(e: any) => update(i, { name: e.target.value })} placeholder="Mercy Mt. Sinai" /></Field></div>
              <div className="col-span-12 md:col-span-4"><Field label="Facility type"><Select value={r.type} onChange={(e: any) => update(i, { type: e.target.value })}>{FAC_TYPES.map(x => <option key={x}>{x}</option>)}</Select></Field></div>
              <div className="col-span-12 md:col-span-3"><Field label="Location"><Input value={r.location} onChange={(e: any) => update(i, { location: e.target.value })} placeholder="San Francisco, CA" /></Field></div>
              <div className="col-span-12 md:col-span-4"><Field label="Contact person"><Input value={r.contact} onChange={(e: any) => update(i, { contact: e.target.value })} placeholder="Director of Nursing" /></Field></div>
              <div className="col-span-12 md:col-span-4"><Field label="Email"><Input value={r.email} onChange={(e: any) => update(i, { email: e.target.value })} placeholder="dir@mercyhealth.org" type="email" /></Field></div>
              <div className="col-span-12 md:col-span-4"><Field label="Phone"><Input value={r.phone} onChange={(e: any) => update(i, { phone: e.target.value })} placeholder="(555) 010-2841" /></Field></div>
            </div>
          </div>
        ))}
        <button onClick={add} className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-ink-300 text-[13px] font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-400">
          <Icon name="plus" className="w-4 h-4" /> Add another facility
        </button>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} skipLabel="Skip for now" onSkip={onSkip} />
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Compliance
// ────────────────────────────────────────────────────────────────────────────
const COMPLIANCE_ITEMS = [
  { id: "rn",       icon: "id-card",      title: "RN License",                sub: "Per-state, with expiration tracking",   defaultOn: true },
  { id: "cpr",      icon: "heart-pulse",  title: "CPR Certification",         sub: "BLS, ACLS, PALS — auto-reminders",      defaultOn: true },
  { id: "bg",       icon: "user-check",   title: "Background Check",          sub: "Refresh annually, vendor-agnostic",     defaultOn: true },
  { id: "vax",      icon: "syringe",      title: "Vaccination Records",       sub: "Flu, Hep B, MMR, COVID — by facility",  defaultOn: false },
  { id: "tb",       icon: "shield-plus",  title: "TB Test",                   sub: "Annual, with reminder cadence",          defaultOn: false },
  { id: "specialty",icon: "award",        title: "Specialty Certifications",  sub: "Per-role: ICU, ER, OR, L&D…",            defaultOn: false },
];

function ComplianceStep({ data, set, onBack, onNext, onSkip }: any) {
  const initial: Record<string, boolean> = useMemo(() => {
    if (Object.keys(data.compliance).length) return data.compliance;
    const o: Record<string, boolean> = {};
    COMPLIANCE_ITEMS.forEach(it => o[it.id] = it.defaultOn);
    return o;
  }, []);
  const [picks, setPicks] = useState<Record<string, boolean>>(initial);
  function toggle(id: string) {
    const next = { ...picks, [id]: !picks[id] };
    setPicks(next);
    set({ compliance: next });
  }
  const enabled = COMPLIANCE_ITEMS.filter(i => picks[i.id]).length;

  return (
    <StepShell>
      <StepHeader eyebrow="Step 05 · Compliance" heading="Configure compliance" italic="requirements." sub="Define the credentials and certifications required for staffing assignments. AsNeeded enforces these automatically when matching." />

      <div className="mt-10 grid grid-cols-12 gap-4">
        {COMPLIANCE_ITEMS.map(it => {
          const on = !!picks[it.id];
          return (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              className={`col-span-12 sm:col-span-6 lg:col-span-4 text-left rounded-xl border p-5 transition relative overflow-hidden ${
                on ? "border-teal-700 bg-teal-50/40 ring-2 ring-teal-100" : "border-ink-200 bg-white hover:border-ink-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`w-9 h-9 rounded-md inline-flex items-center justify-center ${on ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-600"}`}>
                  <Icon name={it.icon} className="w-4 h-4" />
                </span>
                <span className={`w-5 h-5 rounded-md border inline-flex items-center justify-center ${on ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-ink-300"}`}>
                  {on && <Icon name="check" className="w-3 h-3" strokeWidth={3} />}
                </span>
              </div>
              <div className="mt-3 text-[15px] font-medium tracking-tight">{it.title}</div>
              <div className="mt-1 text-[12px] text-ink-600 leading-relaxed">{it.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-paper/60 border border-ink-200 px-4 py-3 flex items-center gap-3">
        <Badge tone="teal">{enabled} enabled</Badge>
        <div className="text-[12px] text-ink-700">
          AsNeeded will only surface professionals with these credentials current when matching shifts.
        </div>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} skipLabel="Skip for now" onSkip={onSkip} />
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. First request
// ────────────────────────────────────────────────────────────────────────────
function FirstRequestStep({ data, set, onBack, onNext }: any) {
  const facs = data.facilities.filter((f: FacilityRow) => f.name).map((f: FacilityRow) => f.name);
  const [facility, setFacility] = useState(data.firstRequest?.facility ?? facs[0] ?? "Mercy Mt. Sinai");
  const [role, setRole]         = useState(data.firstRequest?.role ?? "RN");
  const [count, setCount]       = useState(data.firstRequest?.count ?? 2);
  const [date, setDate]         = useState(data.firstRequest?.date ?? "Tomorrow · Wed, Mar 11");
  const [start, setStart]       = useState(data.firstRequest?.start ?? "19:00");
  const [end, setEnd]           = useState(data.firstRequest?.end ?? "07:00");
  const [specialty, setSpecialty] = useState(data.firstRequest?.specialty ?? "ICU");
  const [notes, setNotes]       = useState(data.firstRequest?.notes ?? "");

  useEffect(() => {
    set({ firstRequest: { facility, role, count, date, start, end, specialty, notes } });
  }, [facility, role, count, date, start, end, specialty, notes]);

  const ready = facility && role && count > 0;

  return (
    <StepShell>
      <StepHeader eyebrow="Step 06 · First request" heading="Create your first" italic="staffing request." sub="Start coordinating your first staffing assignment. Your team and workforce will see it the moment you publish." />

      <div className="mt-10 grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-7 rounded-xl border border-ink-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Facility">
              <Select value={facility} onChange={(e: any) => setFacility(e.target.value)}>
                {[...new Set(["Mercy Mt. Sinai","Bayview Care","Pinegrove SNF", ...facs])].map(f => <option key={f}>{f}</option>)}
              </Select>
            </Field></div>
            <Field label="Role needed">
              <Select value={role} onChange={(e: any) => setRole(e.target.value)}>
                {["RN","CNA","EMT","LPN","Allied health"].map(r => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Number of professionals">
              <div className="flex items-center gap-2">
                <button onClick={() => setCount(Math.max(1, count - 1))} className="w-11 h-11 rounded-lg border border-ink-200 bg-white hover:bg-ink-50"><Icon name="minus" className="w-4 h-4" /></button>
                <Input value={count} onChange={(e: any) => setCount(Math.max(1, +e.target.value || 1))} type="number" className="text-center" />
                <button onClick={() => setCount(count + 1)} className="w-11 h-11 rounded-lg border border-ink-200 bg-white hover:bg-ink-50"><Icon name="plus" className="w-4 h-4" /></button>
              </div>
            </Field>
            <div className="col-span-2"><Field label="Shift date">
              <Select value={date} onChange={(e: any) => setDate(e.target.value)}>
                {["Tonight · Tue, Mar 10","Tomorrow · Wed, Mar 11","Thu, Mar 12","Fri, Mar 13","Sat, Mar 14"].map(d => <option key={d}>{d}</option>)}
              </Select>
            </Field></div>
            <Field label="Start time"><Input value={start} onChange={(e: any) => setStart(e.target.value)} type="time" /></Field>
            <Field label="End time"><Input value={end} onChange={(e: any) => setEnd(e.target.value)} type="time" /></Field>
            <div className="col-span-2"><Field label="Specialty">
              <Select value={specialty} onChange={(e: any) => setSpecialty(e.target.value)}>
                {["ICU","Med-Surg","ER","L&D","OR","Telemetry","Pediatrics"].map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field></div>
            <div className="col-span-2"><Field label="Notes">
              <textarea value={notes} onChange={(e: any) => setNotes(e.target.value)} rows={3}
                placeholder="e.g. Need 2 RNs tomorrow from 7 PM to 7 AM."
                className="w-full px-3.5 py-2.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
              />
            </Field></div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="col-span-12 lg:col-span-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2 px-1">How your team will see it</div>
          <div className="rounded-xl border border-ink-200 bg-white shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2 bg-ink-50/60">
              <span className="text-[10px] font-mono text-ink-500">REQ-2842</span>
              <Badge tone="amber"><Dot tone="amber" pulse /> matching</Badge>
              <span className="ml-auto text-[10px] font-mono text-ink-500">draft preview</span>
            </div>
            <div className="p-4">
              <div className="text-[15px] font-medium tracking-tight">{facility} · {specialty}</div>
              <div className="text-[12px] font-mono text-ink-600 mt-1">{date} · {start}–{end}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-mono">
                <Spec label="Role" value={role} />
                <Spec label="Need" value={`${count} ${role}`} />
                <Spec label="Shift" value={`${start}–${end}`} />
              </div>
              {notes && (
                <div className="mt-3 rounded-md bg-paper/60 border border-ink-100 p-2.5 text-[12px] text-ink-700 leading-snug">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block mb-0.5">Notes</span>
                  {notes}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-ink-100">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-2">When you publish</div>
                <ul className="text-[12px] space-y-1.5 text-ink-700">
                  <li className="flex items-center gap-2"><Icon name="wand-2" className="w-3.5 h-3.5 text-teal-700" /> Auto-match against compliant {role}s</li>
                  <li className="flex items-center gap-2"><Icon name="send" className="w-3.5 h-3.5 text-teal-700" /> Send offers · push + SMS</li>
                  <li className="flex items-center gap-2"><Icon name="activity" className="w-3.5 h-3.5 text-teal-700" /> Track fulfillment in real time</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Create staffing request" nextDisabled={!ready} primary="teal" />
    </StepShell>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink-100 bg-paper/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="text-[12px] text-ink-900 font-sans tracking-tight">{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Complete + dashboard preview
// ────────────────────────────────────────────────────────────────────────────
function CompleteStep({ data }: any) {
  const counts = {
    team: data.team.filter((r: TeamRow) => r.email).length,
    hcps: data.hcps.filter((r: HcpRow) => r.name).length || (data.hcpMode === "invite" ? 12 : 0),
    facilities: data.facilities.filter((r: FacilityRow) => r.name).length,
    request: data.firstRequest?.facility ? 1 : 0,
  };
  return (
    <div className="relative">
      {/* Dashboard backdrop */}
      <DashboardBackdrop />
      <div className="absolute inset-0 bg-paper/60 backdrop-blur-[2px]" aria-hidden />

      <div className="relative max-w-[920px] mx-auto px-8 py-16 pop-in">
        <div className="rounded-2xl bg-white shadow-deep ring-1 ring-ink-900/5 p-10 text-center">
          <span className="inline-flex w-14 h-14 rounded-full bg-teal-50 text-teal-700 items-center justify-center">
            <Icon name="check" className="w-7 h-7" strokeWidth={2.4} />
          </span>
          <h1 className="mt-6 text-[40px] leading-[1.06] tracking-[-0.02em] font-medium">
            Your staffing operations workspace is
            <span className="font-serif italic text-teal-800"> ready.</span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-600 max-w-md mx-auto">
            You're set up. Drop into the operations console — your first request is live and
            matching against your workforce now.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <Summary icon="users"        label="Team members"            value={counts.team} sub="invited" />
            <Summary icon="stethoscope"  label="Healthcare professionals" value={counts.hcps} sub={data.hcpMode === "csv" ? "imported" : data.hcpMode === "invite" ? "invited" : "added"} />
            <Summary icon="building-2"   label="Facilities"               value={counts.facilities} sub="connected" />
            <Summary icon="send"         label="First request"            value={counts.request} sub="live · matching" highlight />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="ops.html" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink-900 text-paper font-medium tracking-tight text-[14px] hover:bg-ink-800">
              Go to operations dashboard <Icon name="arrow-right" className="w-4 h-4" />
            </a>
            <a className="text-[13px] text-ink-700 hover:underline">Tour the dashboard first</a>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono text-ink-500">
            <Dot tone="green" pulse /> All systems operational · workspace synced
          </div>
        </div>
      </div>
    </div>
  );
}
function Summary({ icon, label, value, sub, highlight = false }: any) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-teal-700 bg-teal-50/50" : "border-ink-200 bg-paper/40"}`}>
      <div className={`w-7 h-7 rounded-md inline-flex items-center justify-center ${highlight ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-700"}`}>
        <Icon name={icon} className="w-3.5 h-3.5" />
      </div>
      <div className="mt-2 text-[24px] font-medium tracking-tight tabular-nums">{value}</div>
      <div className="text-[11px] tracking-tight text-ink-800">{label}</div>
      <div className="text-[10px] font-mono text-ink-500">{sub}</div>
    </div>
  );
}

function DashboardBackdrop() {
  // Compact, decorative dashboard preview behind completion card
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-8 pt-8">
        <div className="rounded-2xl bg-white shadow-lifted ring-1 ring-ink-900/5 overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-9 border-b border-ink-100 bg-ink-50/60">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-ink-200" />)}
            </div>
            <div className="ml-3 text-[11px] font-mono text-ink-500">app.asneeded.health · operations</div>
            <div className="ml-auto text-[11px] font-mono text-ink-500 inline-flex items-center gap-1.5"><Dot tone="green" pulse /> live</div>
          </div>
          <div className="grid grid-cols-12 gap-px bg-ink-100">
            <div className="col-span-3 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Open requests</div>
              <div className="text-[28px] font-medium tabular-nums">12</div>
              <div className="mt-3 text-[10px] font-mono text-ink-500">across 4 facilities</div>
            </div>
            <div className="col-span-3 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Available RNs</div>
              <div className="text-[28px] font-medium tabular-nums">28</div>
              <div className="mt-3 text-[10px] font-mono text-emerald-700">credentials current</div>
            </div>
            <div className="col-span-3 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Compliance alerts</div>
              <div className="text-[28px] font-medium tabular-nums text-amber-700">3</div>
              <div className="mt-3 text-[10px] font-mono text-ink-500">renewing in 7d</div>
            </div>
            <div className="col-span-3 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Fill rate</div>
              <div className="text-[28px] font-medium tabular-nums">93%</div>
              <div className="mt-3 text-[10px] font-mono text-emerald-700">+6 pts WoW</div>
            </div>
            <div className="col-span-7 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2">Urgent shifts</div>
              {["Mercy ICU · 2 of 3 filled","Bayview MS · 4 of 4 filled","Pinegrove F2 · 1 of 2 filled"].map((l, i) => (
                <div key={i} className="text-[12px] py-1.5 border-t first:border-0 border-ink-100 flex items-center gap-2">
                  <Dot tone={i === 1 ? "green" : "amber"} pulse={i !== 1} />
                  <span className="flex-1">{l}</span>
                  <span className="font-mono text-[10px] text-ink-500">tonight</span>
                </div>
              ))}
            </div>
            <div className="col-span-5 bg-white p-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2">Coordinator activity</div>
              {[
                { who: "L. Mahoney", what: "auto-matched 7 RNs · REQ-2842" },
                { who: "R. Tan",     what: "recovered cancellation" },
                { who: "E. Vargas",  what: "approved compliance docs" },
              ].map((a, i) => (
                <div key={i} className="text-[12px] py-1.5 border-t first:border-0 border-ink-100 flex items-center gap-2">
                  <Dot tone="teal" />
                  <span className="font-medium tracking-tight">{a.who}</span>
                  <span className="text-ink-500 truncate">{a.what}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────────────────────────────────
function App() {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<any>({ team: [], hcps: [], hcpMode: "manual", facilities: [], compliance: {}, firstRequest: null });
  function update(patch: any) { setData((d: any) => ({ ...d, ...patch })); }
  const next = () => setStepIdx(i => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIdx(i => Math.max(0, i - 1));
  const skip = () => next();
  const exit = () => { window.location.href = "index.html"; };

  const id = STEPS[stepIdx].id;
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <Header idx={stepIdx} onSkip={exit} />
      <main key={id}>
        {id === "welcome"        && <WelcomeStep onNext={next} />}
        {id === "team"           && <TeamStep data={data} set={update} onBack={back} onNext={next} onSkip={skip} />}
        {id === "professionals"  && <ProfessionalsStep data={data} set={update} onBack={back} onNext={next} onSkip={skip} />}
        {id === "facilities"     && <FacilitiesStep data={data} set={update} onBack={back} onNext={next} onSkip={skip} />}
        {id === "compliance"     && <ComplianceStep data={data} set={update} onBack={back} onNext={next} onSkip={skip} />}
        {id === "first-request"  && <FirstRequestStep data={data} set={update} onBack={back} onNext={next} />}
        {id === "complete"       && <CompleteStep data={data} />}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
})();
