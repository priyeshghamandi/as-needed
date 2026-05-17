"use client";

import { useCallback, useEffect, useState } from "react";
import { acceptShiftAssignmentAction } from "@/actions/provider/accept-shift-assignment";
import { declineShiftAssignmentAction } from "@/actions/provider/decline-shift-assignment";
import type { ProviderShiftDetail, ProviderShiftListItem } from "@/lib/provider/provider-shifts";
import type { DeclineShiftAssignmentInput } from "@/lib/validations/provider-assignment";

type Tab = "invites" | "upcoming" | "past";

const TABS: { id: Tab; label: string }[] = [
  { id: "invites", label: "Invites" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const DECLINE_OPTIONS: {
  value: DeclineShiftAssignmentInput["declineReasonCode"];
  label: string;
}[] = [
  { value: "unavailable", label: "Unavailable" },
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "distance", label: "Too far" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

function statusLabel(status: string) {
  const map: Record<string, string> = {
    invited: "Invited",
    accepted: "Accepted",
    confirmed: "Confirmed",
    declined: "Declined",
    checked_in: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No show",
  };
  return map[status] ?? status;
}

export function MyShiftsClient() {
  const [tab, setTab] = useState<Tab>("invites");
  const [items, setItems] = useState<ProviderShiftListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProviderShiftDetail | null>(null);
  const [sheet, setSheet] = useState<"detail" | "accept" | "decline" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [declineCode, setDeclineCode] =
    useState<DeclineShiftAssignmentInput["declineReasonCode"]>("schedule_conflict");
  const [declineOther, setDeclineOther] = useState("");

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/shifts?tab=${t}`);
      if (!res.ok) throw new Error("Failed to load shifts");
      const data = (await res.json()) as { items: ProviderShiftListItem[] };
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  async function openDetail(id: string) {
    setSelectedId(id);
    setSheet("detail");
    setDetail(null);
    const res = await fetch(`/api/provider/shifts/${id}`);
    if (res.ok) {
      setDetail((await res.json()) as ProviderShiftDetail);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function closeSheet() {
    setSheet(null);
    setSelectedId(null);
    setDetail(null);
  }

  async function handleAccept() {
    if (!selectedId) return;
    setBusy(true);
    const result = await acceptShiftAssignmentAction(selectedId);
    setBusy(false);
    if (result.status === "error") {
      showToast(result.message);
      return;
    }
    showToast("Shift accepted");
    closeSheet();
    await load(tab);
    if (tab === "invites") await load("upcoming");
  }

  async function handleDecline() {
    if (!selectedId) return;
    setBusy(true);
    const result = await declineShiftAssignmentAction(selectedId, {
      declineReasonCode: declineCode,
      declineReasonOther: declineCode === "other" ? declineOther : undefined,
    });
    setBusy(false);
    if (result.status === "error") {
      showToast(result.message);
      return;
    }
    showToast("Invite declined");
    closeSheet();
    await load(tab);
  }

  const selected = items.find((i) => i.assignmentId === selectedId);

  return (
    <>
      {toast ? (
        <div
          role="status"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-ink-900 text-white text-sm shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-1 p-1 bg-ink-100 rounded-full mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`h-9 rounded-full text-xs font-medium ${
              tab === t.id ? "bg-white shadow-sm text-ink-900" : "text-ink-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-ink-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-500 text-center py-12">
          {tab === "invites"
            ? "No pending invites."
            : tab === "upcoming"
              ? "No upcoming shifts."
              : "No past shifts yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.assignmentId}>
              <button
                type="button"
                onClick={() => void openDetail(item.assignmentId)}
                className="w-full text-left rounded-2xl border border-ink-200 bg-white p-4 shadow-card hover:border-teal-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-teal-700">
                    {statusLabel(item.status)}
                  </span>
                  {item.isExpired ? (
                    <span className="text-[10px] text-rose-600 font-mono">Expired</span>
                  ) : null}
                </div>
                <div className="mt-1 font-medium text-ink-900">{item.facilityName}</div>
                <div className="text-sm text-ink-600">{item.requestTitle}</div>
                <div className="text-xs text-ink-500 mt-2 font-mono">{item.shiftWindow}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {sheet && selected ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-ink-900/40">
          <div className="bg-white rounded-t-3xl max-h-[90vh] flex flex-col max-w-lg mx-auto w-full">
            <div className="p-5 overflow-y-auto flex-1 pb-28">
              {sheet === "detail" && (
                <>
                  <h2 className="text-lg font-medium">{selected.facilityName}</h2>
                  <p className="text-sm text-ink-600 mt-1">{selected.requestTitle}</p>
                  <p className="text-xs font-mono text-ink-500 mt-2">{selected.shiftWindow}</p>
                  {detail?.coordinatorName ? (
                    <p className="text-sm mt-4">
                      Coordinator:{" "}
                      <span className="text-ink-700">{detail.coordinatorName}</span>
                    </p>
                  ) : null}
                  {detail?.facilityInstructions ? (
                    <p className="text-sm mt-3 text-ink-600">{detail.facilityInstructions}</p>
                  ) : null}
                </>
              )}
              {sheet === "accept" && detail ? (
                <>
                  <h2 className="text-lg font-medium">Confirm acceptance</h2>
                  <p className="text-sm text-ink-600 mt-2">
                    You have {detail.verifiedCredentialCount} verified credential
                    {detail.verifiedCredentialCount === 1 ? "" : "s"} on file. Ensure
                    credentials meet facility requirements before your shift.
                  </p>
                </>
              ) : null}
              {sheet === "decline" ? (
                <>
                  <h2 className="text-lg font-medium">Decline invite</h2>
                  <fieldset className="mt-4 space-y-2">
                    {DECLINE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="declineReason"
                          checked={declineCode === opt.value}
                          onChange={() => setDeclineCode(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </fieldset>
                  {declineCode === "other" ? (
                    <textarea
                      className="mt-3 w-full border border-ink-200 rounded-xl p-3 text-sm"
                      placeholder="Brief reason"
                      value={declineOther}
                      onChange={(e) => setDeclineOther(e.target.value)}
                      rows={3}
                    />
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="sticky bottom-0 p-4 border-t border-ink-200 bg-white space-y-2">
              {sheet === "detail" && tab === "invites" && selected.status === "invited" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={selected.isExpired || busy}
                    onClick={() => setSheet("accept")}
                    className="flex-1 h-11 rounded-xl bg-teal-700 text-white font-medium disabled:opacity-50"
                  >
                    Accept shift
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setSheet("decline")}
                    className="flex-1 h-11 rounded-xl border border-ink-200 font-medium"
                  >
                    Decline
                  </button>
                </div>
              ) : null}
              {sheet === "accept" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAccept()}
                  className="w-full h-11 rounded-xl bg-teal-700 text-white font-medium disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Confirm accept"}
                </button>
              ) : null}
              {sheet === "decline" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDecline()}
                  className="w-full h-11 rounded-xl bg-rose-600 text-white font-medium disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Confirm decline"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (sheet === "detail") closeSheet();
                  else setSheet("detail");
                }}
                className="w-full h-10 text-sm text-ink-600"
              >
                {sheet === "detail" ? "Close" : "Back"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
