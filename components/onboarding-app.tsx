"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon, Badge, Dot, Eyebrow, Avatar } from "@/components/primitives";
import { SignOutButton } from "@/components/sign-out-button";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { ServiceAreaAutocomplete } from "@/components/service-area-autocomplete";
import { sendTeamInvitesAction } from "@/actions/invites/send-team-invites";
import { saveOnboardingProfileAction } from "@/actions/onboarding/save-profile";
import { saveOnboardingServiceAreaAction } from "@/actions/onboarding/save-service-area";
import { addOnboardingProfessionalAction } from "@/actions/onboarding/add-professional";
import { addOnboardingFacilityAction } from "@/actions/onboarding/add-facility";
import {
  onboardingProfileSchema,
  STAFFING_SPECIALTY_OPTIONS,
  type OnboardingProfileInput,
} from "@/lib/validations/onboarding-profile";
import { PROFESSIONAL_ROLE_LABELS, PROFESSIONAL_ROLES } from "@/lib/validations/onboarding-professional";
import { FACILITY_TYPES, FACILITY_TYPE_LABELS } from "@/lib/validations/onboarding-facility";
import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";
import type { AgencyServiceAreaContext } from "@/lib/agency/service-area";
import type { GeographicLocation } from "@/lib/geographic-location";
import type { StepId } from "@/lib/onboarding/progress";

// ────────────────────────────────────────────────────────────────────────────
// Steps config
// ────────────────────────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; short: string; icon: string }[] = [
  { id: "welcome",       label: "Welcome",                  short: "Welcome",       icon: "sparkles" },
  { id: "profile",       label: "Agency profile",           short: "Profile",       icon: "building-2" },
  { id: "service-area",  label: "Service area",             short: "Service area",  icon: "map-pin" },
  { id: "team",          label: "Operations team",          short: "Team",          icon: "users" },
  { id: "professionals", label: "Healthcare professionals", short: "Professionals", icon: "stethoscope" },
  { id: "facilities",    label: "Facilities",               short: "Facilities",    icon: "hospital" },
  { id: "complete",      label: "All set",                  short: "Done",          icon: "check" },
];

// ────────────────────────────────────────────────────────────────────────────
// Row types
// ────────────────────────────────────────────────────────────────────────────

type TeamRow = {
  id: number;
  email: string;
  role: string;
  inviteUrl?: string;
  inviteStatus?: "sent" | "error";
  inviteMessage?: string;
};

type ProfRole = (typeof PROFESSIONAL_ROLES)[number];
type ProfRow = {
  id: number;
  firstName: string;
  lastName: string;
  role: ProfRole;
  email: string;
  phone: string;
  location: GeographicLocation | null;
  sendInvite: boolean;
  error?: string;
  savedId?: string;
  inviteUrl?: string;
};

type FacType = (typeof FACILITY_TYPES)[number];
type FacRow = {
  id: number;
  name: string;
  type: FacType;
  location: GeographicLocation | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  inviteContact: boolean;
  error?: string;
  savedId?: string;
  inviteUrl?: string;
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function emptyProf(id = Date.now()): ProfRow {
  return { id, firstName: "", lastName: "", role: "rn", email: "", phone: "", location: null, sendInvite: false };
}

function emptyFac(id = Date.now()): FacRow {
  return { id, name: "", type: "hospital", location: null, contactName: "", contactEmail: "", contactPhone: "", inviteContact: true };
}

function trackStep(stepId: StepId) {
  fetch("/api/onboarding/step", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepId, action: "navigate" }),
  }).catch(() => {});
}

// ────────────────────────────────────────────────────────────────────────────
// Shared UI sub-components
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
          <SignOutButton />
          <Avatar initials="AG" tone="teal" size={28} />
          {idx > 0 && idx < STEPS.length - 1 && (
            <button onClick={onSkip} className="text-[12px] font-mono text-ink-500 hover:text-ink-900 px-2 h-7 rounded hover:bg-ink-100">Save & exit</button>
          )}
        </div>
      </div>
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
                  {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? "bg-teal-700" : "bg-ink-200"}`} />}
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

function StepShell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1100px] mx-auto px-8 py-12">{children}</div>;
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

function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  skipLabel,
  onSkip,
  primary = "ink",
  isSubmit = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  primary?: "ink" | "teal";
  isSubmit?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center gap-3 border-t border-ink-200 pt-6">
      {onBack && (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 h-11 px-4 rounded-full border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50">
          <Icon name="arrow-left" className="w-3.5 h-3.5" /> Back
        </button>
      )}
      {skipLabel && (
        <button type="button" onClick={onSkip} className="text-[12px] font-mono text-ink-500 hover:text-ink-900 px-3 h-11 rounded hover:bg-ink-100">
          {skipLabel}
        </button>
      )}
      <div className="ml-auto" />
      <button
        type={isSubmit ? "submit" : "button"}
        onClick={!isSubmit ? onNext : undefined}
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition ${props.className ?? ""}`}
    />
  );
}

