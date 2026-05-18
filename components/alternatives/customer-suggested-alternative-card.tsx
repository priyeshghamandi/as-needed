"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";
import type { PendingAlternativeForCustomer } from "@/lib/alternatives/queries";

type SerializedAlternative = Omit<PendingAlternativeForCustomer, "proposedAt"> & {
  proposedAt: string;
};

function CompareColumn({
  label,
  professional,
}: {
  label: string;
  professional: SerializedAlternative["original"];
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-4 space-y-1 flex-1 min-w-[200px]">
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{label}</p>
      <p className="text-[15px] font-medium text-ink-900">{professional.displayName}</p>
      <p className="text-[13px] text-ink-600">{roleNeededLabel(professional.role)}</p>
      {professional.approximateAvailabilityLabel ? (
        <p className="text-[12px] text-ink-500">
          {professional.approximateAvailabilityLabel}
        </p>
      ) : null}
      {professional.headline ? (
        <p className="text-[13px] text-ink-700 mt-1">{professional.headline}</p>
      ) : null}
    </div>
  );
}

export function CustomerSuggestedAlternativeCard({
  requestId,
  alternative,
}: {
  requestId: string;
  alternative: SerializedAlternative;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/customer/requests/${requestId}/alternatives/${alternative.id}/approve`,
        { method: "POST" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not approve suggested alternative.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleReject() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/customer/requests/${requestId}/alternatives/${alternative.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason.trim() || null }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not reject suggested alternative.");
        return;
      }
      setRejectOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
      <div>
        <h2 className="text-[14px] font-medium tracking-tight text-ink-900">
          Suggested Alternative
        </h2>
        <p className="text-[13px] text-ink-700 mt-1">
          Your agency coordinator proposed a different professional because your preferred
          selection could not be fulfilled. Review and approve or reject — this is not a direct
          hire or shift booking.
        </p>
        {alternative.messageToCustomer ? (
          <p className="text-[13px] text-ink-800 mt-3 whitespace-pre-wrap border-t border-amber-200/60 pt-3">
            <span className="font-medium">Message from coordinator: </span>
            {alternative.messageToCustomer}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <CompareColumn label="Your selection" professional={alternative.original} />
        <CompareColumn label="Suggested alternative" professional={alternative.suggested} />
      </div>

      {error ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={handleApprove}
          className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
        >
          Approve suggested alternative
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejectOpen(true)}
          className="h-10 px-4 rounded-md border border-ink-200 bg-white text-[13px] disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {rejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div
            role="dialog"
            aria-labelledby="reject-alt-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4"
          >
            <h3 id="reject-alt-title" className="text-[16px] font-medium tracking-tight">
              Reject suggested alternative
            </h3>
            <label className="block">
              <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
                Reason (optional)
              </span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleReject}
                className="h-10 px-4 rounded-md bg-rose-700 text-white text-[13px] font-medium disabled:opacity-50"
              >
                Reject suggested alternative
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
