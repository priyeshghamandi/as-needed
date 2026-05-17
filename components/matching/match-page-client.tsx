"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { bulkInviteProfessionalsAction } from "@/actions/matching/bulk-invite";
import { cancelShiftAssignmentAction } from "@/actions/matching/cancel-assignment";
import { confirmShiftAssignmentAction } from "@/actions/matching/confirm-assignment";
import { inviteProfessionalToShiftAction } from "@/actions/matching/invite-professional";
import { canManageAssignments } from "@/lib/auth/assignments-access-rules";
import { AUTO_CONFIRM_ON_ACCEPT } from "@/lib/assignments/config";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import { StatusBadge } from "@/lib/staffing-requests/staffing-requests-ui";
import {
  AssignmentStatusBadge,
  AvailabilityBadge,
} from "@/lib/matching/match-ui";
import type { MatchCandidateRow, MatchPageShift, ShiftAssignmentRow } from "@/lib/matching/types";

export type SerializedMatchPageData = {
  request: {
    id: string;
    title: string;
    status: string;
    roleNeeded: string;
    professionalsRequired: number;
    filledCount: number;
    facilityName: string;
  };
  shifts: (Omit<MatchPageShift, "startAt" | "endAt"> & {
    startAt: string;
    endAt: string;
  })[];
  activeShiftId: string;
  candidates: MatchCandidateRow[];
  assignments: (Omit<ShiftAssignmentRow, "invitedAt" | "respondedAt" | "confirmedAt"> & {
    invitedAt: string | null;
    respondedAt: string | null;
    confirmedAt: string | null;
  })[];
  filters: {
    availableOnly: boolean;
    withinServiceArea: boolean;
    hasRequiredCredentials: boolean;
  };
};

