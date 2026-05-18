"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SuggestAlternativeModal } from "@/components/alternatives/suggest-alternative-modal";
import { AgencyShell } from "@/components/agency-shell";
import { canProposeAlternative } from "@/lib/fulfillment/alternative-status";
import { Badge, Icon } from "@/components/primitives";
import {
  canManageStaffingRequests,
  canViewStaffingRequests,
} from "@/lib/auth/staffing-requests-access-rules";
import type { AgencyFulfillmentPageData } from "@/lib/fulfillment/queries";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";
import { DECLINE_REASON_LABELS } from "@/lib/ui/decline-reason";
import {
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_TONES,
  type StaffingRequestFulfillmentStatus,
} from "@/lib/ui/fulfillment-status";

type SerializedData = Omit<
  AgencyFulfillmentPageData,
  "shiftStartAt" | "shiftEndAt" | "reviewHistory" | "alternatives"
> & {
  shiftStartAt: string | null;
  shiftEndAt: string | null;
  reviewHistory: {
    id: string;
    professionalName: string | null;
    decision: "confirmed" | "declined";
    declineReason: string | null;
    declineNotes: string | null;
    reviewerName: string;
    reviewedAt: string;
  }[];
  alternatives: {
    id: string;
    originalProfessionalId: string;
    originalDisplayName: string;
    suggestedProfessionalId: string;
    suggestedDisplayName: string;
    status: "pending_customer" | "approved" | "rejected" | "withdrawn";
    messageToCustomer: string | null;
    proposedAt: string;
  }[];
};

const DECLINE_REASONS = [
  "unavailable",
  "credentials",
  "scheduling_conflict",
  "other",
] as const;

