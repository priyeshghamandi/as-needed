"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FacilityShell } from "@/components/facility/facility-shell";
import { createFacilityStaffingRequestAction } from "@/actions/facility/create-facility-staffing-request";
import {
  FACILITY_STAFFING_PRIORITIES,
  facilityStaffingRequestSchema,
  suggestFacilityRequestTitle,
  type FacilityStaffingRequestInput,
} from "@/lib/validations/facility-staffing-request";
import {
  WORKFORCE_PROFESSIONAL_ROLES,
  WORKFORCE_ROLE_LABELS,
} from "@/lib/validations/workforce-professional";

export function FacilityRequestCreateForm({
  facilityName,
  agencyName,
  userName,
  userInitials,
}: {
  facilityName: string;
  agencyName: string;
  userName: string;
  userInitials: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const titleTouched = useRef(false);

  const form = useForm<FacilityStaffingRequestInput>({
    resolver: zodResolver(facilityStaffingRequestSchema),
    defaultValues: {
      title: suggestFacilityRequestTitle("rn", facilityName),
      roleNeeded: "rn",
      specialty: "",
      professionalsRequired: 1,
      shiftDate: "",
      startTime: "07:00",
      endTime: "19:00",
      priority: "normal",
      notes: "",
      facilityInstructions: "",
    },
  });

  const roleNeeded = form.watch("roleNeeded");

  useEffect(() => {
    if (titleTouched.current) return;
    form.setValue("title", suggestFacilityRequestTitle(roleNeeded, facilityName));
  }, [roleNeeded, facilityName, form]);

  async function onSubmit(values: FacilityStaffingRequestInput) {
    if (submitting) return;
    setSubmitting(true);
    const result = await createFacilityStaffingRequestAction(values);
    if (result.status === "success") {
      router.push(`/facility/requests/${result.requestId}?submitted=1`);
      return;
    }
    setSubmitting(false);
    if (result.status === "error") {
      if (result.field) {
        form.setError(result.field as keyof FacilityStaffingRequestInput, {
          message: result.message,
        });
        return;
      }
      form.setError("root", { message: result.message });
    }
  }

  return (
    <FacilityShell
      facilityName={facilityName}
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="Create staffing request"
      subtitle="Submit a staffing need for your facility. Your agency coordinators will match professionals."
      headerAction={
        <Link
          href="/facility/requests"
          className="text-[13px] text-ink-600 hover:text-ink-900"
        >
          Back to requests
        </Link>
      }
    >
      {form.formState.errors.root ? (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
        >
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8 rounded-xl border border-ink-200 bg-white p-6"
      >
        <section className="space-y-4">
          <h2 className="text-[14px] font-medium">Request details</h2>
          <label className="block" htmlFor="fport-title">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Title</span>
            <input
              id="fport-title"
              {...form.register("title", {
                onChange: () => {
                  titleTouched.current = true;
                },
              })}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.title ? (
              <p className="mt-1 text-[12px] text-rose-600">{form.formState.errors.title.message}</p>
            ) : null}
          </label>
          <label className="block" htmlFor="fport-role">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Role needed</span>
            <select
              id="fport-role"
              {...form.register("roleNeeded")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {WORKFORCE_PROFESSIONAL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {WORKFORCE_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor="fport-specialty">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Specialty</span>
            <input
              id="fport-specialty"
              {...form.register("specialty")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="fport-count">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Professionals required
            </span>
            <input
              id="fport-count"
              type="number"
              min={1}
              max={50}
              {...form.register("professionalsRequired", { valueAsNumber: true })}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.professionalsRequired ? (
              <p className="mt-1 text-[12px] text-rose-600">
                {form.formState.errors.professionalsRequired.message}
              </p>
            ) : null}
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-medium">Shift timing</h2>
          <label className="block" htmlFor="fport-date">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Shift date</span>
            <input
              id="fport-date"
              type="date"
              {...form.register("shiftDate")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.shiftDate ? (
              <p className="mt-1 text-[12px] text-rose-600">{form.formState.errors.shiftDate.message}</p>
            ) : null}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block" htmlFor="fport-start">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Start time</span>
              <input
                id="fport-start"
                type="time"
                {...form.register("startTime")}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
            <label className="block" htmlFor="fport-end">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">End time</span>
              <input
                id="fport-end"
                type="time"
                {...form.register("endTime")}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
          </div>
          {form.formState.errors.endTime ? (
            <p className="text-[12px] text-rose-600">{form.formState.errors.endTime.message}</p>
          ) : null}
          <label className="block" htmlFor="fport-priority">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Priority</span>
            <select
              id="fport-priority"
              {...form.register("priority")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {FACILITY_STAFFING_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-medium">Notes</h2>
          <label className="block" htmlFor="fport-notes">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Notes</span>
            <textarea
              id="fport-notes"
              rows={3}
              {...form.register("notes")}
              className="mt-1 w-full p-3 rounded-lg border border-ink-200 text-[14px] resize-none"
            />
          </label>
          <label className="block" htmlFor="fport-instructions">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Facility instructions
            </span>
            <textarea
              id="fport-instructions"
              rows={3}
              {...form.register("facilityInstructions")}
              className="mt-1 w-full p-3 rounded-lg border border-ink-200 text-[14px] resize-none"
            />
          </label>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit staffing request"}
        </button>
      </form>
    </FacilityShell>
  );
}
