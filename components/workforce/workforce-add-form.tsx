"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { createHealthcareProfessionalAction } from "@/actions/workforce/create-professional";
import {
  workforceAddFormSchema,
  WORKFORCE_PROFESSIONAL_ROLES,
  WORKFORCE_ROLE_LABELS,
  type WorkforceAddFormValues,
} from "@/lib/validations/workforce-professional";
import type { GeographicLocation } from "@/lib/geographic-location";
import type { ServiceAreaRestrictionInput } from "@/lib/places/query-params";
export function WorkforceAddForm({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  serviceArea,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  serviceArea: ServiceAreaRestrictionInput;
}) {
  const router = useRouter();
  const [location, setLocation] = useState<GeographicLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<WorkforceAddFormValues>({
    resolver: zodResolver(workforceAddFormSchema) as never,
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "rn",
      specialty: "",
      yearsExperience: undefined,
      email: "",
      phone: "",
      sendInvite: false,
    },
  });

  const sendInvite = useWatch({ control: form.control, name: "sendInvite" });

  async function onSubmit(values: WorkforceAddFormValues) {
    setFormError(null);
    setLocationError(null);
    if (!location?.placeId) {
      setLocationError("Location is required");
      return;
    }
    if (Number.isNaN(values.yearsExperience as number)) {
      values.yearsExperience = undefined;
    }
    const result = await createHealthcareProfessionalAction({
      ...values,
      location,
    });
    if (result.status === "success") {
      router.replace(`/workforce/${result.professionalId}`);
      return;
    }
    if (result.status !== "error") return;
    if (result.field === "location") {
      setLocationError(result.message);
      return;
    }
    if (result.field) {
      form.setError(result.field as keyof WorkforceAddFormValues, { message: result.message });
      return;
    }
    setFormError(result.message);
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Add healthcare professional"
      subtitle="Create a roster record and optionally send a platform invite"
      headerAction={
        <Link
          href="/workforce"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to workforce
        </Link>
      }
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
        >
          {formError}
        </div>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-5 rounded-xl border border-ink-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block" htmlFor="wf-firstName">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              First name
            </span>
            <input
              id="wf-firstName"
              {...form.register("firstName")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.firstName ? (
              <p className="mt-1 text-[12px] text-rose-600">
                {form.formState.errors.firstName.message}
              </p>
            ) : null}
          </label>
          <label className="block" htmlFor="wf-lastName">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Last name
            </span>
            <input
              id="wf-lastName"
              {...form.register("lastName")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.lastName ? (
              <p className="mt-1 text-[12px] text-rose-600">
                {form.formState.errors.lastName.message}
              </p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Role</span>
          <select
            {...form.register("role")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
          >
            {WORKFORCE_PROFESSIONAL_ROLES.map((r) => (
              <option key={r} value={r}>
                {WORKFORCE_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Specialty (optional)
          </span>
          <input
            {...form.register("specialty")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Years of experience
          </span>
          <input
            type="number"
            {...form.register("yearsExperience", {
              setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
            })}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.yearsExperience ? (
            <p className="mt-1 text-[12px] text-rose-600">
              {form.formState.errors.yearsExperience.message}
            </p>
          ) : null}
        </label>

        <label className="block" htmlFor="wf-email">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Email</span>
          <input
            id="wf-email"
            type="email"
            {...form.register("email")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-[12px] text-rose-600">{form.formState.errors.email.message}</p>
          ) : null}
        </label>

        <label className="block" htmlFor="wf-phone">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Phone</span>
          <input
            id="wf-phone"
            {...form.register("phone")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.phone ? (
            <p className="mt-1 text-[12px] text-rose-600">{form.formState.errors.phone.message}</p>
          ) : null}
        </label>

        <div>
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Location
          </span>
          <div className="mt-1">
            <LocationAutocomplete
              value={location}
              onChange={(loc) => {
                setLocation(loc);
                setLocationError(null);
              }}
              placeholder="Search city, metro, or ZIP"
              {...serviceArea}
            />
          </div>
          {locationError ? (
            <p className="mt-1 text-[12px] text-rose-600">{locationError}</p>
          ) : null}
        </div>

        <label htmlFor="wf-sendInvite" className="flex items-center gap-2 text-[13px] text-ink-800">
          <input id="wf-sendInvite" type="checkbox" {...form.register("sendInvite")} />
          Send platform invite
        </label>
        {sendInvite ? (
          <p className="text-[12px] text-ink-500 -mt-3">Email is required when sending an invite.</p>
        ) : null}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto min-h-11 h-11 px-6 rounded-lg bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800 disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Saving…" : "Add professional"}
        </button>
      </form>
    </AgencyShell>
  );
}
