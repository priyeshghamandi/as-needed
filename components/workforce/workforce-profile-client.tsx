"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon, Badge } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { updateHealthcareProfessionalAction } from "@/actions/workforce/update-professional";
import { deactivateProfessionalAction } from "@/actions/workforce/deactivate-professional";
import { getProfessionalInviteLinkAction } from "@/actions/workforce/get-professional-invite-link";
import { sendProfessionalInviteAction } from "@/actions/workforce/send-professional-invite";
import { InviteLinkCopy } from "@/components/invite-link-copy";
import {
  updateProfessionalSchema,
  WORKFORCE_PROFESSIONAL_ROLES,
  WORKFORCE_ROLE_LABELS,
  type UpdateProfessionalInput,
} from "@/lib/validations/workforce-professional";
import { canManageWorkforce } from "@/lib/auth/workforce-access-rules";
import {
  AvailabilityBadge,
  ComplianceBadge,
  formatRelativeTime,
  roleLabel,
  ShiftReadinessBadge,
} from "@/lib/workforce/workforce-ui";
import type { ComplianceStatus, ShiftReadiness } from "@/lib/workforce/shift-readiness";

export type SerializedProfile = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  yearsExperience: number | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  availabilityStatus: string;
  reliabilityScore: number | null;
  isActive: boolean;
  userId: string | null;
  complianceStatus: ComplianceStatus;
  shiftReadiness: ShiftReadiness;
  pendingInviteEmail: string | null;
  pendingInviteUrl: string | null;
  credentials: { id: string; name: string; status: string; expiresAt: string | null }[];
  recentShifts: {
    id: string;
    facilityName: string;
    startAt: string;
    endAt: string;
    status: string;
  }[];
  currentAssignments: {
    id: string;
    facilityName: string;
    startAt: string;
    endAt: string;
    status: string;
  }[];
};

