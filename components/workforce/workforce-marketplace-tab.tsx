"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/primitives";
import { MarketplaceVisibilityChecklist } from "@/components/workforce/marketplace-visibility-checklist";
import { MarketplaceLocationFix } from "@/components/workforce/marketplace-location-fix";
import { canManageMarketplaceVisibility } from "@/lib/auth/marketplace-visibility-permissions";
import type { VisibilityChecklistResult } from "@/lib/marketplace/visibility-checklist";
import type { ServiceAreaRestrictionInput } from "@/lib/places/query-params";

export type SerializedMarketplaceVisibility = {
  isMarketplaceVisible: boolean;
  visibilityBlockedReason: string | null;
  marketplaceVisibleAt: string | null;
  marketplaceHiddenAt: string | null;
  enabledByName: string | null;
  publicSlug: string | null;
  checklist: VisibilityChecklistResult;
};

export function WorkforceMarketplaceTab({
  professionalId,
  primaryRole,
  visibility: initial,
  serviceArea,
}: {
  professionalId: string;
  primaryRole: string;
  visibility: SerializedMarketplaceVisibility;
  serviceArea: ServiceAreaRestrictionInput;
}) {
  const router = useRouter();
  const canWrite = canManageMarketplaceVisibility(primaryRole);
  const [visibility, setVisibility] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDisabled =
    !canWrite ||
    pending ||
    Boolean(visibility.visibilityBlockedReason) ||
    (!visibility.isMarketplaceVisible && !visibility.checklist.canEnable);

  const patchVisibility = useCallback(
    async (isMarketplaceVisible: boolean) => {
      setPending(true);
      setError(null);
      try {
        const res = await fetch(`/api/workforce/${professionalId}/marketplace-visibility`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isMarketplaceVisible }),
        });
        const data = await res.json();
        if (!res.ok) {
          const detail =
            data.details && typeof data.details === "object"
              ? Object.values(data.details).join(". ")
              : data.error ?? "Could not update visibility";
          setError(String(detail));
          return;
        }
        setVisibility({
          isMarketplaceVisible: data.isMarketplaceVisible,
          visibilityBlockedReason: data.visibilityBlockedReason,
          marketplaceVisibleAt: data.marketplaceVisibleAt ?? null,
          marketplaceHiddenAt: data.marketplaceHiddenAt ?? null,
          enabledByName: data.enabledByName ?? null,
          publicSlug: data.publicSlug ?? null,
          checklist: data.checklist,
        });
        router.refresh();
      } catch {
        setError("Network error. Try again.");
      } finally {
        setPending(false);
      }
    },
    [professionalId, router],
  );

  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-medium tracking-tight">Marketplace visibility</h2>
          <p className="text-[13px] text-ink-600 mt-1 max-w-xl">
            Visibility is agency-controlled. Customers request professionals through staffing
            requests fulfilled by your coordinators.
          </p>
        </div>
        {visibility.isMarketplaceVisible ? (
          <Badge tone="teal">Marketplace visible</Badge>
        ) : (
          <Badge tone="neutral">Not visible</Badge>
        )}
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
          {error}
        </div>
      ) : null}

      <MarketplaceVisibilityChecklist
        items={visibility.checklist.items}
        blockReason={visibility.checklist.blockReason}
      />

      {canWrite && !visibility.checklist.items.find((i) => i.id === "location")?.passed ? (
        <MarketplaceLocationFix
          professionalId={professionalId}
          serviceArea={serviceArea}
          reason={
            visibility.checklist.items.find((i) => i.id === "location")?.detail?.includes(
              "outside",
            )
              ? "out_of_area"
              : "missing_place"
          }
        />
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-ink-100">
        <label className="inline-flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            className="rounded border-ink-300"
            checked={visibility.isMarketplaceVisible}
            disabled={toggleDisabled}
            aria-label="Visible on marketplace"
            onChange={(e) => void patchVisibility(e.target.checked)}
          />
          <span>Visible on marketplace</span>
        </label>
        {!canWrite ? (
          <span className="text-[12px] text-ink-500">Read-only — recruiters and admins can change this.</span>
        ) : toggleDisabled && !visibility.isMarketplaceVisible && !visibility.visibilityBlockedReason ? (
          <span className="text-[12px] text-ink-500">Complete the checklist to enable visibility.</span>
        ) : null}
      </div>

      {visibility.enabledByName && visibility.marketplaceVisibleAt ? (
        <p className="text-[12px] font-mono text-ink-500">
          Last enabled by {visibility.enabledByName} ·{" "}
          {new Date(visibility.marketplaceVisibleAt).toLocaleString()}
        </p>
      ) : null}

      {visibility.publicSlug ? (
        <p className="text-[12px] text-ink-600">
          Public profile URL:{" "}
          <code className="font-mono text-[11px] bg-ink-50 px-1 py-0.5 rounded">
            /marketplace/professionals/{visibility.publicSlug}
          </code>
        </p>
      ) : null}
    </section>
  );
}
