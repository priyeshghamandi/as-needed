"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { cancelShiftAction } from "@/actions/shifts/cancel-shift";
import { createSecondaryShiftAction } from "@/actions/shifts/create-secondary-shift";
import { updateShiftAction } from "@/actions/shifts/update-shift";
import { canManageShifts } from "@/lib/auth/shifts-access-rules";
import {
  combineShiftDateTimes,
  formatShiftWindow,
} from "@/lib/staffing-requests/shift-datetime";
import {
  ASSIGNMENT_STATUS_LABELS,
  ShiftStatusBadge,
  shortShiftId,
} from "@/lib/shifts/shifts-ui";

const AGENCY_TZ = "America/Los_Angeles";

function toAgencyDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: AGENCY_TZ });
}

function toAgencyTimeString(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: AGENCY_TZ,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type SerializedShiftDetail = {
  id: string;
  shiftType: string | null;
  breakMinutes: number | null;
  startAt: string;
  endAt: string;
  requiredCount: number;
  filledCount: number;
  progress: number;
  status: string;
  staffingRequestId: string;
  requestTitle: string;
  requestStatus: string;
  facility: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  };
  assignments: {
    id: string;
    professionalName: string;
    role: string;
    status: string;
    invitedAt: string | null;
    respondedAt: string | null;
  }[];
  isUrgent: boolean;
  canEdit: boolean;
};