export function AgencyFulfillmentReviewClient({
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
  data: SerializedData;
}) {
  const router = useRouter();
  const canWrite = canManageStaffingRequests(primaryRole);
  const canView = canViewStaffingRequests(primaryRole);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<{
    professionalId: string;
    displayName: string;
  } | null>(null);
  const [declineReason, setDeclineReason] =
    useState<(typeof DECLINE_REASONS)[number]>("unavailable");
  const [declineNotes, setDeclineNotes] = useState("");
  const [suggestTarget, setSuggestTarget] = useState<{
    professionalId: string;
    displayName: string;
  } | null>(null);

  const status = data.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  const statusLabel = status ? FULFILLMENT_STATUS_LABELS[status] : "Pending";
  const statusTone = status ? FULFILLMENT_STATUS_TONES[status] : "neutral";
  const canReview = canWrite && (status === "pending_agency_review" || !status);
  const canSuggest = canWrite && canProposeAlternative(status);

  const pendingByOriginal = new Map(
    data.alternatives
      .filter((a) => a.status === "pending_customer")
      .map((a) => [a.originalProfessionalId, a]),
  );

  const window =
    data.shiftStartAt && data.shiftEndAt
      ? formatShiftWindow(new Date(data.shiftStartAt), new Date(data.shiftEndAt))
      : "—";

  async function confirmProfessional(professionalId: string) {
    setPending(true);
    setToast(null);
    try {
      const res = await fetch(
        `/api/staffing-requests/${data.requestId}/fulfillment/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ healthcareProfessionalId: professionalId }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(json.error ?? "Could not confirm fulfillment.");
        return;
      }
      setToast("Fulfillment confirmed for this professional.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function submitDecline() {
    if (!declineTarget) return;
    setPending(true);
    setToast(null);
    try {
      const res = await fetch(
        `/api/staffing-requests/${data.requestId}/fulfillment/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            healthcareProfessionalId: declineTarget.professionalId,
            declineReason,
            declineNotes: declineNotes.trim() || null,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(json.error ?? "Could not decline fulfillment.");
        return;
      }
      setDeclineTarget(null);
      setDeclineNotes("");
      setToast("Fulfillment declined for this professional.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function withdrawAlternative(alternativeId: string) {
    setPending(true);
    setToast(null);
    try {
      const res = await fetch(
        `/api/staffing-requests/${data.requestId}/alternatives/${alternativeId}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(json.error ?? "Could not withdraw suggested alternative.");
        return;
      }
      setToast("Suggested alternative withdrawn.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!canView) {
    return null;
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Review fulfillment"
      subtitle={data.title}
      headerAction={
        <Link
          href={`/staffing-requests/${data.requestId}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to request
        </Link>
      }
    >
      {toast ? (
        <FulfillmentToast message={toast} />
      ) : null}

      <FulfillmentDisclaimer />

      <Badge tone={statusTone}>{statusLabel}</Badge>

      <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
        <h2 className="text-[14px] font-medium tracking-tight">Request summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div>
            <dt className="text-ink-500">Facility</dt>
            <dd className="font-medium text-ink-900">{data.facilityName}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Availability window</dt>
            <dd className="font-medium text-ink-900">{window}</dd>
          </div>
          {data.shiftType ? (
            <ShiftTypeField shiftType={data.shiftType} />
          ) : null}
        </dl>
        {data.notes ? (
          <p className="text-[13px] text-ink-700 whitespace-pre-wrap border-t border-ink-100 pt-3">
            {data.notes}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-ink-200 bg-white overflow-x-auto">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-medium tracking-tight">
            Customer-selected professionals (your agency)
          </h2>
          {canSuggest ? (
            <span className="text-[12px] text-ink-500 shrink-0">
              Declined selections can receive a suggested alternative
            </span>
          ) : null}
        </div>
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/80">
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Professional
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Status
              </th>
              {canWrite ? (
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.selections.map((row) => {
              const pendingAlt = pendingByOriginal.get(row.professionalId);
              return (
              <tr key={row.professionalId} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium">{row.displayName}</span>
                  <span className="block font-mono text-[11px] text-ink-500 uppercase">
                    {roleNeededLabel(row.role)}
                  </span>
                  {row.complianceBlocked ? (
                    <span className="text-[11px] text-rose-700">Compliance block active</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {row.review ? (
                    <Badge tone={row.review.decision === "confirmed" ? "teal" : "rose"}>
                      {row.review.decision === "confirmed" ? "Confirmed" : "Declined"}
                    </Badge>
                  ) : (
                    <Badge tone="amber">Pending review</Badge>
                  )}
                </td>
                {canWrite ? (
                  <td className="px-4 py-3">
                    {row.review?.decision === "declined" && canSuggest && !pendingAlt ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          setSuggestTarget({
                            professionalId: row.professionalId,
                            displayName: row.displayName,
                          })
                        }
                        className="h-8 px-3 rounded-md border border-teal-700 text-teal-900 text-[12px] font-medium"
                      >
                        Suggest alternative
                      </button>
                    ) : pendingAlt ? (
                      <div className="space-y-1">
                        <span className="text-[12px] text-ink-700">
                          Pending: {pendingAlt.suggestedDisplayName}
                        </span>
                        {pendingAlt.status === "pending_customer" ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => withdrawAlternative(pendingAlt.id)}
                            className="block h-8 px-3 rounded-md border border-ink-200 text-[12px]"
                          >
                            Withdraw suggestion
                          </button>
                        ) : null}
                      </div>
                    ) : canReview && !row.review ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={pending || row.complianceBlocked}
                          onClick={() => confirmProfessional(row.professionalId)}
                          className="h-8 px-3 rounded-md bg-ink-900 text-paper text-[12px] font-medium disabled:opacity-50"
                        >
                          Confirm fulfillment
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setDeclineTarget({
                              professionalId: row.professionalId,
                              displayName: row.displayName,
                            })
                          }
                          className="h-8 px-3 rounded-md border border-ink-200 text-[12px]"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-ink-500">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {data.reviewHistory.length > 0 ? (
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Review history</h2>
          <ul className="space-y-2">
            {data.reviewHistory.map((item) => (
              <li
                key={item.id}
                className="text-[13px] border border-ink-100 rounded-lg px-3 py-2 flex flex-wrap justify-between gap-2"
              >
                <span>
                  {item.professionalName ?? "Professional"} —{" "}
                  {item.decision === "confirmed" ? "Confirmed" : "Declined"}
                  {item.declineReason
                    ? ` (${DECLINE_REASON_LABELS[item.declineReason] ?? item.declineReason})`
                    : ""}
                </span>
                <span className="font-mono text-[11px] text-ink-500">
                  {item.reviewerName} · {new Date(item.reviewedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestTarget ? (
        <SuggestAlternativeModal
          requestId={data.requestId}
          originalProfessionalId={suggestTarget.professionalId}
          originalDisplayName={suggestTarget.displayName}
          onClose={() => setSuggestTarget(null)}
          onSuccess={() => {
            setToast("Suggested alternative proposed. Customer will be notified.");
            router.refresh();
          }}
        />
      ) : null}

      {declineTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div
            role="dialog"
            aria-labelledby="decline-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4"
          >
            <h2 id="decline-title" className="text-[16px] font-medium tracking-tight">
              Decline fulfillment
            </h2>
            <p className="text-[13px] text-ink-600">
              Decline fulfillment for <strong>{declineTarget.displayName}</strong>. A reason is
              required.
            </p>
            <label className="block">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
                Reason
              </span>
              <select
                value={declineReason}
                onChange={(e) =>
                  setDeclineReason(e.target.value as (typeof DECLINE_REASONS)[number])
                }
                className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[14px]"
              >
                {DECLINE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {DECLINE_REASON_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
                Notes (optional)
              </span>
              <textarea
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
            <DeclineModalActions
              pending={pending}
              onCancel={() => setDeclineTarget(null)}
              onSubmit={submitDecline}
            />
          </div>
        </div>
      ) : null}
    </AgencyShell>
  );
}

function FulfillmentToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900"
    >
      {message}
    </div>
  );
}

function FulfillmentDisclaimer() {
  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-[13px] text-ink-800">
      <strong>Confirm fulfillment</strong> approves the customer&apos;s preferred professional for
      your agency. This is not shift confirmation — matching and shift invites happen after the
      customer approves.
    </div>
  );
}

function ShiftTypeField({ shiftType }: { shiftType: string }) {
  return (
    <div>
      <dt className="text-ink-500">Shift type</dt>
      <dd className="font-medium text-ink-900">{shiftType.replace("_", " ")}</dd>
    </div>
  );
}

function DeclineModalActions({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onSubmit}
        className="h-10 px-4 rounded-md bg-rose-700 text-white text-[13px] font-medium disabled:opacity-50"
      >
        Decline fulfillment
      </button>
    </div>
  );
}