export function WorkforceProfileClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  profile,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  profile: SerializedProfile;
}) {
  const router = useRouter();
  const canWrite = canManageWorkforce(primaryRole);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(Boolean(profile.pendingInviteEmail));
  const [inviteUrl, setInviteUrl] = useState<string | null>(profile.pendingInviteUrl);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);

  const form = useForm<UpdateProfessionalInput>({
    resolver: zodResolver(updateProfessionalSchema) as never,
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role as UpdateProfessionalInput["role"],
      specialty: profile.specialty ?? "",
      yearsExperience: profile.yearsExperience ?? undefined,
      phone: profile.phone ?? "",
    },
  });

  async function handleSave(values: UpdateProfessionalInput) {
    const result = await updateHealthcareProfessionalAction(profile.id, values);
    if (result.status === "success") {
      setToast("Profile updated");
      setEditOpen(false);
      router.refresh();
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  async function handleDeactivate() {
    const result = await deactivateProfessionalAction(profile.id);
    if (result.status === "success") {
      await router.push("/workforce");
      router.refresh();
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  async function handleInvite() {
    const result = await sendProfessionalInviteAction(profile.id);
    if (result.status === "success") {
      setInvitePending(true);
      setInviteUrl(result.inviteUrl);
      setToast("Invite created — copy the link below to share");
      router.refresh();
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  async function handleGetInviteLink() {
    setInviteLinkLoading(true);
    const result = await getProfessionalInviteLinkAction(profile.id);
    setInviteLinkLoading(false);
    if (result.status === "success") {
      setInvitePending(true);
      setInviteUrl(result.inviteUrl);
      setToast(result.created ? "New invite link created" : "Invite link ready to copy");
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  const inviteBadge = profile.userId ? (
    <Badge tone="green">Account linked</Badge>
  ) : invitePending ? (
    <Badge tone="amber">Invite pending</Badge>
  ) : (
    <Badge tone="ink">Not invited</Badge>
  );

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title={`${profile.firstName} ${profile.lastName}`}
      subtitle={roleLabel(profile.role)}
      headerAction={
        <Link
          href="/workforce"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to workforce
        </Link>
      }
    >
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-[13px] text-ink-800"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <AvailabilityBadge status={profile.availabilityStatus} />
        <ComplianceBadge status={profile.complianceStatus} />
        <ShiftReadinessBadge readiness={profile.shiftReadiness} />
        {inviteBadge}
        {!profile.isActive ? <Badge tone="rose">Inactive</Badge> : null}
      </div>

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50"
          >
            Edit
          </button>
          {!profile.userId && profile.email ? (
            <>
              <button
                type="button"
                onClick={handleInvite}
                className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50"
              >
                {invitePending ? "Resend invite" : "Send invite"}
              </button>
              <button
                type="button"
                onClick={() => void handleGetInviteLink()}
                disabled={inviteLinkLoading}
                className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50 disabled:opacity-50"
              >
                {inviteLinkLoading ? "Loading…" : "Get invite link"}
              </button>
            </>
          ) : null}
          {profile.isActive ? (
            <button
              type="button"
              onClick={() => setDeactivateOpen(true)}
              className="h-9 px-3 rounded-md border border-rose-200 text-rose-700 text-[13px] hover:bg-rose-50"
            >
              Deactivate
            </button>
          ) : null}
        </div>
      ) : null}

      {!profile.userId && inviteUrl ? (
        <InviteLinkCopy url={inviteUrl} label="Provider account invite" />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Contact</h2>
          <dl className="text-[13px] space-y-2">
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Email</dt>
              <dd>{profile.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Phone</dt>
              <dd>{profile.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Location</dt>
              <dd>
                {profile.city && profile.state ? `${profile.city}, ${profile.state}` : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Metrics</h2>
          <dl className="text-[13px] space-y-2">
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Reliability</dt>
              <dd>{profile.reliabilityScore ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Specialty</dt>
              <dd>{profile.specialty ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Experience</dt>
              <dd>
                {profile.yearsExperience != null ? `${profile.yearsExperience} years` : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3 lg:col-span-2">
          <h2 className="text-[14px] font-medium tracking-tight">Credentials</h2>
          {profile.credentials.length === 0 ? (
            <p className="text-[13px] text-ink-500">No credentials on file</p>
          ) : (
            <ul className="divide-y divide-ink-100 text-[13px]">
              {profile.credentials.map((c) => (
                <li key={c.id} className="py-2 flex justify-between gap-4">
                  <span>{c.name}</span>
                  <span className="font-mono text-[11px] text-ink-500">{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Current assignments</h2>
          {profile.currentAssignments.length === 0 ? (
            <p className="text-[13px] text-ink-500">Unassigned</p>
          ) : (
            <ul className="text-[13px] space-y-2">
              {profile.currentAssignments.map((a) => (
                <li key={a.id}>
                  {a.facilityName} · {new Date(a.startAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Recent shifts</h2>
          {profile.recentShifts.length === 0 ? (
            <p className="text-[13px] text-ink-500">{formatRelativeTime(null)}</p>
          ) : (
            <ul className="text-[13px] space-y-2">
              {profile.recentShifts.map((s) => (
                <li key={s.id}>
                  {s.facilityName} · {formatRelativeTime(s.startAt)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-professional-title"
        >
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="w-full max-w-md rounded-xl bg-white p-6 space-y-4 shadow-xl"
          >
            <h2 id="edit-professional-title" className="text-[16px] font-medium">
              Edit professional
            </h2>
            <label className="block text-[13px]">
              First name
              <input {...form.register("firstName")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Last name
              <input {...form.register("lastName")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Role
              <select {...form.register("role")} className="mt-1 w-full h-10 px-3 border rounded-lg bg-white">
                {WORKFORCE_PROFESSIONAL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {WORKFORCE_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px]">
              Phone
              <input {...form.register("phone")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="h-9 px-3 text-[13px]">
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deactivateOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Deactivate professional?"
          aria-labelledby="deactivate-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-4 shadow-xl">
            <h2 id="deactivate-title" className="text-[16px] font-medium">
              Deactivate professional?
            </h2>
            <p className="text-[13px] text-ink-600">
              They will be hidden from the default list and marked unavailable.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeactivateOpen(false)} className="h-9 px-3 text-[13px]">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                className="h-9 px-4 rounded-md bg-rose-700 text-white text-[13px]"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AgencyShell>
  );
}