export function ShiftDetailClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  shift,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  shift: SerializedShiftDetail;
}) {
  const router = useRouter();
  const canWrite = canManageShifts(primaryRole);
  const [status, setStatus] = useState(shift.status);
  const [startAt, setStartAt] = useState(shift.startAt);
  const [endAt, setEndAt] = useState(shift.endAt);
  const [toast, setToast] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  const initialEdit = useMemo(
    () => ({
      shiftDate: toAgencyDateString(new Date(startAt)),
      startTime: toAgencyTimeString(new Date(startAt)),
      endTime: toAgencyTimeString(new Date(endAt)),
      shiftType: shift.shiftType ?? "day",
      breakMinutes: shift.breakMinutes ?? 0,
    }),
    [startAt, endAt, shift.shiftType, shift.breakMinutes],
  );

  const [editForm, setEditForm] = useState(initialEdit);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const [secondaryForm, setSecondaryForm] = useState({
    shiftDate: tomorrow.toISOString().slice(0, 10),
    startTime: "07:00",
    endTime: "15:00",
    shiftType: "day",
    requiredCount: 1,
  });

  const showWriteActions = canWrite && shift.canEdit && status !== "cancelled";

  async function handleSaveEdit() {
    const { startAt: nextStart, endAt: nextEnd } = combineShiftDateTimes(
      editForm.shiftDate,
      editForm.startTime,
      editForm.endTime,
    );
    const result = await updateShiftAction(shift.id, {
      startAt: nextStart,
      endAt: nextEnd,
      shiftType: editForm.shiftType as "day",
      breakMinutes: editForm.breakMinutes,
    });
    if (result.status === "success") {
      setStartAt(nextStart.toISOString());
      setEndAt(nextEnd.toISOString());
      setEditOpen(false);
      setToast("Shift times updated.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handleCancel() {
    const result = await cancelShiftAction(shift.id);
    if (result.status === "success") {
      setStatus("cancelled");
      setCancelOpen(false);
      setToast("Shift cancelled.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handleAddSecondary() {
    const result = await createSecondaryShiftAction({
      staffingRequestId: shift.staffingRequestId,
      facilityId: shift.facility.id,
      shiftDate: secondaryForm.shiftDate,
      startTime: secondaryForm.startTime,
      endTime: secondaryForm.endTime,
      shiftType: secondaryForm.shiftType as "day",
      requiredCount: secondaryForm.requiredCount,
    });
    if (result.status === "success") {
      setSecondaryOpen(false);
      setToast("Secondary shift added.");
      router.push(`/staffing-requests/${shift.staffingRequestId}`);
      return;
    }
    setToast(result.message);
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title={shift.requestTitle}
      subtitle={`Shift ${shortShiftId(shift.id)} · ${shift.facility.name}`}
      headerAction={
        <Link
          href="/shifts"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to shifts
        </Link>
      }
    >
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900"
        >
          {toast}
        </div>
      ) : null}

      {status === "cancelled" ? (
        <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-[13px] text-ink-700">
          This shift was cancelled.
        </div>
      ) : null}

      {shift.isUrgent && status !== "cancelled" && status !== "completed" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          Urgent: starts within 24 hours and is not fully filled.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <ShiftStatusBadge status={status} />
        <Link
          href={`/staffing-requests/${shift.staffingRequestId}`}
          className="text-[13px] text-teal-700 hover:underline"
        >
          {shift.requestTitle}
        </Link>
        <span className="text-ink-300">·</span>
        <Link
          href={`/facilities/${shift.facility.id}`}
          className="text-[13px] text-teal-700 hover:underline"
        >
          {shift.facility.name}
        </Link>
      </div>

      {showWriteActions ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setEditForm({
                shiftDate: toAgencyDateString(new Date(startAt)),
                startTime: toAgencyTimeString(new Date(startAt)),
                endTime: toAgencyTimeString(new Date(endAt)),
                shiftType: shift.shiftType ?? "day",
                breakMinutes: shift.breakMinutes ?? 0,
              });
              setEditOpen(true);
            }}
            className="inline-flex items-center min-h-11 h-11 px-4 rounded-full border border-ink-200 text-[13px] font-medium hover:bg-ink-50"
          >
            Edit times
          </button>
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="inline-flex items-center min-h-11 h-11 px-4 rounded-full border border-rose-200 text-rose-800 text-[13px] font-medium hover:bg-rose-50"
          >
            Cancel shift
          </button>
          <Link
            href={`/staffing-requests/${shift.staffingRequestId}/match`}
            className="inline-flex items-center min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
          >
            Match professionals
          </Link>
          <button
            type="button"
            onClick={() => setSecondaryOpen(true)}
            className="inline-flex items-center min-h-11 h-11 px-4 rounded-full border border-ink-200 text-[13px] font-medium hover:bg-ink-50"
          >
            Add secondary shift
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-2">
          <h2 className="text-[14px] font-medium tracking-tight">Timing</h2>
          <p className="text-[13px] text-ink-700">
            {formatShiftWindow(new Date(startAt), new Date(endAt))}
          </p>
          {shift.shiftType ? (
            <p className="text-[13px] text-ink-600">Type: {shift.shiftType}</p>
          ) : null}
          {shift.breakMinutes != null && shift.breakMinutes > 0 ? (
            <p className="text-[13px] text-ink-600">Break: {shift.breakMinutes} min</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5">
          <h2 className="text-[14px] font-medium tracking-tight">Fulfillment</h2>
          <p className="mt-2 text-[20px] font-semibold tracking-tight">
            {shift.filledCount} / {shift.requiredCount}
          </p>
          <div className="mt-3 h-2 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full"
              style={{ width: `${Math.round(shift.progress * 100)}%` }}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-ink-200 bg-white p-5 overflow-x-auto">
        <h2 className="text-[14px] font-medium tracking-tight">Assignments</h2>
        {shift.assignments.length === 0 ? (
          <p className="mt-2 text-[13px] text-ink-500">No assignments yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-[13px]">
            <thead className="border-b border-ink-100">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium text-ink-600">Professional</th>
                <th scope="col" className="py-2 pr-4 font-medium text-ink-600">Role</th>
                <th scope="col" className="py-2 pr-4 font-medium text-ink-600">Status</th>
                <th scope="col" className="py-2 font-medium text-ink-600">Responded</th>
              </tr>
            </thead>
            <tbody>
              {shift.assignments.map((a) => (
                <tr key={a.id} className="border-b border-ink-50">
                  <td className="py-2 pr-4">{a.professionalName}</td>
                  <td className="py-2 pr-4 uppercase text-[12px] text-ink-600">{a.role}</td>
                  <td className="py-2 pr-4">
                    {ASSIGNMENT_STATUS_LABELS[a.status] ?? a.status}
                  </td>
                  <td className="py-2 text-ink-500">
                    {a.respondedAt
                      ? new Date(a.respondedAt).toLocaleString("en-US", {
                          timeZone: AGENCY_TZ,
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-shift-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h2 id="edit-shift-title" className="text-[15px] font-medium tracking-tight">
              Edit shift times
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block" htmlFor="edit-shift-date">
                <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Date</span>
                <input
                  id="edit-shift-date"
                  type="date"
                  value={editForm.shiftDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, shiftDate: e.target.value }))}
                  className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block" htmlFor="edit-start-time">
                  <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Start</span>
                  <input
                    id="edit-start-time"
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                  />
                </label>
                <label className="block" htmlFor="edit-end-time">
                  <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">End</span>
                  <input
                    id="edit-end-time"
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                  />
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-shift-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h2 id="cancel-shift-title" className="text-[15px] font-medium tracking-tight">
              Cancel shift?
            </h2>
            <p className="mt-2 text-[13px] text-ink-600">
              Active assignments will be cancelled. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Keep shift
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 px-4 rounded-md bg-rose-700 text-white text-[13px] font-medium"
              >
                Cancel shift
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {secondaryOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="secondary-shift-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h2 id="secondary-shift-title" className="text-[15px] font-medium tracking-tight">
              Add secondary shift
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block" htmlFor="sec-shift-date">
                <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Date</span>
                <input
                  id="sec-shift-date"
                  type="date"
                  value={secondaryForm.shiftDate}
                  onChange={(e) =>
                    setSecondaryForm((f) => ({ ...f, shiftDate: e.target.value }))
                  }
                  className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block" htmlFor="sec-start-time">
                  <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Start</span>
                  <input
                    id="sec-start-time"
                    type="time"
                    value={secondaryForm.startTime}
                    onChange={(e) =>
                      setSecondaryForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                  />
                </label>
                <label className="block" htmlFor="sec-end-time">
                  <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">End</span>
                  <input
                    id="sec-end-time"
                    type="time"
                    value={secondaryForm.endTime}
                    onChange={(e) =>
                      setSecondaryForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
                  />
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSecondaryOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAddSecondary}
                className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium"
              >
                Add shift
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AgencyShell>
  );
}
