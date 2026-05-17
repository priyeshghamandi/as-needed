"use client";

import { useState, type ReactNode } from "react";
import { Icon, Badge, Dot, Eyebrow } from "@/components/primitives";
import { AgencySignupForm } from "@/components/agency-signup-form";

type Step = "choose" | "agency-form" | "agency-success" | "facility-form" | "facility-success" | "invite-code";

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

function TopNav({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/80 border-b border-ink-200/60">
      <div className="max-w-[1240px] mx-auto px-8 h-14 flex items-center gap-6">
        <a href="index.html" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 ml-1 px-1.5 py-0.5 border border-ink-200 rounded">ops</span>
        </a>
        {step !== "choose" && (
          <button onClick={onBack} className="ml-2 inline-flex items-center gap-1.5 text-[12px] font-mono text-ink-600 hover:text-ink-900 px-2 py-1 rounded hover:bg-ink-100">
            <Icon name="arrow-left" className="w-3.5 h-3.5" /> Back to options
          </button>
        )}
        <div className="ml-auto flex items-center gap-3 text-[13px]">
          <span className="text-ink-500 hidden md:inline">Already on AsNeeded?</span>
          <a href="/login" className="text-ink-900 hover:underline">Sign in</a>
        </div>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Choose page
// ────────────────────────────────────────────────────────────────────────────
function Chooser({ go }: { go: (s: Step) => void }) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-grid opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-paper/0 via-paper/70 to-paper" aria-hidden />
      <div className="relative max-w-[1100px] mx-auto px-8 pt-16 pb-24">
        <Eyebrow>Get started · choose your path</Eyebrow>
        <h1 className="mt-6 text-[52px] leading-[1.04] tracking-[-0.02em] font-medium max-w-3xl">
          Get started with your healthcare
          <span className="font-serif italic text-teal-800"> staffing workspace.</span>
        </h1>
        <p className="mt-5 text-[17px] text-ink-600 max-w-2xl leading-relaxed">
          Create an agency workspace or connect with a staffing agency to manage healthcare
          staffing requests.
        </p>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-12 gap-6">
          {/* Primary — Agency */}
          <div className="col-span-12 lg:col-span-7 relative rounded-2xl border border-teal-700 bg-ink-950 text-paper p-8 shadow-deep overflow-hidden">
            <div className="absolute -right-24 -top-24 w-[320px] h-[320px] rounded-full bg-teal-700/30 blur-3xl" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between">
                <Badge tone="dark" className="!bg-teal-700 !text-white !border-teal-700">
                  <Icon name="briefcase-medical" className="w-3 h-3" /> For staffing agencies
                </Badge>
                <span className="text-[11px] font-mono text-paper/50 inline-flex items-center gap-1.5">
                  <Dot tone="green" pulse /> recommended
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-teal-300">
                <span className="block w-4 h-px bg-teal-300/60" />
                01
              </div>
              <h2 className="mt-3 text-[34px] leading-[1.05] tracking-[-0.02em] font-medium text-paper">
                I run a staffing agency
              </h2>
              <p className="mt-3 text-[15px] text-paper/70 max-w-md leading-relaxed">
                Create a workspace to manage workforce availability, staffing requests,
                compliance, shifts, cancellations, and facility coordination.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 max-w-lg">
                {[
                  "Workforce availability",
                  "Compliance & credentials",
                  "Staffing request pipeline",
                  "Cancellation recovery",
                  "Multi-facility coordination",
                  "Coordinator dashboards",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-paper/85">
                    <Icon name="check" className="w-3.5 h-3.5 text-teal-300" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => go("agency-form")}
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-paper text-ink-900 font-medium tracking-tight text-[14px] hover:bg-white"
                >
                  Create agency workspace <Icon name="arrow-right" className="w-4 h-4" />
                </button>
                <span className="text-[12px] font-mono text-paper/50">14-day operations trial · no card</span>
              </div>
            </div>
          </div>

          {/* Secondary — Facility */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-ink-200 bg-white p-8 shadow-card flex flex-col">
            <Badge tone="neutral">
              <Icon name="building-2" className="w-3 h-3" /> For facilities & customers
            </Badge>

            <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-ink-500">
              <span className="block w-4 h-px bg-ink-300" />
              02
            </div>
            <h2 className="mt-3 text-[28px] leading-[1.1] tracking-[-0.02em] font-medium">
              I need healthcare staff
            </h2>
            <p className="mt-3 text-[14px] text-ink-600 leading-relaxed">
              Request access to submit staffing needs, track fulfillment, and coordinate
              with your staffing agency.
            </p>

            <ul className="mt-5 space-y-2">
              {["Submit staffing requests","Track fulfillment in real time","See assigned professionals","Communicate with your agency"].map(f => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-ink-800">
                  <Icon name="check" className="w-3.5 h-3.5 text-teal-700" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8 space-y-3">
              <button
                onClick={() => go("facility-form")}
                className="w-full inline-flex items-center justify-between h-11 px-4 rounded-full bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800"
              >
                Request access <Icon name="arrow-right" className="w-4 h-4" />
              </button>
              <button
                onClick={() => go("invite-code")}
                className="w-full inline-flex items-center justify-between h-11 px-4 rounded-full border border-ink-200 bg-white text-ink-800 text-[14px] font-medium hover:bg-ink-50"
              >
                Have an invite code? Join your agency portal
                <Icon name="key-round" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Healthcare professional note */}
        <div className="mt-8 rounded-xl border border-ink-200 bg-paper/40 p-5 flex items-start gap-4">
          <span className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 inline-flex items-center justify-center shrink-0">
            <Icon name="stethoscope" className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-[14px] font-medium tracking-tight">For healthcare professionals — RNs, CNAs, EMTs</div>
              <Badge tone="teal">invite only</Badge>
            </div>
            <p className="mt-1.5 text-[13px] text-ink-600 leading-relaxed max-w-3xl">
              Healthcare professionals join through an invitation from their staffing agency.
              If you received an invite, use the link in your email or SMS to set up your
              account and connect to your agency's workspace.
            </p>
          </div>
          <a className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-mono text-teal-700 hover:underline shrink-0 self-center">
            Where's my invite? <Icon name="arrow-up-right" className="w-3 h-3" />
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-12 grid grid-cols-12 gap-3 text-[11px] font-mono">
          {[
            { l: "SOC 2 Type II", i: "shield-check" },
            { l: "HIPAA aligned", i: "lock" },
            { l: "99.95% uptime", i: "activity" },
            { l: "SSO · SCIM",   i: "key-round" },
          ].map(t => (
            <div key={t.l} className="col-span-6 sm:col-span-3 flex items-center gap-2 text-ink-700">
              <Icon name={t.i} className="w-3.5 h-3.5 text-teal-700" />
              <span className="uppercase tracking-wider text-[10px]">{t.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Field primitives
// ────────────────────────────────────────────────────────────────────────────
function Field({
  label,
  sub,
  children,
  optional = false,
  error,
}: {
  label: string;
  sub?: string;
  children: ReactNode;
  optional?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12px] font-medium tracking-tight text-ink-800">
          {label} {optional && <span className="font-mono text-[10px] text-ink-400 ml-1">optional</span>}
        </div>
        {sub && <div className="text-[10px] font-mono text-ink-500">{sub}</div>}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-[11px] font-mono text-rose-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}

function Input({
  className,
  ...props
}: React.ComponentProps<"input"> & { className?: string }) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition ${className ?? ""}`}
    />
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`text-left rounded-lg border px-3 py-2.5 transition ${
            value === o.id
              ? "border-teal-700 bg-teal-50/60 ring-2 ring-teal-100"
              : "border-ink-200 bg-white hover:border-ink-300"
          }`}
        >
          <div className="text-[13px] font-medium tracking-tight">{o.label}</div>
          {o.sub && (
            <div className="text-[10px] font-mono text-ink-500 mt-0.5">{o.sub}</div>
          )}
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Facility access form
// ────────────────────────────────────────────────────────────────────────────
function FacilityForm({ onSuccess }: { onSuccess: () => void }) {
  const [facility, setFacility] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agency, setAgency] = useState("");
  const [type, setType] = useState("hospital");
  const [submitting, setSubmitting] = useState(false);
  const ready = facility && name && email && phone;

  function submit(e: any) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setTimeout(() => onSuccess(), 700);
  }

  return (
    <div className="max-w-[760px] mx-auto px-8 py-16 rise-in">
      <Eyebrow>Facility · request access</Eyebrow>
      <h1 className="mt-4 text-[36px] leading-[1.08] tracking-[-0.02em] font-medium">
        Request access to your
        <span className="font-serif italic text-teal-800"> staffing portal.</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-600 max-w-md">
        Tell us about your facility. We'll route your request to your staffing agency, or
        connect you with one.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Facility type">
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { id: "hospital",  label: "Hospital" },
              { id: "snf",       label: "SNF" },
              { id: "clinic",    label: "Clinic" },
              { id: "homecare",  label: "Home care" },
            ]}
          />
        </Field>
        <Field label="Facility name">
          <Input value={facility} onChange={(e: any) => setFacility(e.target.value)} placeholder="e.g. Mercy Mt. Sinai" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Your name">
            <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Phone number">
            <Input value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="(555) 010-2841" />
          </Field>
        </div>
        <Field label="Work email">
          <Input value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="you@mercyhealth.org" type="email" />
        </Field>
        <Field label="Staffing agency you work with" optional>
          <Input value={agency} onChange={(e: any) => setAgency(e.target.value)} placeholder="If known — we'll route your request there" />
        </Field>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!ready || submitting}
            className={`w-full inline-flex items-center justify-center gap-2 h-12 rounded-full font-medium tracking-tight text-[14px] transition ${
              !ready ? "bg-ink-200 text-ink-500 cursor-not-allowed" : submitting ? "bg-ink-800 text-paper" : "bg-ink-900 text-paper hover:bg-ink-800"
            }`}
          >
            {submitting ? (<><Icon name="loader-2" className="w-4 h-4 animate-spin" /> Submitting…</>) : (<>Request access <Icon name="arrow-right" className="w-4 h-4" /></>)}
          </button>
          <div className="mt-2 text-[11px] font-mono text-ink-500 text-center">
            We respond within one business day.
          </div>
        </div>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Invite-code form
// ────────────────────────────────────────────────────────────────────────────
function InviteCodeForm({ onBack }: { onBack: () => void }) {
  const [chars, setChars] = useState(["","","","","",""]);
  const [submitting, setSubmitting] = useState(false);
  const ready = chars.every(c => c.length === 1);

  function setChar(i: number, v: string) {
    const next = [...chars];
    next[i] = v.slice(-1).toUpperCase();
    setChars(next);
  }

  function submit(e: any) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 900);
  }

  return (
    <div className="max-w-[560px] mx-auto px-8 py-16 rise-in">
      <Eyebrow>Facility · invite code</Eyebrow>
      <h1 className="mt-4 text-[32px] leading-[1.08] tracking-[-0.02em] font-medium">
        Join your
        <span className="font-serif italic text-teal-800"> agency portal.</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-600">
        Enter the 6-character invite code from your agency.
      </p>

      <form onSubmit={submit} className="mt-8">
        <div className="flex gap-2 justify-between">
          {chars.map((c, i) => (
            <input
              key={i}
              value={c}
              onChange={(e) => setChar(i, e.target.value)}
              maxLength={1}
              className="w-14 h-16 text-center text-[28px] font-mono font-medium rounded-lg border border-ink-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none uppercase"
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={!ready || submitting}
          className={`mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full font-medium tracking-tight text-[14px] transition ${
            !ready ? "bg-ink-200 text-ink-500 cursor-not-allowed" : "bg-ink-900 text-paper hover:bg-ink-800"
          }`}
        >
          Continue <Icon name="arrow-right" className="w-4 h-4" />
        </button>
        <button type="button" onClick={onBack} className="mt-3 w-full text-[12px] font-mono text-ink-500 hover:text-ink-800">
          ← Back to options
        </button>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Success states
// ────────────────────────────────────────────────────────────────────────────
function Success({ kind, onContinue }: { kind: "agency" | "facility"; onContinue: () => void }) {
  const isAgency = kind === "agency";
  return (
    <div className="max-w-[640px] mx-auto px-8 py-24 text-center rise-in">
      <span className="inline-flex w-14 h-14 rounded-full bg-teal-50 text-teal-700 items-center justify-center">
        <Icon name="check" className="w-7 h-7" strokeWidth={2.4} />
      </span>
      <h1 className="mt-6 text-[36px] leading-[1.08] tracking-[-0.02em] font-medium">
        {isAgency ? <>Your workspace is <span className="font-serif italic text-teal-800">ready.</span></> : <>Request <span className="font-serif italic text-teal-800">received.</span></>}
      </h1>
      <p className="mt-3 text-[15px] text-ink-600 max-w-md mx-auto leading-relaxed">
        {isAgency
          ? "We sent a verification link to your work email. Open it to drop into your operations console."
          : "We've routed your access request. Your agency (or our team) will be in touch within one business day."}
      </p>
      <div className="mt-8 inline-flex items-center gap-3">
        <button onClick={onContinue} className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800">
          {isAgency ? "Open verification email" : "Done"} <Icon name="arrow-right" className="w-4 h-4" />
        </button>
        <a href="index.html" className="text-[13px] text-ink-700 hover:underline">Back to homepage</a>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────────────────────────────────
export function SignupApp() {
  const [step, setStep] = useState<Step>("choose");
  const back = () => setStep("choose");

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav step={step} onBack={back} />
      <main>
        {step === "choose" && <Chooser go={setStep} />}
        {step === "agency-form" && <AgencySignupForm />}
        {step === "agency-success" && <Success kind="agency" onContinue={back} />}
        {step === "facility-form" && <FacilityForm onSuccess={() => setStep("facility-success")} />}
        {step === "facility-success" && <Success kind="facility" onContinue={back} />}
        {step === "invite-code" && <InviteCodeForm onBack={back} />}
      </main>
      <footer className="border-t border-ink-200 mt-12">
        <div className="max-w-[1240px] mx-auto px-8 py-8 flex items-center justify-between text-[11px] font-mono text-ink-500">
          <div>© 2026 AsNeeded, Inc.</div>
          <div className="flex gap-4">
            <a>Privacy</a><a>Terms</a><a>HIPAA</a><a>Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
