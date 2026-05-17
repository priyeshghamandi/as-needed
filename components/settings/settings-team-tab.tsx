"use client";

import { useState } from "react";
import { sendTeamInvitesAction } from "@/actions/invites/send-team-invites";
import { revokeTeamInviteAction } from "@/actions/invites/revoke-team-invite";
import { SettingsReadOnlyBanner } from "@/components/settings/settings-read-only-banner";
import {
  TEAM_INVITE_DISPLAY_ROLES,
  teamMemberRoleLabel,
} from "@/lib/settings/team-labels";
import type { AgencyMemberRow, PendingInviteRow } from "@/lib/settings/queries";

type InviteRow = { id: number; email: string; role: string };

export function SettingsTeamTab({
  members,
  pendingInvites: initialPending,
  canManage,
  onSaved,
}: {
  members: AgencyMemberRow[];
  pendingInvites: PendingInviteRow[];
  canManage: boolean;
  onSaved: (message: string) => void;
}) {
  const [pendingInvites, setPendingInvites] = useState(initialPending);
  const [rows, setRows] = useState<InviteRow[]>([
    { id: 1, email: "", role: TEAM_INVITE_DISPLAY_ROLES[0] },
  ]);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateRow(i: number, patch: Partial<InviteRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    if (rows.length >= 5) return;
    setRows((rs) => [...rs, { id: Date.now(), email: "", role: TEAM_INVITE_DISPLAY_ROLES[0] }]);
  }

  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  async function handleSendInvites() {
    setError(null);
    setBanner(null);
    const filled = rows.filter((r) => r.email.trim());
    if (filled.length === 0) return;

    setSending(true);
    const result = await sendTeamInvitesAction({
      invites: filled.map((r) => ({ email: r.email.trim(), role: r.role })),
    });
    setSending(false);

    if (result.status === "success") {
      const sent = result.results.filter((r) => r.status === "sent").length;
      setBanner(`${sent} invitation${sent === 1 ? "" : "s"} sent.`);
      onSaved("Invitations sent");
      setRows([{ id: Date.now(), email: "", role: TEAM_INVITE_DISPLAY_ROLES[0] }]);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = (await res.json()) as { pendingInvites: PendingInviteRow[] };
        setPendingInvites(data.pendingInvites);
      }
      return;
    }

    if (result.status === "error") {
      setError(result.message);
    }
  }

  async function handleRevoke(inviteId: string) {
    setError(null);
    const result = await revokeTeamInviteAction(inviteId);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setPendingInvites((list) => list.filter((i) => i.id !== inviteId));
    onSaved("Invite revoked");
  }

  return (
    <div className="space-y-8">
      {!canManage ? <SettingsReadOnlyBanner /> : null}
      {banner ? (
        <p className="text-[13px] text-teal-800" role="status">
          {banner}
        </p>
      ) : null}
      {error ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="text-[14px] font-medium tracking-tight mb-3">Active members</h2>
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-100 text-[10px] font-mono uppercase tracking-wider text-ink-500">
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{m.name}</td>
                  <td className="px-4 py-2.5 text-ink-600">{m.email}</td>
                  <td className="px-4 py-2.5">{teamMemberRoleLabel(m.role)}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-ink-500">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[14px] font-medium tracking-tight mb-3">Pending invites</h2>
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          {pendingInvites.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-500">No pending invites</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 text-[10px] font-mono uppercase tracking-wider text-ink-500">
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Role</th>
                  <th className="text-left px-4 py-2">Sent</th>
                  <th className="text-left px-4 py-2">Expires</th>
                  {canManage ? <th className="text-right px-4 py-2" /> : null}
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((inv) => (
                  <tr key={inv.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-4 py-2.5">{inv.email}</td>
                    <td className="px-4 py-2.5">{teamMemberRoleLabel(inv.role)}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-ink-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-ink-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-2.5 text-right">
                        {inv.role !== "agency_owner" ? (
                          <button
                            type="button"
                            onClick={() => void handleRevoke(inv.id)}
                            className="min-h-11 px-3 text-[12px] font-medium text-rose-700 hover:bg-rose-50 rounded-md"
                          >
                            Revoke
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {canManage ? (
        <section>
          <h2 className="text-[14px] font-medium tracking-tight mb-3">Invite team members</h2>
          <div className="rounded-xl border border-ink-200 bg-white divide-y divide-ink-100">
            {rows.map((row, i) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                <div className="col-span-12 sm:col-span-6">
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(i, { email: e.target.value })}
                    placeholder="colleague@agency.com"
                    className="w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
                  />
                </div>
                <div className="col-span-10 sm:col-span-5">
                  <select
                    value={row.role}
                    onChange={(e) => updateRow(i, { role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
                  >
                    {TEAM_INVITE_DISPLAY_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="min-h-11 min-w-11 text-ink-400 hover:text-ink-700"
                    aria-label="Remove row"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= 5}
              className="min-h-11 h-11 px-4 rounded-lg border border-ink-200 text-[13px] font-medium hover:bg-ink-50 disabled:opacity-50"
            >
              Add row
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => void handleSendInvites()}
              className="min-h-11 h-11 px-5 rounded-lg bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send invitations"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
