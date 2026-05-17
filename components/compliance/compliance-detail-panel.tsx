"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/primitives";
import { verifyCredentialAction } from "@/actions/compliance/verify-credential";
import { rejectCredentialAction } from "@/actions/compliance/reject-credential";
import { updateCredentialAction } from "@/actions/compliance/update-credential";
import { updateCredentialStatusAction } from "@/actions/compliance/update-credential-status";
import { deleteCredentialAction } from "@/actions/compliance/delete-credential";
import {
  CredentialStatusBadge,
  CREDENTIAL_STATUS_LABELS,
  formatVerifiedAt,
} from "@/lib/compliance/compliance-ui";
import type { CredentialDetail } from "@/lib/compliance/queries";
import type { CredentialStatus } from "@/lib/compliance/credential-transitions";
import {
  canRejectCredential,
  canVerifyCredential,
} from "@/lib/compliance/credential-transitions";

export function ComplianceDetailPanel({
  detail,
  onClose,
  onChanged,
}: {
  detail: CredentialDetail;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [type, setType] = useState(detail.type);
  const [name, setName] = useState(detail.name);
  const [licenseNumber, setLicenseNumber] = useState(detail.licenseNumber ?? "");
  const [issuingAuthority, setIssuingAuthority] = useState(detail.issuingAuthority ?? "");
  const [issuedAt, setIssuedAt] = useState(detail.issuedAt ?? "");
  const [expiresAt, setExpiresAt] = useState(detail.expiresAt ?? "");
  const [documentUrl, setDocumentUrl] = useState(detail.documentUrl ?? "");

  async function runAction(fn: () => Promise<{ status: string; message?: string }>) {
    setError(null);
    setPending(true);
    const result = await fn();
    setPending(false);
    if (result.status === "error") {
      setError(result.message ?? "Action failed.");
      return;
    }
    onChanged();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-900/30" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-ink-200 shadow-xl flex flex-col"
        role="dialog"
        aria-label="Credential details"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-medium tracking-tight">{detail.name}</h2>
            <p className="text-[12px] text-ink-500 font-mono mt-0.5">{detail.type}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-ink-500 hover:bg-ink-100"
            aria-label="Close panel"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-800"
            >
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <CredentialStatusBadge status={detail.status} displayBadge={detail.displayBadge} />
            <Link
              href={`/workforce/${detail.professionalId}`}
              className="text-[12px] text-teal-700 hover:underline"
            >
              {detail.professionalName} · {detail.professionalRole.toUpperCase()}
            </Link>
          </div>

          {editing ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void runAction(() =>
                  updateCredentialAction(detail.id, {
                    type,
                    name,
                    licenseNumber,
                    issuingAuthority,
                    issuedAt,
                    expiresAt,
                    documentUrl,
                  }),
                ).then(() => setEditing(false));
              }}
            >
              <label className="block text-[12px]">
                Type
                <input
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                />
              </label>
              <label className="block text-[12px]">
                Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                />
              </label>
              <label className="block text-[12px]">
                License #
                <input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                />
              </label>
              <label className="block text-[12px]">
                Issuing authority
                <input
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[12px]">
                  Issued
                  <input
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                  />
                </label>
                <label className="block text-[12px]">
                  Expires
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                  />
                </label>
              </div>
              <label className="block text-[12px]">
                Document URL
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="mt-1 w-full h-9 px-2 rounded border border-ink-200 text-[13px]"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="h-9 px-3 rounded-full bg-ink-900 text-paper text-[12px]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="h-9 px-3 rounded-full border border-ink-200 text-[12px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-ink-500 text-[11px] font-mono uppercase">License #</dt>
                <dd>{detail.licenseNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-500 text-[11px] font-mono uppercase">Authority</dt>
                <dd>{detail.issuingAuthority ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-500 text-[11px] font-mono uppercase">Expires</dt>
                <dd>{detail.expiresDisplay}</dd>
              </div>
              <div>
                <dt className="text-ink-500 text-[11px] font-mono uppercase">Verified</dt>
                <dd>
                  {formatVerifiedAt(detail.verifiedAt)}
                  {detail.verifiedByName ? ` · ${detail.verifiedByName}` : ""}
                </dd>
              </div>
              {detail.reviewNotes ? (
                <div className="col-span-2">
                  <dt className="text-ink-500 text-[11px] font-mono uppercase">Review notes</dt>
                  <dd className="text-rose-800">{detail.reviewNotes}</dd>
                </div>
              ) : null}
              {detail.documentUrl ? (
                <div className="col-span-2">
                  <dt className="text-ink-500 text-[11px] font-mono uppercase">Document</dt>
                  <dd>
                    <a
                      href={detail.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline break-all"
                    >
                      Open document
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-ink-100">
            {canVerifyCredential(detail.status) ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => void runAction(() => verifyCredentialAction(detail.id))}
                className="h-9 px-3 rounded-full bg-emerald-700 text-white text-[12px] font-medium"
              >
                Verify
              </button>
            ) : null}
            {canRejectCredential(detail.status) ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => setRejectOpen(true)}
                className="h-9 px-3 rounded-full border border-rose-200 text-rose-800 text-[12px]"
              >
                Reject
              </button>
            ) : null}
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="h-9 px-3 rounded-full border border-ink-200 text-[12px]"
              >
                Edit
              </button>
            ) : null}
            <select
              className="h-9 px-2 rounded-full border border-ink-200 text-[12px] bg-white"
              value=""
              disabled={pending}
              onChange={(e) => {
                const v = e.target.value as CredentialStatus;
                if (!v) return;
                void runAction(() => updateCredentialStatusAction(detail.id, { status: v }));
                e.target.value = "";
              }}
            >
              <option value="">Set status…</option>
              {(["expiring_soon", "expired", "pending_review"] as const).map((s) => (
                <option key={s} value={s}>
                  {CREDENTIAL_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="h-9 px-3 rounded-full text-[12px] text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        </div>
      </aside>

      {rejectOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-ink-200 bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-medium">Reject credential</h3>
            <p className="mt-1 text-[13px] text-ink-600">Reason required (10–500 characters).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-lg border border-ink-200 p-3 text-[13px]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="h-9 px-3 rounded-full border border-ink-200 text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending || rejectReason.trim().length < 10}
                onClick={() =>
                  void runAction(() =>
                    rejectCredentialAction(detail.id, { reason: rejectReason }),
                  ).then(() => setRejectOpen(false))
                }
                className="h-9 px-3 rounded-full bg-rose-700 text-white text-[12px] disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-ink-200 bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-medium">Delete credential?</h3>
            <p className="mt-2 text-[13px] text-ink-600">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="h-9 px-3 rounded-full border border-ink-200 text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  void runAction(() => deleteCredentialAction(detail.id)).then(() => {
                    setDeleteOpen(false);
                    onClose();
                  })
                }
                className="h-9 px-3 rounded-full bg-rose-700 text-white text-[12px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
