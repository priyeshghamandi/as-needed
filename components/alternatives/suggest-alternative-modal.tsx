"use client";

import { useCallback, useEffect, useState } from "react";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";

type PickerCandidate = {
  id: string;
  displayName: string;
  role: string;
  approximateAvailabilityLabel: string | null;
  geoEligible: boolean;
};

export function SuggestAlternativeModal({
  requestId,
  originalProfessionalId,
  originalDisplayName,
  onClose,
  onSuccess,
}: {
  requestId: string;
  originalProfessionalId: string;
  originalDisplayName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<PickerCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        originalProfessionalId,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      const res = await fetch(
        `/api/staffing-requests/${requestId}/alternatives/candidates?${params}`,
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not load professionals.");
        setCandidates([]);
        return;
      }
      setCandidates(json.candidates ?? []);
    } finally {
      setLoading(false);
    }
  }, [requestId, originalProfessionalId, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCandidates();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  async function handleSubmit() {
    if (!selectedId) {
      setError("Select a professional to suggest.");
      return;
    }
    const selected = candidates.find((c) => c.id === selectedId);
    if (selected && !selected.geoEligible) {
      setError("Selected professional is not eligible for this facility location.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/staffing-requests/${requestId}/alternatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalProfessionalId,
          suggestedProfessionalId: selectedId,
          messageToCustomer: message.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not propose suggested alternative.");
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div
        role="dialog"
        aria-labelledby="suggest-alt-title"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 id="suggest-alt-title" className="text-[16px] font-medium tracking-tight">
          Suggest alternative
        </h2>
        <p className="text-[13px] text-ink-600">
          Propose a suggested alternative for <strong>{originalDisplayName}</strong>. The
          customer must approve before coordination continues.
        </p>

        <label className="block">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Search professionals
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[14px]"
          />
        </label>

        <div className="border border-ink-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-ink-100">
          {loading ? (
            <p className="px-3 py-4 text-[13px] text-ink-500">Loading…</p>
          ) : candidates.length === 0 ? (
            <p className="px-3 py-4 text-[13px] text-ink-500">No eligible professionals found.</p>
          ) : (
            candidates.map((candidate) => (
              <label
                key={candidate.id}
                className={`flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-ink-50 ${
                  !candidate.geoEligible ? "opacity-60" : ""
                }`}
              >
                <input
                  type="radio"
                  name="suggestedProfessional"
                  checked={selectedId === candidate.id}
                  disabled={!candidate.geoEligible}
                  onChange={() => setSelectedId(candidate.id)}
                  className="mt-1"
                />
                <span className="text-[13px]">
                  <span className="font-medium text-ink-900">{candidate.displayName}</span>
                  <span className="block text-ink-500">
                    {roleNeededLabel(candidate.role)}
                    {candidate.approximateAvailabilityLabel
                      ? ` · ${candidate.approximateAvailabilityLabel}`
                      : ""}
                  </span>
                  {!candidate.geoEligible ? (
                    <span className="text-[11px] text-rose-700">Not eligible for facility area</span>
                  ) : null}
                </span>
              </label>
            ))
          )}
        </div>

        <label className="block">
          <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Message to customer (optional)
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-ink-200 text-[14px]"
          />
        </label>

        {error ? (
          <p className="text-[13px] text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-ink-200 text-[13px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || !selectedId}
            onClick={handleSubmit}
            className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
          >
            Propose suggested alternative
          </button>
        </div>
      </div>
    </div>
  );
}
