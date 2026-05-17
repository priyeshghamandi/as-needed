"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { createFacilityAction } from "@/actions/facilities/create-facility";
import {
  facilityAddFormSchema,
  FACILITY_TYPES,
  type FacilityAddFormValues,
} from "@/lib/validations/facility";
import { facilityTypeLabel } from "@/lib/facilities/facilities-ui";
import type { GeographicLocation } from "@/lib/geographic-location";
import type { ServiceAreaRestrictionInput } from "@/lib/places/query-params";

export function FacilityAddForm({
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

  const form = useForm<FacilityAddFormValues>({
    resolver: zodResolver(facilityAddFormSchema) as never,
    defaultValues: {
      name: "",
      type: "hospital",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
      inviteContact: true,
    },
  });

  const inviteContact = useWatch({ control: form.control, name: "inviteContact" });

  async function onSubmit(values: FacilityAddFormValues) {
    setFormError(null);
    setLocationError(null);
    if (!location?.placeId) {
      setLocationError("Location is required");
      return;
    }

    const result = await createFacilityAction({
      ...values,
      location,
    });

    if (result.status === "success") {
      router.replace(`/facilities/${result.facilityId}`);
      return;
    }
    if (result.status !== "error") return;
    if (result.field === "location") {
      setLocationError(result.message);
      return;
    }
    if (result.field) {
      form.setError(result.field as keyof FacilityAddFormValues, { message: result.message });
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
      title="Add facility"
      subtitle="Create a customer facility and optionally invite the contact"
      headerAction={
        <Link
          href="/facilities"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to facilities
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
        <label className="block" htmlFor="fac-name">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Facility name
          </span>
          <input
            id="fac-name"
            {...form.register("name")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.name ? (
            <p className="mt-1 text-[12px] text-rose-600">{form.formState.errors.name.message}</p>
          ) : null}
        </label>

        <label className="block" htmlFor="fac-type">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Type</span>
          <select
            id="fac-type"
            {...form.register("type")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
          >
            {FACILITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {facilityTypeLabel(t)}
              </option>
            ))}
          </select>
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

        <label className="block" htmlFor="fac-contact-name">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Contact name
          </span>
          <input
            id="fac-contact-name"
            {...form.register("contactName")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.contactName ? (
            <p className="mt-1 text-[12px] text-rose-600">
              {form.formState.errors.contactName.message}
            </p>
          ) : null}
        </label>

        <label className="block" htmlFor="fac-contact-email">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Contact email
          </span>
          <input
            id="fac-contact-email"
            type="email"
            {...form.register("contactEmail")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.contactEmail ? (
            <p className="mt-1 text-[12px] text-rose-600">
              {form.formState.errors.contactEmail.message}
            </p>
          ) : null}
        </label>

        <label className="block" htmlFor="fac-contact-phone">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Contact phone
          </span>
          <input
            id="fac-contact-phone"
            {...form.register("contactPhone")}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
          {form.formState.errors.contactPhone ? (
            <p className="mt-1 text-[12px] text-rose-600">
              {form.formState.errors.contactPhone.message}
            </p>
          ) : null}
        </label>

        <label className="block" htmlFor="fac-notes">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Notes</span>
          <textarea
            id="fac-notes"
            {...form.register("notes")}
            rows={3}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
          />
        </label>

        <label htmlFor="fac-invite" className="flex items-center gap-2 text-[13px] text-ink-800">
          <input id="fac-invite" type="checkbox" {...form.register("inviteContact")} />
          Invite facility contact
        </label>
        {inviteContact ? (
          <p className="text-[12px] text-ink-500 -mt-3">
            An invite will be sent to the contact email.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto min-h-11 h-11 px-6 rounded-lg bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800 disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Saving…" : "Add facility"}
        </button>
      </form>
    </AgencyShell>
  );
}
