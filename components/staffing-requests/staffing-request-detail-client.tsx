"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, Badge } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { transitionStaffingRequestStatusAction } from "@/actions/staffing-requests/transition-status";
import { publishStaffingRequestDraftAction } from "@/actions/staffing-requests/publish-draft";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import {
  PriorityBadge,
  roleNeededLabel,
  StatusBadge,
} from "@/lib/staffing-requests/staffing-requests-ui";
import { facilityTypeLabel } from "@/lib/facilities/facilities-ui";

export type SerializedStaffingRequestDetail = {
  id: string;
  title: string;
  status: string;
  priority: string;
  roleNeeded: string;
  specialty: string | null;
  professionalsRequired: number;
  filledCount: number;
  progress: number;
  requiredCredentials: string[] | null;
  notes: string | null;
  facilityInstructions: string | null;
  coordinatorName: string | null;
  facility: {
    id: string;
    name: string;
    type: string;
    city: string | null;
    state: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  shifts: {
    id: string;
    startAt: string;
    endAt: string;
    shiftType: string | null;
    status: string;
  }[];
};

export function StaffingRequestDetailClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  request,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  request: SerializedStaffingRequestDetail;
}) {
  const router = useRouter();
  const canWrite = canManageStaffingRequests(primaryRole);
  const [toast, setToast] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [status, setStatus] = useState(request.status);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [publishShiftDate, setPublishShiftDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [publishStartTime, setPublishStartTime] = useState("07:00");
  const [publishEndTime, setPublishEndTime] = useState("15:00");

  const canStartMatching = ["open", "partially_filled", "at_risk"].includes(status);
  const canCancel = !["completed", "cancelled"].includes(status);
  const isDraft = status === "draft";

  async function handleTransition(toStatus: string) {
    const result = await transitionStaffingRequestStatusAction(request.id, toStatus);
    if (result.status === "success") {
      setStatus(result.newStatus);
      setToast(toStatus === "cancelled" ? "Request cancelled." : "Status updated.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  async function handlePublishDraft() {
    const result = await publishStaffingRequestDraftAction(request.id, {
      facilityId: request.facility.id,
      facilityUnit: "",
      title: request.title,
      roleNeeded: request.roleNeeded as "rn",
      specialty: request.specialty ?? "",
      professionalsRequired: request.professionalsRequired,
      shiftDate: publishShiftDate,
      startTime: publishStartTime,
      endTime: publishEndTime,
      shiftType: "day",
      priority: request.priority as "normal",
      notes: request.notes ?? "",
      facilityInstructions: request.facilityInstructions ?? "",
    });
    if (result.status === "success") {
      setStatus("open");
      setToast("Request published.");
      router.refresh();
      return;
    }
    setToast(result.message);
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title={request.title}
      subtitle={request.facility.name}
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
          This request was cancelled.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        <PriorityBadge priority={request.priority} />
        {canWrite && canStartMatching ? (
          <button
            type="button"
            onClick={() => handleTransition("matching")}
            className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium"
          >
            Start matching
          </button>
        ) : null}
        {canWrite && isDraft ? (
          <button
            type="button"
            onClick={handlePublishDraft}
            className="h-9 px-3 rounded-md border border-ink-200 text-[13px] font-medium"
          >
            Publish request
          </button>
        ) : null}
        {canWrite && canCancel ? (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="h-9 px-3 rounded-md border border-rose-200 text-rose-700 text-[13px]"
          >
            Cancel request
          </button>
        ) : null}
        {status === "matching" ? (
          <Link
            href={`/staffing-requests/${request.id}/match`}
            className="h-9 px-3 inline-flex items-center rounded-md border border-ink-200 text-[13px] text-teal-700"
          >
            Open matching
          </Link>
        ) : null}
      </div>

      {canWrite && isDraft ? (
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Complete shift to publish</h2>
          <label className="block" htmlFor="pub-date">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Shift date</span>
            <input
              id="pub-date"
              type="date"
              value={publishShiftDate}
              onChange={(e) => setPublishShiftDate(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block" htmlFor="pub-start">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Start</span>
              <input
                id="pub-start"
                type="time"
                value={publishStartTime}
                onChange={(e) => setPublishStartTime(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
            <label className="block" htmlFor="pub-end">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">End</span>
              <input
                id="pub-end"
                type="time"
                value={publishEndTime}
                onChange={(e) => setPublishEndTime(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
          </div>
        </section>
      ) : null}

      {!isDraft ? (
        <section className="rounded-xl border border-ink-200 bg-white p-5">
          <h2 className="text-[14px] font-medium tracking-tight">Fulfillment</h2>
          <p className="mt-2 text-[20px] font-semibold tracking-tight">
            {request.filledCount} / {request.professionalsRequired}
          </p>
          <div className="mt-3 h-2 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full"
              style={{ width: `${Math.round(request.progress * 100)}%` }}
            />
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-2">
          <h2 className="text-[14px] font-medium tracking-tight">Summary</h2>
          <p className="text-[13px] text-ink-700">
            Role: {roleNeededLabel(request.roleNeeded)}
            {request.specialty ? ` · ${request.specialty}` : ""}
          </p>
          {request.coordinatorName ? (
            <p className="text-[13px] text-ink-700">Coordinator: {request.coordinatorName}</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-2">
          <h2 className="text-[14px] font-medium tracking-tight">Facility</h2>
          <p className="font-medium tracking-tight">{request.facility.name}</p>
          <p className="text-[13px] text-ink-600">{facilityTypeLabel(request.facility.type)}</p>
          <p className="text-[13px] text-ink-600">
            {[request.facility.city, request.facility.state].filter(Boolean).join(", ")}
          </p>
          {request.facility.contactName ? (
            <p className="text-[13px] text-ink-700">Contact: {request.facility.contactName}</p>
          ) : null}
        </section>
      </div>

      <section className="rounded-xl border border-ink-200 bg-white p-5">
        <h2 className="text-[14px] font-medium tracking-tight">Shifts</h2>
        {request.shifts.length === 0 ? (
          <p className="mt-2 text-[13px] text-ink-500">No shifts yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {request.shifts.map((shift) => (
              <li key={shift.id} className="flex items-center justify-between text-[13px]">
                <span>
                  {formatShiftWindow(new Date(shift.startAt), new Date(shift.endAt))}
                  {shift.shiftType ? ` · ${shift.shiftType}` : ""}
                </span>
                <Link href={`/shifts/${shift.id}`} className="text-teal-700 hover:underline">
                  View shift
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(request.notes || request.facilityInstructions) && (
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Notes</h2>
          {request.notes ? (
            <p className="text-[13px] text-ink-700 whitespace-pre-wrap">{request.notes}</p>
          ) : null}
          {request.facilityInstructions ? (
            <div>
              <h3 className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
                Facility instructions
              </h3>
              <p className="mt-1 text-[13px] text-ink-700 whitespace-pre-wrap">
                {request.facilityInstructions}
              </p>
            </div>
          ) : null}
        </section>
      )}

      {request.requiredCredentials?.length ? (
        <section className="rounded-xl border border-ink-200 bg-white p-5">
          <h2 className="text-[14px] font-medium tracking-tight">Required credentials</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {request.requiredCredentials.map((c) => (
              <Badge key={c} tone="neutral">
                {c}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {cancelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div
            role="dialog"
            aria-labelledby="cancel-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 id="cancel-title" className="text-[16px] font-medium tracking-tight">
              Cancel this request?
            </h2>
            <p className="mt-2 text-[13px] text-ink-600">
              Linked shifts will be cancelled. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Keep request
              </button>
              <button
                type="button"
                onClick={async () => {
                  setCancelOpen(false);
                  await handleTransition("cancelled");
                }}
                className="h-10 px-4 rounded-md bg-rose-700 text-white text-[13px] font-medium"
              >
                Cancel request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AgencyShell>
  );
}
