"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerApproveFulfillment({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/customer/requests/${requestId}/approve-fulfillment`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not approve fulfillment.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50 p-5 space-y-3">
      <h2 className="text-[14px] font-medium tracking-tight text-ink-900">
        Agency confirmed fulfillment
      </h2>
      <p className="text-[13px] text-ink-700">
        Your agency coordinator confirmed they can fulfill this request with your preferred
        professional(s). Approve to proceed — this is not a shift booking or direct hire.
      </p>
      {error ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={handleApprove}
        className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
      >
        Approve fulfillment
      </button>
    </section>
  );
}
