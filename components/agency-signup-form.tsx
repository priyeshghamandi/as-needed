"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon, Badge, Dot, Eyebrow, Avatar } from "@/components/primitives";
import { ServiceAreaAutocomplete } from "@/components/service-area-autocomplete";
import { registerAgencyAction } from "@/actions/signup/register-agency";
import {
  agencySignupFormSchema,
  passwordStrengthScore,
  toAgencySignupInput,
  type AgencySignupFormInput,
} from "@/lib/validations/agency-signup";

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-wider text-teal-700">{index}</span>
      <span className="block w-6 h-px bg-ink-200" />
      <span className="text-[13px] font-medium tracking-tight text-ink-700">{title}</span>
    </div>
  );
}

function Field({
  label,
  sub,
  children,
  error,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12px] font-medium tracking-tight text-ink-800">{label}</div>
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

function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}

function Select({ children, ...rest }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...rest}
        className="w-full h-11 px-3.5 pr-10 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none appearance-none transition disabled:opacity-60"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500">
        <Icon name="chevron-down" className="w-4 h-4" />
      </span>
    </div>
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

function PasswordInput({
  value,
  onChange,
  onBlur,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  const score = useMemo(() => passwordStrengthScore(value), [value]);
  const labels = ["—", "Weak", "Fair", "Good", "Strong"];
  const bars = [
    score >= 1 ? "bg-rose-400" : "bg-ink-200",
    score >= 2 ? "bg-amber-400" : "bg-ink-200",
    score >= 3 ? "bg-teal-500" : "bg-ink-200",
    score >= 4 ? "bg-emerald-500" : "bg-ink-200",
  ];
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="At least 8 characters"
          className="w-full h-11 px-3.5 pr-12 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition font-mono disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 rounded text-[11px] font-mono text-ink-600 hover:bg-ink-100"
        >
          {show ? "hide" : "show"}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {bars.map((b, i) => (
            <span key={i} className={`flex-1 h-1 rounded-full ${b}`} />
          ))}
        </div>
        <div className="text-[10px] font-mono text-ink-500 w-14 text-right">
          {labels[score]}
        </div>
      </div>
    </div>
  );
}

