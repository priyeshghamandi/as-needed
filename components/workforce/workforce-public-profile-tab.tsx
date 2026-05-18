"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/primitives";
import { canManageMarketplaceVisibility } from "@/lib/auth/marketplace-visibility-permissions";
import type { AgencyPublicProfileEditState } from "@/lib/marketplace/public-profile";

export type SerializedPublicProfileEdit = Omit<
  AgencyPublicProfileEditState,
  "approximateAvailability"
> & {
  approximateAvailability: string | null;
};

export function WorkforcePublicProfileTab({
  professionalId,
  primaryRole,
  initial,
}: {
  professionalId: string;
  primaryRole: string;
  initial: SerializedPublicProfileEdit;
}) {
  const router = useRouter();
  const canWrite = canManageMarketplaceVisibility(primaryRole);
  const [state, setState] = useState(initial);
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [specialtiesText, setSpecialtiesText] = useState(initial.specialties.join(", "));
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl ?? "");
  const [credentialsSummary, setCredentialsSummary] = useState(
    initial.credentialsSummary ?? "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async () => {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const specialties = specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/workforce/${professionalId}/public-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          specialties,
          photoUrl,
          credentialsSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? data.details ?? "Could not save public profile");
        return;
      }
      setState(data);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }, [
    professionalId,
    headline,
    bio,
    specialtiesText,
    photoUrl,
    credentialsSummary,
    router,
  ]);

  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-medium tracking-tight">Public marketplace profile</h2>
          <p className="text-[13px] text-ink-600 mt-1 max-w-xl">
            These fields appear on the public profile when marketplace visibility is enabled.
            Availability is approximate only — exact schedules are never shown.
          </p>
        </div>
        {state.isMarketplaceVisible ? <Badge tone="teal">Visible on marketplace</Badge> : null}
      </div>

      {state.warnings.length > 0 ? (
        <ul className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 space-y-1">
          {state.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
          {error}
        </div>
      ) : null}

      {saved ? (
        <p role="status" className="text-[13px] text-teal-800">
          Public profile saved.
        </p>
      ) : null}

      {state.previewPath ? (
        <p className="text-[13px] text-ink-600">
          Preview:{" "}
          <Link href={state.previewPath} className="text-teal-800 hover:underline" target="_blank">
            {state.previewPath}
          </Link>
        </p>
      ) : null}

      {state.approximateAvailabilityLabel ? (
        <p className="text-[13px] text-ink-600">
          Computed availability signal:{" "}
          <span className="font-medium">{state.approximateAvailabilityLabel}</span>
          <span className="text-ink-500"> (refreshed on save)</span>
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 max-w-xl">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">Headline</span>
          <input
            type="text"
            maxLength={80}
            value={headline}
            disabled={!canWrite || pending}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full h-10 rounded-lg border border-ink-200 px-3 text-[14px] disabled:opacity-60"
            placeholder="e.g. ICU RN with 8+ years acute care experience"
          />
          <span className="text-[12px] text-ink-500">{headline.length}/80</span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">Bio</span>
          <textarea
            maxLength={500}
            rows={4}
            value={bio}
            disabled={!canWrite || pending}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-[14px] disabled:opacity-60"
            placeholder="Short public bio for facility customers"
          />
          <span className="text-[12px] text-ink-500">{bio.length}/500</span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">Specialties</span>
          <input
            type="text"
            value={specialtiesText}
            disabled={!canWrite || pending}
            onChange={(e) => setSpecialtiesText(e.target.value)}
            className="w-full h-10 rounded-lg border border-ink-200 px-3 text-[14px] disabled:opacity-60"
            placeholder="Comma-separated, e.g. ICU, Med-Surg"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">Photo URL</span>
          <input
            type="url"
            value={photoUrl}
            disabled={!canWrite || pending}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full h-10 rounded-lg border border-ink-200 px-3 text-[14px] disabled:opacity-60"
            placeholder="https://…"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium">Credentials summary</span>
          <textarea
            rows={3}
            value={credentialsSummary}
            disabled={!canWrite || pending}
            onChange={(e) => setCredentialsSummary(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-[14px] disabled:opacity-60"
            placeholder="One line per credential, e.g. RN License — Verified"
          />
        </label>
      </div>

      {canWrite ? (
        <button
          type="button"
          disabled={pending || !headline.trim()}
          onClick={() => void save()}
          className="h-10 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save public profile"}
        </button>
      ) : (
        <p className="text-[12px] text-ink-500">Read-only — recruiters and admins can edit this tab.</p>
      )}
    </section>
  );
}
