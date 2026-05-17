"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { createStaffingRequestAction } from "@/actions/staffing-requests/create-staffing-request";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";
import {
  SHIFT_TYPES,
  STAFFING_PRIORITIES,
  staffingRequestFormSchema,
  type StaffingRequestFormInput,
} from "@/lib/validations/staffing-request";
import { WORKFORCE_PROFESSIONAL_ROLES } from "@/lib/validations/workforce-professional";

function tomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function StaffingRequestCreateForm({
  agencyName,
  userName,
  userInitials,
  userId,
  facilities,
  coordinators,
  prefillFacilityId,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  userId: string;
  facilities: { id: string; name: string }[];
  coordinators: { id: string; name: string }[];
  prefillFacilityId?: string;
}) {
  const router = useRouter();

  const form = useForm<StaffingRequestFormInput>({
    resolver: zodResolver(staffingRequestFormSchema) as never,
    mode: "onSubmit",
    defaultValues: {
      facilityId: prefillFacilityId ?? "",
      facilityUnit: "",
      title: "",
      roleNeeded: "rn",
      specialty: "",
      professionalsRequired: 1,
      shiftDate: tomorrowDateString(),
      startTime: "07:00",
      endTime: "15:00",
      shiftType: "day",
      priority: "normal",
      requiredCredentials: [],
      minYearsExperience: undefined,
      assignedCoordinatorId: userId,
      notes: "",
      facilityInstructions: "",
      saveAsDraft: false,
    },
  });

  const facilityId = useWatch({ control: form.control, name: "facilityId" });
  const roleNeeded = useWatch({ control: form.control, name: "roleNeeded" });
  const facilityName = useMemo(
    () => facilities.find((f) => f.id === facilityId)?.name ?? "",
    [facilities, facilityId],
  );

  useEffect(() => {
    if (!facilityName || !roleNeeded) return;
    const suggested = `${facilityName} – ${roleNeededLabel(roleNeeded)}`;
    const current = form.getValues("title");
    if (!current || current.includes("–")) {
      form.setValue("title", suggested);
    }
  }, [facilityName, roleNeeded, form]);

  async function onSubmit(values: StaffingRequestFormInput) {
    const credentialsRaw = form.getValues("requiredCredentials");
    const payload = {
      ...values,
      requiredCredentials: Array.isArray(credentialsRaw)
        ? credentialsRaw
        : String(credentialsRaw ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    };

    const result = await createStaffingRequestAction(payload);
    if (result.status === "success") {
      router.replace(`/staffing-requests/${result.requestId}`);
      return;
    }
    if (result.status === "error") {
      if (result.field) {
        form.setError(result.field as keyof StaffingRequestFormInput, {
          message: result.message,
        });
        return;
      }
      form.setError("root", { message: result.message });
    }
  }

  if (facilities.length === 0) {
    return (
      <AgencyShell
        agencyName={agencyName}
        userName={userName}
        userInitials={userInitials}
        title="New staffing request"
        subtitle="Add a facility before creating requests"
      >
        <p className="text-[14px] text-ink-700">
          You need at least one facility.{" "}
          <Link href="/facilities/new" className="text-teal-700 hover:underline">
            Add a facility
          </Link>
        </p>
      </AgencyShell>
    );
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="New staffing request"
      subtitle="Create a staffing request and primary shift"
      headerAction={
        <Link
          href="/staffing-requests"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to list
        </Link>
      }
    >
      {form.formState.errors.root ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8 rounded-xl border border-ink-200 bg-white p-6"
      >
        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight">Facility & role</h2>
          <label className="block" htmlFor="req-facility">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Facility</span>
          <select
            id="req-facility"
            aria-label="Facility"
            {...form.register("facilityId")}
            disabled={Boolean(prefillFacilityId)}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white disabled:bg-ink-50"
          >
              <option value="">Select facility</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor="req-unit">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Facility unit / department
            </span>
            <input
              id="req-unit"
              {...form.register("facilityUnit")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="req-title">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Title</span>
            <input
              id="req-title"
              {...form.register("title")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="req-role">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Role needed</span>
            <select
              id="req-role"
              {...form.register("roleNeeded")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {WORKFORCE_PROFESSIONAL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleNeededLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor="req-specialty">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Specialty</span>
            <input
              id="req-specialty"
              {...form.register("specialty")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="req-count">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Professionals required
            </span>
            <input
              id="req-count"
              type="number"
              min={1}
              max={50}
              {...form.register("professionalsRequired")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight">Shift timing</h2>
          <label className="block" htmlFor="req-date">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Shift date</span>
            <input
              id="req-date"
              type="date"
              {...form.register("shiftDate")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
            {form.formState.errors.shiftDate ? (
              <p className="mt-1 text-[12px] text-rose-600">
                {form.formState.errors.shiftDate.message}
              </p>
            ) : null}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block" htmlFor="req-start">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Start time</span>
              <input
                id="req-start"
                type="time"
                {...form.register("startTime")}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
            <label className="block" htmlFor="req-end">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">End time</span>
              <input
                id="req-end"
                type="time"
                {...form.register("endTime")}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
          </div>
          <label className="block" htmlFor="req-shift-type">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Shift type</span>
            <select
              id="req-shift-type"
              {...form.register("shiftType")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {SHIFT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor="req-priority">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Priority</span>
            <select
              id="req-priority"
              {...form.register("priority")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {STAFFING_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight">Requirements & notes</h2>
          <label className="block" htmlFor="req-creds">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Required certifications (comma-separated)
            </span>
            <input
              id="req-creds"
              placeholder="BLS, ACLS"
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                form.setValue("requiredCredentials", tags);
              }}
            />
          </label>
          <label className="block" htmlFor="req-exp">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Minimum years experience
            </span>
            <input
              id="req-exp"
              type="number"
              min={0}
              max={40}
              {...form.register("minYearsExperience")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="req-coordinator">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Assigned coordinator
            </span>
            <select
              id="req-coordinator"
              {...form.register("assignedCoordinatorId")}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              {coordinators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor="req-notes">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Internal notes</span>
            <textarea
              id="req-notes"
              rows={3}
              {...form.register("notes")}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <label className="block" htmlFor="req-instructions">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
              Facility instructions
            </span>
            <textarea
              id="req-instructions"
              rows={3}
              {...form.register("facilityInstructions")}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white pt-2 pb-1">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={() => form.setValue("saveAsDraft", false)}
            className="min-h-11 h-11 px-6 rounded-lg bg-ink-900 text-paper text-[14px] font-medium disabled:opacity-60"
          >
            {form.formState.isSubmitting ? "Saving…" : "Create request"}
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={() => form.setValue("saveAsDraft", true)}
            className="min-h-11 h-11 px-6 rounded-lg border border-ink-200 text-[14px] font-medium disabled:opacity-60"
          >
            Save draft
          </button>
        </div>
      </form>
    </AgencyShell>
  );
}