export function AgencySignupForm() {
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AgencySignupFormInput>({
    resolver: zodResolver(agencySignupFormSchema),
    mode: "onChange",
    defaultValues: {
      agencyName: "",
      agencyType: "per-diem",
      workforceSize: "",
      serviceArea: null,
      ownerName: "",
      phone: "",
      email: "",
      password: "",
      acceptedTerms: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    const result = await registerAgencyAction(toAgencySignupInput(values));
    if (result.status === "error") {
      setRootError(result.message);
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            setError(field as keyof AgencySignupFormInput, { message });
          }
        }
      }
    }
  });

  const ready = isValid;

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-12 grid grid-cols-12 gap-10">
      <form onSubmit={onSubmit} noValidate className="col-span-12 lg:col-span-7 rise-in">
        <Eyebrow>Agency workspace · onboarding</Eyebrow>
        <h1 className="mt-4 text-[36px] leading-[1.08] tracking-[-0.02em] font-medium">
          Set up your
          <span className="font-serif italic text-teal-800"> agency workspace.</span>
        </h1>
        <p className="mt-2 text-[14px] text-ink-600 max-w-md">
          Five minutes. You&apos;ll land in your operations console with a workspace ready to
          invite coordinators, professionals, and facilities.
        </p>

        {rootError && (
          <div
            className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
            role="alert"
          >
            {rootError}
          </div>
        )}

        <div className="mt-10">
          <SectionHeader index="01" title="About your agency" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Field label="Agency name" sub="Shown to facilities & professionals" error={errors.agencyName?.message}>
                <Input
                  placeholder="e.g. Apex Healthcare Staffing"
                  disabled={isSubmitting}
                  {...register("agencyName")}
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Agency type" error={errors.agencyType?.message}>
                <Controller
                  name="agencyType"
                  control={control}
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { id: "per-diem", label: "Per-diem", sub: "RN / CNA on-call" },
                        { id: "travel", label: "Travel", sub: "13-week+ assignments" },
                        { id: "allied", label: "Allied health", sub: "Therapy, imaging, lab" },
                        { id: "mixed", label: "Mixed", sub: "Multiple verticals" },
                      ]}
                    />
                  )}
                />
              </Field>
            </div>
            <Field
              label="Number of healthcare professionals"
              sub="Active roster"
              error={errors.workforceSize?.message}
            >
              <Select disabled={isSubmitting} {...register("workforceSize")}>
                <option value="">Select range…</option>
                <option value="1-25">1–25</option>
                <option value="26-100">26–100</option>
                <option value="101-500">101–500</option>
                <option value="501-2000">501–2,000</option>
                <option value="2000+">2,000+</option>
              </Select>
            </Field>
            <Field
              label="Primary service area"
              sub="City, metro, state, or ZIP"
              error={errors.serviceArea?.message}
            >
              <Controller
                name="serviceArea"
                control={control}
                render={({ field }) => (
                  <ServiceAreaAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Field>
          </div>
        </div>

        <div className="mt-10">
          <SectionHeader index="02" title="Owner account" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Owner name" error={errors.ownerName?.message}>
              <Input
                placeholder="Full name"
                disabled={isSubmitting}
                {...register("ownerName")}
              />
            </Field>
            <Field label="Phone number" error={errors.phone?.message}>
              <Input
                placeholder="(555) 010-2841"
                type="tel"
                disabled={isSubmitting}
                {...register("phone")}
              />
            </Field>
            <div className="col-span-2">
              <Field
                label="Work email"
                sub="We'll send a verification link"
                error={errors.email?.message}
              >
                <Input
                  placeholder="you@apexstaffing.com"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email")}
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field
                label="Password"
                sub="Use at least 8 characters"
                error={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-ink-200 bg-paper/40 p-4 flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-teal-700"
            disabled={isSubmitting}
            {...register("acceptedTerms")}
          />
          <div className="text-[12px] text-ink-600 leading-relaxed">
            I agree to the <a className="text-ink-900 underline">Terms of Service</a>,{" "}
            <a className="text-ink-900 underline">Business Associate Agreement</a>, and
            AsNeeded&apos;s{" "}
            <a className="text-ink-900 underline">privacy practices</a> for handling protected
            health information.
          </div>
          {errors.acceptedTerms?.message && (
            <p className="mt-2 text-[11px] font-mono text-rose-600" role="alert">
              {errors.acceptedTerms.message}
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={!ready || isSubmitting}
            className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full font-medium tracking-tight text-[14px] transition ${
              !ready
                ? "bg-ink-200 text-ink-500 cursor-not-allowed"
                : isSubmitting
                  ? "bg-ink-800 text-paper"
                  : "bg-ink-900 text-paper hover:bg-ink-800"
            }`}
          >
            {isSubmitting ? (
              <>
                <Icon name="loader-2" className="w-4 h-4 animate-spin" /> Creating workspace…
              </>
            ) : (
              <>
                Create workspace <Icon name="arrow-right" className="w-4 h-4" />
              </>
            )}
          </button>
          <div className="text-[11px] font-mono text-ink-500">
            Verification link → operations console · ~30s
          </div>
        </div>
      </form>

      <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-20 self-start">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <Badge tone="teal">
            <Dot tone="green" pulse /> Workspace preview
          </Badge>
          <h3 className="mt-3 text-[18px] font-medium tracking-tight">Here&apos;s what gets created</h3>
          <ul className="mt-4 divide-y divide-ink-100">
            {[
              {
                t: "Operations console",
                s: "Live staffing board for coordinators",
                i: "layout-dashboard",
              },
              {
                t: "Workforce roster",
                s: "Invite RNs, CNAs, EMTs · credentials tracked",
                i: "users",
              },
              {
                t: "Facility portal",
                s: "Customers submit & track requests",
                i: "building-2",
              },
              {
                t: "Compliance vault",
                s: "Per-state, per-role expiration alerts",
                i: "shield-check",
              },
              { t: "Comms", s: "Push, SMS, voice — all in-app", i: "message-square" },
            ].map((x, i) => (
              <li key={i} className="py-3 flex items-start gap-3">
                <span className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 inline-flex items-center justify-center shrink-0">
                  <Icon name={x.i} className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[13px] font-medium tracking-tight">{x.t}</div>
                  <div className="text-[11px] font-mono text-ink-500">{x.s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-950 text-paper p-6 overflow-hidden">
          <div className="flex items-center gap-2">
            <Avatar initials="LM" tone="teal" size={32} />
            <div className="leading-tight">
              <div className="text-[13px] tracking-tight">Lena Mahoney</div>
              <div className="text-[11px] font-mono text-paper/60">
                Director of Ops · Apex Staffing
              </div>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-[1.45] text-paper/85 text-balance">
            &quot;Setup took one afternoon. By the end of the week we had cut our coordinator
            workload in half and our fill rate was up 9 points.&quot;
          </p>
        </div>

        <div className="mt-4 text-[11px] font-mono text-ink-500 leading-relaxed px-1">
          You&apos;re creating an <span className="text-ink-800">owner</span> account for a new
          agency workspace. You&apos;ll be able to invite coordinators, recruiters, compliance
          leads, and your healthcare professionals after sign-up.
        </div>
      </aside>
    </div>
  );
}
