"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkforceBulkMarketplaceModal({
  professionalIds,
  isMarketplaceVisible,
  onClose,
}: {
  professionalIds: string[];
  isMarketplaceVisible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    succeeded: string[];
    failed: { id: string; errors: Record<string, string> }[];
  } | null>(null);

  async function apply() {
    setPending(true);
    try {
      const res = await fetch("/api/workforce/marketplace-visibility/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalIds, isMarketplaceVisible }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          succeeded: [],
          failed: [{ id: "bulk", errors: { request: data.error ?? "Request failed" } }],
        });
        return;
      }
      setResult(data);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const label = isMarketplaceVisible ? "Show on marketplace" : "Hide from marketplace";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-marketplace-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 id="bulk-marketplace-title" className="text-[16px] font-medium">
          {label}
        </h2>
        <p className="text-[13px] text-ink-600">
          Apply to {professionalIds.length} selected professional
          {professionalIds.length === 1 ? "" : "s"}. Each must pass the marketplace checklist to
          enable visibility.
        </p>

        {result ? (
          <div className="text-[13px] space-y-2">
            <p className="text-teal-700">{result.succeeded.length} updated successfully.</p>
            {result.failed.length > 0 ? (
              <p className="text-rose-700">{result.failed.length} could not be updated.</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 px-3 text-[13px]">
            {result ? "Close" : "Cancel"}
          </button>
          {!result ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void apply()}
              className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] disabled:opacity-50"
            >
              {pending ? "Applying…" : "Apply"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