export function MatchPageClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  data,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  data: SerializedMatchPageData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const canWrite = canManageAssignments(primaryRole);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const activeShift =
    data.shifts.find((s) => s.id === data.activeShiftId) ?? data.shifts[0];
  const readOnly =
    !canWrite ||
    data.request.status === "cancelled" ||
    activeShift?.status === "cancelled";

  const remainingSlots = activeShift?.remainingSlots ?? 0;

  const pushFilters = useCallback(
    (next: Partial<SerializedMatchPageData["filters"]>) => {
      const merged = { ...data.filters, ...next };
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("shiftId", data.activeShiftId);
      if (merged.availableOnly) sp.set("availableOnly", "1");
      else sp.delete("availableOnly");
      if (merged.withinServiceArea) sp.set("withinServiceArea", "1");
      else sp.delete("withinServiceArea");
      if (merged.hasRequiredCredentials) sp.set("hasRequiredCredentials", "1");
      else sp.delete("hasRequiredCredentials");
      startTransition(() => {
        router.push(`/staffing-requests/${data.request.id}/match?${sp.toString()}`);
      });
    },
    [data.activeShiftId, data.filters, data.request.id, router, searchParams],
  );

  const selectableCandidates = useMemo(
    () =>
      data.candidates.filter(
        (c) => !c.assignmentStatus || c.assignmentStatus === "declined" || c.assignmentStatus === "cancelled",
      ),
    [data.candidates],
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < remainingSlots) next.add(id);
      return next;
    });
  }

  async function handleInvite(professionalId: string) {
    const result = await inviteProfessionalToShiftAction(data.activeShiftId, professionalId);
    if (result.status === "success") {
      setToast("Invite sent.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handleBulkInvite() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const result = await bulkInviteProfessionalsAction(data.activeShiftId, ids);
    if (result.status === "success") {
      setToast(`Invited ${result.created.length} professional(s).`);
      setSelected(new Set());
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handleCancelInvite() {
    if (!cancelTarget) return;
    const result = await cancelShiftAssignmentAction(cancelTarget);
    setCancelTarget(null);
    if (result.status === "success") {
      setToast("Invite cancelled.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handleConfirm(assignmentId: string) {
    const result = await confirmShiftAssignmentAction(assignmentId);
    if (result.status === "success") {
      setToast("Assignment confirmed.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  function selectShift(shiftId: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("shiftId", shiftId);
    startTransition(() => {
      router.push(`/staffing-requests/${data.request.id}/match?${sp.toString()}`);
    });
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Match professionals"
      subtitle={data.request.title}
      headerAction={
        <Link
          href={`/staffing-requests/${data.request.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to request
        </Link>
      }
    >
      {toast ? (
        <div role="status" className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900">
          {toast}
        </div>
      ) : null}

      {readOnly && data.request.status === "cancelled" ? (
        <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-[13px] text-ink-700">
          This request was cancelled. Matching is read-only.
        </div>
      ) : null}

      <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.request.status} />
          <span className="text-[13px] text-ink-600">
            {data.request.filledCount} / {data.request.professionalsRequired} filled ·{" "}
            {data.request.facilityName}
          </span>
        </div>
        {remainingSlots === 0 ? (
          <p className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Fully confirmed — no remaining invite slots on this shift.
          </p>
        ) : null}
      </section>

      {data.shifts.length > 1 ? (
        <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-paper/95 backdrop-blur border-b border-ink-100">
          <label className="block text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Shift
          </label>
          <select
            aria-label="Shift"
            value={data.activeShiftId}
            onChange={(e) => selectShift(e.target.value)}
            className="mt-1 w-full max-w-md h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
          >
            {data.shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {formatShiftWindow(new Date(shift.startAt), new Date(shift.endAt))} ·{" "}
                {shift.filledCount}/{shift.requiredCount} filled
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <section className="rounded-xl border border-ink-200 bg-white p-4">
        <h2 className="text-[14px] font-medium tracking-tight">Filters</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Available only"
              checked={data.filters.availableOnly}
              disabled={pending}
              onChange={(e) => pushFilters({ availableOnly: e.target.checked })}
            />
            Available only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Within service area"
              checked={data.filters.withinServiceArea}
              disabled={pending}
              onChange={(e) => pushFilters({ withinServiceArea: e.target.checked })}
            />
            Within service area
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Has required credentials"
              checked={data.filters.hasRequiredCredentials}
              disabled={pending}
              onChange={(e) => pushFilters({ hasRequiredCredentials: e.target.checked })}
            />
            Has required credentials
          </label>
        </div>
      </section>

      {canWrite && selected.size > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
          <span className="text-[13px] text-teal-900">{selected.size} selected</span>
          <button
            type="button"
            disabled={pending || remainingSlots === 0}
            onClick={handleBulkInvite}
            className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-40"
          >
            Invite selected ({selected.size})
          </button>
        </div>
      ) : null}

      <section className="rounded-xl border border-ink-200 bg-white overflow-x-auto">
        <h2 className="p-4 pb-0 text-[14px] font-medium tracking-tight">Candidates</h2>
        {data.candidates.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-ink-500">
            No matching professionals. Try adjusting filters.
          </p>
        ) : (
          <table className="w-full text-left text-[13px] mt-2">
            <thead className="border-b border-ink-100 bg-ink-50/50">
              <tr>
                {canWrite ? <th scope="col" className="px-4 py-3 w-10" /> : null}
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Professional</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Role</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Location</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Availability</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Status</th>
                <th scope="col" className="px-4 py-3 font-medium text-ink-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.map((candidate) => {
                const canInvite =
                  canWrite &&
                  !readOnly &&
                  remainingSlots > 0 &&
                  (!candidate.assignmentStatus ||
                    candidate.assignmentStatus === "declined" ||
                    candidate.assignmentStatus === "cancelled");
                const isInvited = candidate.assignmentStatus === "invited";

                return (
                  <tr key={candidate.id} className="border-b border-ink-50">
                    {canWrite ? (
                      <td className="px-4 py-3">
                        {canInvite ? (
                          <input
                            type="checkbox"
                            aria-label={`Select ${candidate.firstName} ${candidate.lastName}`}
                            checked={selected.has(candidate.id)}
                            onChange={() => toggleSelect(candidate.id)}
                          />
                        ) : null}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                      {candidate.complianceWarnings.length > 0 ? (
                        <p
                          className="text-[11px] text-amber-700 mt-0.5"
                          title={candidate.complianceWarnings.join(", ")}
                        >
                          ⚠ {candidate.complianceWarnings.join(", ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 uppercase text-[12px]">{candidate.role}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {[candidate.city, candidate.state].filter(Boolean).join(", ") || "—"}
                      {candidate.distanceMiles != null ? (
                        <span className="block text-[11px]">{candidate.distanceMiles.toFixed(1)} mi</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityBadge status={candidate.availabilityStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {candidate.assignmentStatus ? (
                        <AssignmentStatusBadge status={candidate.assignmentStatus} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canInvite ? (
                        <button
                          type="button"
                          aria-label={`Invite ${candidate.firstName} ${candidate.lastName}`}
                          disabled={pending}
                          onClick={() => handleInvite(candidate.id)}
                          className="text-teal-700 hover:underline text-[13px]"
                        >
                          Invite
                        </button>
                      ) : isInvited && canWrite ? (
                        <button
                          type="button"
                          onClick={() => candidate.assignmentId && setCancelTarget(candidate.assignmentId)}
                          className="text-rose-700 hover:underline text-[13px]"
                        >
                          Cancel invite
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-5">
        <h2 className="text-[14px] font-medium tracking-tight">Existing invites</h2>
        {data.assignments.length === 0 ? (
          <p className="mt-2 text-[13px] text-ink-500">No assignments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {data.assignments.map((a) => (
              <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[13px]">{a.professionalName}</p>
                  {a.declineReason ? (
                    <p className="text-[12px] text-ink-500">Declined: {a.declineReason}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <AssignmentStatusBadge status={a.status} />
                  {canWrite && a.status === "invited" ? (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(a.id)}
                      className="text-[12px] text-rose-700 hover:underline"
                    >
                      Cancel
                    </button>
                  ) : null}
                  {canWrite && a.status === "accepted" && !AUTO_CONFIRM_ON_ACCEPT ? (
                    <button
                      type="button"
                      onClick={() => handleConfirm(a.id)}
                      className="text-[12px] text-teal-700 hover:underline"
                    >
                      Confirm
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cancelTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-invite-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h2 id="cancel-invite-title" className="text-[15px] font-medium tracking-tight">
              Cancel invite?
            </h2>
            <p className="mt-2 text-[13px] text-ink-600">
              The professional will no longer see this invite.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Keep invite
              </button>
              <button
                type="button"
                onClick={handleCancelInvite}
                className="h-10 px-4 rounded-md bg-rose-700 text-white text-[13px] font-medium"
              >
                Cancel invite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AgencyShell>
  );
}
