"use client";

import { useCallback, useEffect, useState } from "react";
import { createAvailabilityBlockAction } from "@/actions/provider/create-availability-block";
import { deleteAvailabilityBlockAction } from "@/actions/provider/delete-availability-block";
import { updateAvailabilityBlockAction } from "@/actions/provider/update-availability-block";
import type { AvailabilityBlockRecord } from "@/lib/provider/availability-blocks";

type BlockForm = {
  startAt: string;
  endAt: string;
  status: "available" | "unavailable";
  notes: string;
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultForm(): BlockForm {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(8, 0, 0, 0);
  const end = new Date(start);
  end.setHours(16, 0, 0, 0);
  return {
    startAt: toLocalInputValue(start.toISOString()),
    endAt: toLocalInputValue(end.toISOString()),
    status: "available",
    notes: "",
  };
}

function formatBlockWindow(startAt: string, endAt: string) {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const s = new Date(startAt).toLocaleString(undefined, opts);
  const e = new Date(endAt).toLocaleString(undefined, { ...opts, month: undefined, day: undefined });
  return `${s} – ${e}`;
}

function weekKey(iso: string) {
  const d = new Date(iso);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AvailabilityClient() {
  const [items, setItems] = useState<AvailabilityBlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlockForm>(defaultForm);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/provider/availability");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { items: AvailabilityBlockRecord[] };
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm());
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(block: AvailabilityBlockRecord) {
    setEditingId(block.id);
    setForm({
      startAt: toLocalInputValue(block.startAt),
      endAt: toLocalInputValue(block.endAt),
      status: block.status as "available" | "unavailable",
      notes: block.notes ?? "",
    });
    setError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    const payload = {
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      status: form.status,
      notes: form.notes || undefined,
    };
    const result = editingId
      ? await updateAvailabilityBlockAction(editingId, payload)
      : await createAvailabilityBlockAction(payload);
    setBusy(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    showToast(editingId ? "Availability updated" : "Availability added");
    setDialogOpen(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this availability block?")) return;
    setBusy(true);
    const result = await deleteAvailabilityBlockAction(id);
    setBusy(false);
    if (result.status === "error") {
      showToast(result.message);
      return;
    }
    showToast("Block deleted");
    await load();
  }

  const grouped = items.reduce<Record<string, AvailabilityBlockRecord[]>>((acc, block) => {
    const key = weekKey(block.startAt);
    acc[key] = acc[key] ?? [];
    acc[key].push(block);
    return acc;
  }, {});

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

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-teal-700 text-white text-sm font-medium"
        >
          Add availability
        </button>
      </div>

      {loading ? (
        <div className="h-24 rounded-2xl bg-ink-100 animate-pulse" />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-500 text-center py-12">No availability blocks yet.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([week, blocks]) => (
            <section key={week}>
              <h2 className="text-xs font-mono uppercase tracking-wide text-ink-500 mb-2">
                Week of {week}
              </h2>
              <ul className="space-y-2">
                {blocks.map((block) => (
                  <li
                    key={block.id}
                    className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-mono uppercase ${
                            block.status === "available" ? "text-teal-700" : "text-ink-600"
                          }`}
                        >
                          {block.status === "available" ? "Available" : "Unavailable"}
                        </span>
                        <p className="text-sm font-mono text-ink-800 mt-1">
                          {formatBlockWindow(block.startAt, block.endAt)}
                        </p>
                        {block.notes ? (
                          <p className="text-xs text-ink-500 mt-1">{block.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(block)}
                          className="text-xs text-teal-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(block.id)}
                          className="text-xs text-rose-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {dialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink-900/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium">
              {editingId ? "Edit availability" : "Add availability"}
            </h2>
            {error ? <p className="text-sm text-rose-600 mt-2">{error}</p> : null}
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-ink-600">Start</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border border-ink-200 rounded-xl px-3 py-2"
                  value={form.startAt}
                  onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="text-ink-600">End</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border border-ink-200 rounded-xl px-3 py-2"
                  value={form.endAt}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="text-ink-600">Status</span>
                <select
                  className="mt-1 w-full border border-ink-200 rounded-xl px-3 py-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as BlockForm["status"],
                    }))
                  }
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-ink-600">Notes (optional)</span>
                <textarea
                  className="mt-1 w-full border border-ink-200 rounded-xl px-3 py-2"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSave()}
                className="flex-1 h-11 rounded-xl bg-teal-700 text-white font-medium disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="flex-1 h-11 rounded-xl border border-ink-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