function SelectEl({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
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

function Field({ label, sub, error, children }: { label: string; sub?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12px] font-medium tracking-tight text-ink-800">{label}</div>
        {sub && <div className="text-[10px] font-mono text-ink-500">{sub}</div>}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] font-mono text-rose-600">{error}</p>}
    </div>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-900" role="alert">
      {children}
    </div>
  );
}

function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900" role="status">
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Welcome
// ────────────────────────────────────────────────────────────────────────────

function WelcomeStep({ onNext, onExit }: { onNext: () => void; onExit: () => void }) {
  const setupItems = [
    { id: "profile",       icon: "building-2",  label: "Agency profile",           sub: "Contact info, specialties, description",  time: 2 },
    { id: "service-area",  icon: "map-pin",      label: "Service area",             sub: "Your operating region and coverage radius", time: 1 },
    { id: "team",          icon: "users",        label: "Operations team",          sub: "Coordinators, recruiters, compliance",      time: 2 },
    { id: "professionals", icon: "stethoscope",  label: "Healthcare professionals", sub: "Invite or add RNs, CNAs, EMTs",             time: 2 },
    { id: "facilities",    icon: "hospital",     label: "Facilities",               sub: "Hospitals, SNFs, clinics",                  time: 2 },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-paper/0 via-paper/70 to-paper" aria-hidden />
      <StepShell>
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-7">
            <Badge tone="teal"><Dot tone="green" pulse /> Workspace ready</Badge>
            <h1 className="mt-6 text-[56px] leading-[1.02] tracking-[-0.02em] font-medium">
              Welcome to your<br />
              staffing operations<br />
              <span className="font-serif italic text-teal-800">workspace.</span>
            </h1>
            <p className="mt-5 text-[17px] text-ink-600 max-w-xl leading-relaxed">
              Let&apos;s set up your agency so you can start coordinating staffing requests and
              workforce availability. We&apos;ll cover five quick steps — should take under 10 minutes.
            </p>
            <div className="mt-7 inline-flex items-center gap-3 px-3 h-9 rounded-full border border-ink-200 bg-white text-[12px] font-mono text-ink-700">
              <Icon name="timer" className="w-3.5 h-3.5 text-teal-700" />
              Estimated setup time · 5–10 minutes
              <span className="text-ink-300">·</span>
              <span className="text-ink-500">you can save &amp; resume any time</span>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={onNext}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink-900 text-paper font-medium tracking-tight text-[14px] hover:bg-ink-800"
              >
                Start setup <Icon name="arrow-right" className="w-4 h-4" />
              </button>
              <button onClick={onExit} className="text-[13px] text-ink-700 hover:underline">I&apos;ll do this later</button>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-ink-200 bg-white shadow-card p-6">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">What you&apos;ll set up</div>
              <ul className="mt-4 divide-y divide-ink-100">
                {setupItems.map((s) => (
                  <li key={s.id} className="py-3 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center shrink-0">
                      <Icon name={s.icon} className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <div className="text-[13px] font-medium tracking-tight">{s.label}</div>
                        <div className="text-[10px] font-mono text-ink-400">~{s.time} min</div>
                      </div>
                      <div className="text-[11px] font-mono text-ink-500">{s.sub}</div>
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
// 2. Agency profile
// ────────────────────────────────────────────────────────────────────────────

function ProfileStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingProfileInput>({
    resolver: zodResolver(onboardingProfileSchema),
    defaultValues: { staffingSpecialties: [], website: "", logoUrl: "", description: "" },
  });

  const specialties = watch("staffingSpecialties") ?? [];

  function toggleSpecialty(s: string) {
    if (specialties.includes(s)) {
      setValue("staffingSpecialties", specialties.filter((x) => x !== s), { shouldValidate: true });
    } else {
      setValue("staffingSpecialties", [...specialties, s], { shouldValidate: true });
    }
  }

  async function onSubmit(data: OnboardingProfileInput) {
    setServerError(null);
    const result = await saveOnboardingProfileAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    onNext();
  }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 02 · Agency profile" heading="Tell us about your" italic="agency." sub="Contact details and the types of staffing you specialize in. This appears on your facility portals." />
      {serverError && <ErrorBanner>{serverError}</ErrorBanner>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Agency phone" error={errors.phone?.message}>
                <Input {...register("phone")} placeholder="+1 (555) 010-2841" type="tel" />
              </Field>
              <Field label="Website" sub="optional" error={errors.website?.message}>
                <Input {...register("website")} placeholder="https://apexstaffing.com" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Operational contact name" error={errors.operationalContactName?.message}>
                <Input {...register("operationalContactName")} placeholder="Jennifer Liu" />
              </Field>
              <Field label="Operational contact email" error={errors.operationalContactEmail?.message}>
                <Input {...register("operationalContactEmail")} placeholder="jliu@apexstaffing.com" type="email" />
              </Field>
            </div>

            <Field label="Agency description" sub="optional" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Brief description of your agency's specialization and geographic focus…"
              />
            </Field>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-[12px] font-medium tracking-tight text-ink-800">Staffing specialties</div>
                <div className="text-[10px] font-mono text-ink-500">Select at least 1</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {STAFFING_SPECIALTY_OPTIONS.map((s) => {
                  const on = specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium border transition ${
                        on
                          ? "bg-teal-700 border-teal-700 text-white"
                          : "bg-white border-ink-200 text-ink-700 hover:border-teal-400"
                      }`}
                    >
                      {on && <Icon name="check" className="w-3 h-3" strokeWidth={2.5} />}
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.staffingSpecialties && (
                <p className="mt-1.5 text-[11px] font-mono text-rose-600">{errors.staffingSpecialties.message}</p>
              )}
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="rounded-xl border border-ink-200 bg-paper/40 p-5 space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">Why we ask</div>
              <ul className="space-y-3 text-[12px] text-ink-700">
                <li className="flex items-start gap-2">
                  <Icon name="phone" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                  <span>Contact details appear on facility portals and invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="tag" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                  <span>Specialties help match professionals to requests faster</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="file-text" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                  <span>Description shown to facilities when they create an account</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <StepFooter
          onBack={onBack}
          nextLabel={isSubmitting ? "Saving…" : "Save & continue"}
          nextDisabled={isSubmitting}
          isSubmit
        />
      </form>
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Service area
// ────────────────────────────────────────────────────────────────────────────

function ServiceAreaStep({
  onBack,
  onNext,
  onSaved,
}: {
  onBack: () => void;
  onNext: () => void;
  onSaved: (sa: AgencyServiceAreaContext) => void;
}) {
  const [location, setLocation] = useState<GeographicLocation | null>(null);
  const [radius, setRadius] = useState(DEFAULT_SERVICE_AREA_RADIUS_MILES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!location) {
      setError("Select a service area location to continue.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveOnboardingServiceAreaAction({
      primaryServiceArea: location,
      serviceAreaRadiusMiles: radius,
    });
    setSaving(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    onSaved({
      agencyId: "",
      displayName: location.displayName ?? location.city ?? "Service area",
      placeId: location.placeId ?? null,
      city: location.city ?? null,
      state: location.state ?? null,
      country: location.country ?? null,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMiles: radius,
    });
    onNext();
  }

  return (
    <StepShell>
      <StepHeader
        eyebrow="Step 03 · Service area"
        heading="Where does your agency"
        italic="operate?"
        sub="Define your primary market. We use this to validate that professionals and facilities are within your coverage zone."
      />
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="mt-10 grid grid-cols-12 gap-10 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Field label="Primary service area">
            <ServiceAreaAutocomplete value={location} onChange={setLocation} />
          </Field>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[12px] font-medium tracking-tight text-ink-800">Coverage radius</div>
              <div className="text-[13px] font-medium tabular-nums text-ink-900">{radius} miles</div>
            </div>
            <input
              type="range"
              min={10}
              max={75}
              step={5}
              value={radius}
              onChange={(e) => setRadius(+e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-700 bg-ink-200"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 mt-1">
              <span>10 mi · local</span>
              <span>75 mi · regional</span>
            </div>
          </div>

          {location && (
            <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-3 flex items-start gap-2.5">
              <Icon name="map-pin" className="w-4 h-4 text-teal-700 mt-0.5" />
              <div className="text-[12px] text-teal-900 leading-relaxed">
                <span className="font-medium">{location.displayName}</span> · {radius}-mile radius. Professionals and facilities must be within this zone.
              </div>
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-ink-200 bg-paper/40 p-5 space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">How this is used</div>
            <ul className="space-y-3 text-[12px] text-ink-700">
              <li className="flex items-start gap-2">
                <Icon name="shield-check" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                <span>Validates professional and facility locations on entry</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="wand-2" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                <span>Limits auto-match search to nearby, available staff</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="settings-2" className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                <span>Adjustable any time in agency settings</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={handleContinue}
        nextLabel={saving ? "Saving…" : "Save & continue"}
        nextDisabled={saving || !location}
      />
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Team
// ────────────────────────────────────────────────────────────────────────────

const TEAM_ROLES = ["Staffing Coordinator", "Recruiter", "Compliance Manager", "Operations Manager"];

function TeamStep({
  data,
  set,
  onBack,
  onNext,
  onSkip,
}: {
  data: { team: TeamRow[] };
  set: (patch: { team: TeamRow[] }) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const rows: TeamRow[] = data.team.length ? data.team : [{ id: 1, email: "", role: "Staffing Coordinator" }];
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function setRows(rs: TeamRow[]) { set({ team: rs }); }
  function update(i: number, patch: Partial<TeamRow>) { setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r))); }
  function add() { setRows([...rows, { id: Date.now(), email: "", role: "Staffing Coordinator" }]); }
  function remove(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }

  const filledRows = rows.filter((r) => r.email.trim().length > 0);

  async function handleContinue() {
    if (filledRows.length === 0) { onNext(); return; }

    setSending(true);
    setBanner(null);

    const result = await sendTeamInvitesAction({
      invites: filledRows.map((r) => ({ email: r.email.trim(), role: r.role })),
    });

    setSending(false);

    if (result.status === "success") {
      const byEmail = new Map(result.results.map((r) => [r.email.toLowerCase(), r]));
      setRows(rows.map((row) => {
        const match = byEmail.get(row.email.trim().toLowerCase());
        if (!match) return row;
        return { ...row, inviteStatus: match.status === "sent" ? "sent" : "error", inviteUrl: match.inviteUrl, inviteMessage: match.message };
      }));
      const sentCount = result.results.filter((r) => r.status === "sent").length;
      setBanner(`${sentCount} invitation${sentCount === 1 ? "" : "s"} created. Share each invite link with your team.`);
      onNext();
      return;
    }

    if (result.status === "error") {
      if (result.results) {
        const byEmail = new Map(result.results.map((r) => [r.email.toLowerCase(), r]));
        setRows(rows.map((row) => {
          const match = byEmail.get(row.email.trim().toLowerCase());
          if (!match) return row;
          return { ...row, inviteStatus: "error" as const, inviteMessage: match.message };
        }));
      }
      setBanner(result.message);
    }
  }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 04 · Operations team" heading="Invite your" italic="operations team." sub="Add staffing coordinators, recruiters, compliance staff, and managers. They'll get a link to set up their accounts." />

      {banner && <SuccessBanner>{banner}</SuccessBanner>}

      <div className="mt-10 grid grid-cols-12 gap-10 items-start">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-ink-200 bg-white">
            <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
              <div className="col-span-7">Work email</div>
              <div className="col-span-4">Role</div>
              <div className="col-span-1" />
            </div>
            {rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b last:border-0 border-ink-100">
                <div className="col-span-7 space-y-1">
                  <Input value={r.email} onChange={(e) => update(i, { email: e.target.value })} placeholder="name@apexstaffing.com" type="email" />
                  {r.inviteStatus === "sent" && r.inviteUrl && (
                    <a href={r.inviteUrl} className="block text-[10px] font-mono text-teal-700 truncate hover:underline" target="_blank" rel="noreferrer">
                      Invite link ready
                    </a>
                  )}
                  {r.inviteStatus === "error" && r.inviteMessage && (
                    <p className="text-[10px] font-mono text-rose-600">{r.inviteMessage}</p>
                  )}
                </div>
                <div className="col-span-4">
                  <SelectEl value={r.role} onChange={(e) => update(i, { role: e.target.value })}>
                    {TEAM_ROLES.map((role) => <option key={role}>{role}</option>)}
                  </SelectEl>
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
          <div className="mt-3 text-[11px] font-mono text-ink-500 px-1">Invitations expire in 7 days. You can resend or revoke them anytime.</div>
        </aside>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={handleContinue}
        nextLabel={sending ? "Sending invites…" : filledRows.length ? "Send invites & continue" : "Continue"}
        nextDisabled={sending}
        skipLabel="Skip for now"
        onSkip={onSkip}
      />
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
// 5. Healthcare professionals
// ────────────────────────────────────────────────────────────────────────────

function ProfessionalsStep({
  data,
  set,
  onBack,
  onNext,
  onSkip,
  agencyServiceArea,
}: {
  data: { profs: ProfRow[] };
  set: (patch: { profs: ProfRow[] }) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  agencyServiceArea: AgencyServiceAreaContext | null;
}) {
  const rows = data.profs.length ? data.profs : [emptyProf()];
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function setRows(rs: ProfRow[]) { set({ profs: rs }); }
  function update(id: number, patch: Partial<ProfRow>) { setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r))); }
  function add() { setRows([...rows, emptyProf()]); }
  function remove(id: number) { setRows(rows.filter((r) => r.id !== id)); }

  async function handleContinue() {
    const toSave = rows.filter((r) => (r.firstName.trim() || r.lastName.trim()) && !r.savedId);

    if (toSave.length === 0) { onNext(); return; }

    setSaving(true);
    setBanner(null);

    const updates: Record<number, Partial<ProfRow>> = {};

    for (const row of toSave) {
      if (!row.location) {
        updates[row.id] = { error: "Location is required." };
        continue;
      }
      const result = await addOnboardingProfessionalAction({
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        role: row.role,
        email: row.email || "",
        phone: row.phone || "",
        location: row.location,
        sendInvite: row.sendInvite,
      });
      if (result.status === "success") {
        updates[row.id] = { savedId: result.professionalId, inviteUrl: result.inviteUrl, error: undefined };
      } else if (result.status === "error") {
        updates[row.id] = { error: result.message };
      }
    }

    setSaving(false);

    const newRows = rows.map((r) => (updates[r.id] ? { ...r, ...updates[r.id] } : r));
    setRows(newRows);

    const savedCount = Object.values(updates).filter((u) => u.savedId).length;
    const hasErrors = newRows.some((r) => r.error && (r.firstName.trim() || r.lastName.trim()));

    if (!hasErrors) {
      if (savedCount > 0) setBanner(`${savedCount} professional${savedCount === 1 ? "" : "s"} added.`);
      onNext();
    }
  }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 05 · Workforce" heading="Add your healthcare" italic="professionals." sub="Add RNs, CNAs, EMTs, and other professionals to your staffing network. You can import more later." />
      {banner && <SuccessBanner>{banner}</SuccessBanner>}

      <div className="mt-10 space-y-4">
        {rows.map((row, i) => (
          <div key={row.id} className={`rounded-xl border bg-white p-5 ${row.error ? "border-rose-300" : row.savedId ? "border-teal-300 bg-teal-50/20" : "border-ink-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center">
                <Icon name="stethoscope" className="w-4 h-4" />
              </span>
              <div className="text-[12px] font-mono text-ink-500">Professional {String(i + 1).padStart(2, "0")}</div>
              {row.savedId && <Badge tone="teal"><Icon name="check" className="w-3 h-3 mr-1" strokeWidth={2.5} />Saved</Badge>}
              {row.inviteUrl && (
                <a href={row.inviteUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-teal-700 hover:underline truncate max-w-[200px]">Invite link ready</a>
              )}
              <div className="ml-auto">
                {rows.length > 1 && !row.savedId && (
                  <button onClick={() => remove(row.id)} className="text-[11px] font-mono text-ink-500 hover:text-rose-700 px-2 h-7 rounded hover:bg-rose-50 inline-flex items-center gap-1.5">
                    <Icon name="trash-2" className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>

            {row.error && <p className="mb-4 text-[12px] font-mono text-rose-600">{row.error}</p>}

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-4">
                <Field label="First name">
                  <Input value={row.firstName} onChange={(e) => update(row.id, { firstName: e.target.value })} placeholder="Andrea" disabled={!!row.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Last name">
                  <Input value={row.lastName} onChange={(e) => update(row.id, { lastName: e.target.value })} placeholder="Martinez" disabled={!!row.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Role">
                  <SelectEl value={row.role} onChange={(e) => update(row.id, { role: e.target.value as ProfRole })} disabled={!!row.savedId}>
                    {PROFESSIONAL_ROLES.map((r) => (
                      <option key={r} value={r}>{PROFESSIONAL_ROLE_LABELS[r]}</option>
                    ))}
                  </SelectEl>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Email" sub="optional">
                  <Input value={row.email} onChange={(e) => update(row.id, { email: e.target.value, sendInvite: row.sendInvite && !!e.target.value })} placeholder="rn@email.com" type="email" disabled={!!row.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Phone" sub="optional">
                  <Input value={row.phone} onChange={(e) => update(row.id, { phone: e.target.value })} placeholder="(555) 010-2841" type="tel" disabled={!!row.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Location">
                  <LocationAutocomplete
                    size="default"
                    value={row.location}
                    onChange={(loc) => update(row.id, { location: loc })}
                    placeholder="City, metro, or ZIP"
                    restrictedToServiceArea={Boolean(agencyServiceArea)}
                    serviceAreaCenterLat={agencyServiceArea?.latitude}
                    serviceAreaCenterLng={agencyServiceArea?.longitude}
                    serviceAreaRadiusMiles={agencyServiceArea?.radiusMiles}
                    helperText={agencyServiceArea ? `Within ${agencyServiceArea.radiusMiles}-mi of ${agencyServiceArea.displayName}` : ""}
                    disabled={!!row.savedId}
                  />
                </Field>
              </div>
              {row.email && !row.savedId && (
                <div className="col-span-12">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.sendInvite}
                      onChange={(e) => update(row.id, { sendInvite: e.target.checked })}
                      className="rounded border-ink-300 text-teal-700 focus:ring-teal-500"
                    />
                    <span className="text-[12px] text-ink-700">Send invite to {row.email} to set up their provider account</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={add} className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-ink-300 text-[13px] font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-400">
          <Icon name="plus" className="w-4 h-4" /> Add another professional
        </button>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={handleContinue}
        nextLabel={saving ? "Saving…" : "Continue"}
        nextDisabled={saving}
        skipLabel="Skip for now"
        onSkip={onSkip}
      />
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Facilities
// ────────────────────────────────────────────────────────────────────────────

function FacilitiesStep({
  data,
  set,
  onBack,
  onNext,
  onSkip,
  agencyServiceArea,
}: {
  data: { facs: FacRow[] };
  set: (patch: { facs: FacRow[] }) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  agencyServiceArea: AgencyServiceAreaContext | null;
}) {
  const facs = data.facs.length ? data.facs : [emptyFac()];
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function setFacs(fs: FacRow[]) { set({ facs: fs }); }
  function update(id: number, patch: Partial<FacRow>) { setFacs(facs.map((f) => (f.id === id ? { ...f, ...patch } : f))); }
  function add() { setFacs([...facs, emptyFac()]); }
  function remove(id: number) { setFacs(facs.filter((f) => f.id !== id)); }

  async function handleContinue() {
    const toSave = facs.filter((f) => f.name.trim() && !f.savedId);

    if (toSave.length === 0) { onNext(); return; }

    setSaving(true);
    setBanner(null);

    const updates: Record<number, Partial<FacRow>> = {};

    for (const fac of toSave) {
      if (!fac.location) {
        updates[fac.id] = { error: "Location is required." };
        continue;
      }
      const result = await addOnboardingFacilityAction({
        name: fac.name.trim(),
        type: fac.type,
        location: fac.location,
        contactName: fac.contactName.trim(),
        contactEmail: fac.contactEmail.trim(),
        contactPhone: fac.contactPhone.trim(),
        inviteContact: fac.inviteContact,
      });
      if (result.status === "success") {
        updates[fac.id] = { savedId: result.facilityId, inviteUrl: result.inviteUrl, error: undefined };
      } else if (result.status === "error") {
        updates[fac.id] = { error: result.message };
      }
    }

    setSaving(false);

    const newFacs = facs.map((f) => (updates[f.id] ? { ...f, ...updates[f.id] } : f));
    setFacs(newFacs);

    const savedCount = Object.values(updates).filter((u) => u.savedId).length;
    const hasErrors = newFacs.some((f) => f.error && f.name.trim());

    if (!hasErrors) {
      if (savedCount > 0) setBanner(`${savedCount} facilit${savedCount === 1 ? "y" : "ies"} added.`);
      onNext();
    }
  }

  return (
    <StepShell>
      <StepHeader eyebrow="Step 06 · Facilities" heading="Connect your" italic="facilities and customers." sub="Hospitals, clinics, nursing homes, and other healthcare facilities. Each gets a portal to submit and track requests." />
      {banner && <SuccessBanner>{banner}</SuccessBanner>}

      <div className="mt-10 space-y-4">
        {facs.map((fac, i) => (
          <div key={fac.id} className={`rounded-xl border bg-white p-5 ${fac.error ? "border-rose-300" : fac.savedId ? "border-teal-300 bg-teal-50/20" : "border-ink-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center">
                <Icon name="building-2" className="w-4 h-4" />
              </span>
              <div className="text-[12px] font-mono text-ink-500">Facility {String(i + 1).padStart(2, "0")}</div>
              {fac.savedId && <Badge tone="teal"><Icon name="check" className="w-3 h-3 mr-1" strokeWidth={2.5} />Saved</Badge>}
              {fac.inviteUrl && (
                <a href={fac.inviteUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-teal-700 hover:underline truncate max-w-[200px]">Portal invite ready</a>
              )}
              <div className="ml-auto">
                {facs.length > 1 && !fac.savedId && (
                  <button onClick={() => remove(fac.id)} className="text-[11px] font-mono text-ink-500 hover:text-rose-700 px-2 h-7 rounded hover:bg-rose-50 inline-flex items-center gap-1.5">
                    <Icon name="trash-2" className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>

            {fac.error && <p className="mb-4 text-[12px] font-mono text-rose-600">{fac.error}</p>}

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-5">
                <Field label="Facility name">
                  <Input value={fac.name} onChange={(e) => update(fac.id, { name: e.target.value })} placeholder="Mercy Mt. Sinai Medical Center" disabled={!!fac.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Facility type">
                  <SelectEl value={fac.type} onChange={(e) => update(fac.id, { type: e.target.value as FacType })} disabled={!!fac.savedId}>
                    {FACILITY_TYPES.map((t) => (
                      <option key={t} value={t}>{FACILITY_TYPE_LABELS[t]}</option>
                    ))}
                  </SelectEl>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Field label="Location">
                  <LocationAutocomplete
                    size="default"
                    value={fac.location}
                    onChange={(loc) => update(fac.id, { location: loc })}
                    placeholder="City, metro, or ZIP"
                    restrictedToServiceArea={Boolean(agencyServiceArea)}
                    serviceAreaCenterLat={agencyServiceArea?.latitude}
                    serviceAreaCenterLng={agencyServiceArea?.longitude}
                    serviceAreaRadiusMiles={agencyServiceArea?.radiusMiles}
                    helperText=""
                    disabled={!!fac.savedId}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Contact name">
                  <Input value={fac.contactName} onChange={(e) => update(fac.id, { contactName: e.target.value })} placeholder="Director of Nursing" disabled={!!fac.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Contact email">
                  <Input value={fac.contactEmail} onChange={(e) => update(fac.id, { contactEmail: e.target.value })} placeholder="director@mercyhealth.org" type="email" disabled={!!fac.savedId} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Contact phone">
                  <Input value={fac.contactPhone} onChange={(e) => update(fac.id, { contactPhone: e.target.value })} placeholder="(555) 010-2841" type="tel" disabled={!!fac.savedId} />
                </Field>
              </div>
              {!fac.savedId && fac.contactEmail && (
                <div className="col-span-12">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fac.inviteContact}
                      onChange={(e) => update(fac.id, { inviteContact: e.target.checked })}
                      className="rounded border-ink-300 text-teal-700 focus:ring-teal-500"
                    />
                    <span className="text-[12px] text-ink-700">Send portal invite to {fac.contactEmail}</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={add} className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-ink-300 text-[13px] font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-400">
          <Icon name="plus" className="w-4 h-4" /> Add another facility
        </button>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={handleContinue}
        nextLabel={saving ? "Saving…" : "Continue"}
        nextDisabled={saving}
        skipLabel="Skip for now"
        onSkip={onSkip}
      />
    </StepShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Complete
// ────────────────────────────────────────────────────────────────────────────

function CompleteStep({
  onFinish,
  finishing,
  error,
}: {
  onFinish: () => void;
  finishing: boolean;
  error: string | null;
}) {
  return (
    <div className="relative">
      <DashboardBackdrop />
      <div className="absolute inset-0 bg-paper/60 backdrop-blur-[2px]" aria-hidden />
      <div className="relative max-w-[920px] mx-auto px-8 py-16">
        <div className="rounded-2xl bg-white shadow-deep ring-1 ring-ink-900/5 p-10 text-center">
          <span className="inline-flex w-14 h-14 rounded-full bg-teal-50 text-teal-700 items-center justify-center">
            <Icon name="check" className="w-7 h-7" strokeWidth={2.4} />
          </span>
          <h1 className="mt-6 text-[40px] leading-[1.06] tracking-[-0.02em] font-medium">
            Your workspace is ready to
            <span className="font-serif italic text-teal-800"> go.</span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-600 max-w-md mx-auto">
            Agency profile and service area are configured. Your operations console is waiting — start
            coordinating staffing requests from day one.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-900 max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
            <CompleteStat icon="building-2"   label="Agency profile" sub="configured" />
            <CompleteStat icon="map-pin"      label="Service area"   sub="defined" />
            <CompleteStat icon="wand-2"       label="Auto-matching"  sub="ready" highlight />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onFinish}
              disabled={finishing}
              className={`inline-flex items-center gap-2 h-12 px-6 rounded-full font-medium tracking-tight text-[14px] transition ${
                finishing ? "bg-ink-200 text-ink-500 cursor-not-allowed" : "bg-ink-900 text-paper hover:bg-ink-800"
              }`}
            >
              {finishing ? "Finishing setup…" : "Go to operations dashboard"} <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono text-ink-500">
            <Dot tone="green" pulse /> All systems operational · workspace synced
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteStat({ icon, label, sub, highlight = false }: { icon: string; label: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-teal-700 bg-teal-50/50" : "border-ink-200 bg-paper/40"}`}>
      <div className={`w-7 h-7 rounded-md inline-flex items-center justify-center ${highlight ? "bg-teal-700 text-white" : "bg-ink-100 text-ink-700"}`}>
        <Icon name={icon} className="w-3.5 h-3.5" />
      </div>
      <div className="mt-2 text-[13px] font-medium tracking-tight">{label}</div>
      <div className="text-[10px] font-mono text-ink-500">{sub}</div>
    </div>
  );
}

function DashboardBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-8 pt-8">
        <div className="rounded-2xl bg-white shadow-lifted ring-1 ring-ink-900/5 overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-9 border-b border-ink-100 bg-ink-50/60">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-ink-200" />)}
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
              {["Mercy ICU · 2 of 3 filled", "Bayview MS · 4 of 4 filled", "Pinegrove F2 · 1 of 2 filled"].map((l, i) => (
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

export function OnboardingApp({
  initialStep = "welcome",
  agencyServiceArea: initialServiceArea = null,
}: {
  initialStep?: StepId;
  agencyServiceArea?: AgencyServiceAreaContext | null;
}) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(Math.max(0, STEPS.findIndex((s) => s.id === initialStep)));
  const [serviceArea, setServiceArea] = useState<AgencyServiceAreaContext | null>(initialServiceArea);
  const [teamData, setTeamData] = useState<{ team: TeamRow[] }>({ team: [] });
  const [profData, setProfData] = useState<{ profs: ProfRow[] }>({ profs: [emptyProf()] });
  const [facData, setFacData] = useState<{ facs: FacRow[] }>({ facs: [emptyFac()] });
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const stepId = STEPS[stepIdx].id;
  const next = () => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));
  const exit = () => router.push("/dashboard");

  async function handleFinish() {
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFinishError((body as { error?: string }).error ?? "Unable to complete setup. Try again.");
        setFinishing(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setFinishError("Network error. Please try again.");
      setFinishing(false);
    }
  }

  function advanceToTeam() { trackStep("team"); next(); }
  function advanceToProfessionals() { trackStep("professionals"); next(); }
  function advanceToFacilities() { trackStep("facilities"); next(); }
  function advanceToComplete() { trackStep("complete"); next(); }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <Header idx={stepIdx} onSkip={exit} />
      <main key={stepId}>
        {stepId === "welcome" && <WelcomeStep onNext={next} onExit={exit} />}

        {stepId === "profile" && <ProfileStep onBack={back} onNext={next} />}

        {stepId === "service-area" && (
          <ServiceAreaStep onBack={back} onNext={next} onSaved={setServiceArea} />
        )}

        {stepId === "team" && (
          <TeamStep
            data={teamData}
            set={(p) => setTeamData((d) => ({ ...d, ...p }))}
            onBack={back}
            onNext={advanceToProfessionals}
            onSkip={advanceToProfessionals}
          />
        )}

        {stepId === "professionals" && (
          <ProfessionalsStep
            data={profData}
            set={(p) => setProfData((d) => ({ ...d, ...p }))}
            onBack={back}
            onNext={advanceToFacilities}
            onSkip={advanceToFacilities}
            agencyServiceArea={serviceArea}
          />
        )}

        {stepId === "facilities" && (
          <FacilitiesStep
            data={facData}
            set={(p) => setFacData((d) => ({ ...d, ...p }))}
            onBack={back}
            onNext={advanceToComplete}
            onSkip={advanceToComplete}
            agencyServiceArea={serviceArea}
          />
        )}

        {stepId === "complete" && (
          <CompleteStep onFinish={handleFinish} finishing={finishing} error={finishError} />
        )}
      </main>
    </div>
  );
}
