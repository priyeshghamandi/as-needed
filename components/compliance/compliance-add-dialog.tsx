"use client";

import { useState } from "react";
import { Icon } from "@/components/primitives";
import { createCredentialAction } from "@/actions/compliance/create-credential";

export type ProfessionalOption = {
  id: string;
  label: string;
  role: string;
};

export function ComplianceAddDialog({
  professionals,
  onClose,
  onCreated,
}: {
  professionals: ProfessionalOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id ?? "");
  const [type, setType] = useState("license");
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setPending(true);
    const result = await createCredentialAction({
      professionalId,
      type,
      name,
      licenseNumber,
      issuingAuthority,
      issuedAt,
      expiresAt,
      documentUrl,
    });
    setPending(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    if (result.warning) setWarning(result.warning);
    onCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-credential-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-ink-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 id="add-credential-title" className="text-[16px] font-medium tracking-tight">
            Add credential
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-ink-500 hover:bg-ink-100"
            aria-label="Close"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-800"
            >
              {error}
            </div>
          ) : null}
          {warning ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
              {warning}
            </div>
          ) : null}
          <label className="block">
            <span className="text-[12px] font-medium text-ink-600">Professional</span>
            <select
              required
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.role.toUpperCase()})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] font-medium text-ink-600">Type</span>
              <input
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
              />
            </label>
            <label className="block col-span-2 sm:col-span-1">
              <span className="text-[12px] font-medium text-ink-600">Credential name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-600">License number</span>
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-600">Issuing authority</span>
            <input
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] font-medium text-ink-600">Issued</span>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-ink-600">Expires</span>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[12px] font-medium text-ink-600">Document URL</span>
            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full h-10 px-3 rounded-lg border border-ink-200 text-[13px]"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-full border border-ink-200 text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !professionalId}
              className="h-10 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
            >
              {pending ? "Saving…" : "Add credential"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
