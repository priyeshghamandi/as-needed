"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon, Badge } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { updateFacilityAction } from "@/actions/facilities/update-facility";
import { getFacilityInviteLinkAction } from "@/actions/facilities/get-facility-invite-link";
import { sendFacilityInviteAction } from "@/actions/facilities/send-facility-invite";
import { InviteLinkCopy } from "@/components/invite-link-copy";
import {
  updateFacilitySchema,
  FACILITY_TYPES,
  type UpdateFacilityInput,
} from "@/lib/validations/facility";
import { canManageFacilities } from "@/lib/auth/facilities-access-rules";
import {
  facilityTypeLabel,
  formatRelativeTime,
  PortalAccessBadge,
} from "@/lib/facilities/facilities-ui";
import type { PortalAccessStatus } from "@/lib/facilities/queries";

export type SerializedFacilityDetail = {
  id: string;
  name: string;
  type: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  openRequestsCount: number;
  confirmedShiftsCount: number;
  portalAccess: PortalAccessStatus;
  pendingInviteEmail: string | null;
  pendingInviteUrl: string | null;
  recentRequests: { id: string; title: string; status: string; updatedAt: string }[];
  activityFeed: { id: string; action: string; createdAt: string; actorName: string | null }[];
};

export function FacilityDetailClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  facility,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  facility: SerializedFacilityDetail;
}) {
  const router = useRouter();
  const canWrite = canManageFacilities(primaryRole);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(
    facility.portalAccess === "invited" || Boolean(facility.pendingInviteEmail),
  );
  const [inviteUrl, setInviteUrl] = useState<string | null>(facility.pendingInviteUrl);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);

  const form = useForm<UpdateFacilityInput>({
    resolver: zodResolver(updateFacilitySchema) as never,
    defaultValues: {
      name: facility.name,
      type: facility.type as UpdateFacilityInput["type"],
      contactName: facility.contactName ?? "",
      contactEmail: facility.contactEmail ?? "",
      contactPhone: facility.contactPhone ?? "",
      notes: facility.notes ?? "",
    },
  });

  async function handleSave(values: UpdateFacilityInput) {
    const result = await updateFacilityAction(facility.id, values);
    if (result.status === "success") {
      setToast("Facility updated");
      setEditOpen(false);
      router.refresh();
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  async function handleInvite() {
    const result = await sendFacilityInviteAction(facility.id);
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
    const result = await getFacilityInviteLinkAction(facility.id);
    setInviteLinkLoading(false);
    if (result.status === "success") {
      setInvitePending(true);
      setInviteUrl(result.inviteUrl);
      setToast(result.created ? "New invite link created" : "Invite link ready to copy");
      return;
    }
    if (result.status === "error") setToast(result.message);
  }

  const locationLine = [facility.city, facility.state].filter(Boolean).join(", ");

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title={facility.name}
      subtitle={[facilityTypeLabel(facility.type), locationLine].filter(Boolean).join(" · ")}
      headerAction={
        <Link
          href="/facilities"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-600 hover:text-ink-900"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Back to facilities
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
        <Badge tone="teal">{facilityTypeLabel(facility.type)}</Badge>
        <PortalAccessBadge
          status={
            facility.portalAccess === "active"
              ? "active"
              : invitePending
                ? "invited"
                : facility.portalAccess
          }
        />
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
          {facility.portalAccess !== "active" && facility.contactEmail ? (
            <>
              <button
                type="button"
                onClick={handleInvite}
                className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50"
              >
                {invitePending ? "Resend invite" : "Invite contact"}
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
        </div>
      ) : null}

      {facility.portalAccess !== "active" && inviteUrl ? (
        <InviteLinkCopy url={inviteUrl} label="Facility portal invite" />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Contact</h2>
          <dl className="text-[13px] space-y-2">
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Name</dt>
              <dd>{facility.contactName ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Email</dt>
              <dd>
                {facility.contactEmail ? (
                  <a href={`mailto:${facility.contactEmail}`} className="text-teal-700 hover:underline">
                    {facility.contactEmail}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Phone</dt>
              <dd>{facility.contactPhone ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Address</h2>
          <address className="text-[13px] not-italic text-ink-700 space-y-1">
            {facility.addressLine1 ? <div>{facility.addressLine1}</div> : null}
            {facility.addressLine2 ? <div>{facility.addressLine2}</div> : null}
            <div>
              {[facility.city, facility.state, facility.postalCode].filter(Boolean).join(", ")}
            </div>
            {facility.country ? <div>{facility.country}</div> : null}
          </address>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Operational summary</h2>
          <dl className="text-[13px] grid grid-cols-2 gap-3">
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Open requests</dt>
              <dd className="text-[20px] font-medium">{facility.openRequestsCount}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-500">Confirmed shifts</dt>
              <dd className="text-[20px] font-medium">{facility.confirmedShiftsCount}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-medium tracking-tight">Notes</h2>
          <p className="text-[13px] text-ink-700 whitespace-pre-wrap">
            {facility.notes || "No notes"}
          </p>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3 lg:col-span-2">
          <h2 className="text-[14px] font-medium tracking-tight">Recent requests</h2>
          {facility.recentRequests.length === 0 ? (
            <p className="text-[13px] text-ink-500">No staffing requests yet</p>
          ) : (
            <ul className="divide-y divide-ink-100 text-[13px]">
              {facility.recentRequests.map((r) => (
                <li key={r.id} className="py-2 flex justify-between gap-4">
                  <span>{r.title}</span>
                  <span className="font-mono text-[11px] text-ink-500">
                    {r.status} · {formatRelativeTime(r.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3 lg:col-span-2">
          <h2 className="text-[14px] font-medium tracking-tight">Activity</h2>
          {facility.activityFeed.length === 0 ? (
            <p className="text-[13px] text-ink-500">No recent activity</p>
          ) : (
            <ul className="text-[13px] space-y-2">
              {facility.activityFeed.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="font-mono text-[11px] text-ink-500 shrink-0">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                  <span>
                    {a.actorName ?? "System"} — {a.action.replace(/_/g, " ")}
                  </span>
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
          aria-label="Edit facility"
        >
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="w-full max-w-md rounded-xl bg-white p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-[16px] font-medium">Edit facility</h2>
            <label className="block text-[13px]">
              Name
              <input {...form.register("name")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Type
              <select {...form.register("type")} className="mt-1 w-full h-10 px-3 border rounded-lg bg-white">
                {FACILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {facilityTypeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px]">
              Contact name
              <input {...form.register("contactName")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Contact email
              <input {...form.register("contactEmail")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Contact phone
              <input {...form.register("contactPhone")} className="mt-1 w-full h-10 px-3 border rounded-lg" />
            </label>
            <label className="block text-[13px]">
              Notes
              <textarea {...form.register("notes")} rows={3} className="mt-1 w-full px-3 py-2 border rounded-lg" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="h-9 px-3 text-[13px]">
                Cancel
              </button>
              <button type="submit" className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px]">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AgencyShell>
  );
}
