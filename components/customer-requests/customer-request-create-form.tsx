"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CustomerShell } from "@/components/customer-requests/customer-shell";
import { CustomerRequestSelectionCards } from "@/components/customer-requests/customer-request-selection-cards";
import { Button, Icon } from "@/components/primitives";
import type { CustomerSelectionPreview } from "@/lib/customer-requests/create-customer-request";
import type { CustomerRequestScope } from "@/lib/customer-requests/customer-scope";
import {
  MARKETPLACE_REQUEST_CART_KEY,
  readMarketplaceCart,
  writeMarketplaceCart,
  type MarketplaceRequestCart,
} from "@/lib/marketplace/marketplace-cart";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";
import { SHIFT_TYPES } from "@/lib/validations/staffing-request";

function defaultAvailabilityFromCart(cart: MarketplaceRequestCart | null) {
  if (cart?.needStart && cart?.needEnd) {
    return {
      start: cart.needStart.slice(0, 16),
      end: cart.needEnd.slice(0, 16),
    };
  }
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(7, 0, 0, 0);
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
  return {
    start: start.toISOString().slice(0, 16),
    end: end.toISOString().slice(0, 16),
  };
}

export function CustomerRequestCreateForm({
  scope,
  isConsumer = false,
  requestsNavLabel,
  userName,
  userInitials,
  prefillProfessionalId,
}: {
  scope: CustomerRequestScope;
  isConsumer?: boolean;
  requestsNavLabel?: string;
  userName: string;
  userInitials: string;
  prefillProfessionalId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<MarketplaceRequestCart | null>(null);
  const [selections, setSelections] = useState<CustomerSelectionPreview[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(() => defaultAvailabilityFromCart(cart), [cart]);
  const [availabilityStart, setAvailabilityStart] = useState(defaults.start);
  const [availabilityEnd, setAvailabilityEnd] = useState(defaults.end);
  const [shiftType, setShiftType] = useState(cart?.shiftType ?? "day");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const stored = readMarketplaceCart();
    let ids = stored?.professionalIds ?? [];
    const fromQuery = prefillProfessionalId ?? searchParams.get("professionalId");
    if (fromQuery && !ids.includes(fromQuery)) {
      ids = [...ids, fromQuery].slice(0, 5);
    }
    if (ids.length === 0) {
      router.replace("/marketplace/search");
      return;
    }
    const nextCart: MarketplaceRequestCart = stored ?? {
      professionalIds: ids,
      role: "rn",
      needStart: null,
      needEnd: null,
      urgency: null,
      shiftType: null,
      locationDisplayName: null,
    };
    nextCart.professionalIds = ids;
    setCart(nextCart);
    writeMarketplaceCart(nextCart);
  }, [prefillProfessionalId, router, searchParams]);

  const loadSelections = useCallback(async (ids: string[]) => {
    setLoadingSelections(true);
    try {
      const res = await fetch(`/api/customer/requests/selections?ids=${ids.join(",")}`);
      const data = (await res.json()) as { items?: CustomerSelectionPreview[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load selections");
      setSelections(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load selections");
    } finally {
      setLoadingSelections(false);
    }
  }, []);

  useEffect(() => {
    if (!cart?.professionalIds.length) return;
    void loadSelections(cart.professionalIds);
  }, [cart?.professionalIds, loadSelections]);

  useEffect(() => {
    if (!cart?.role) return;
    setTitle(`${roleNeededLabel(cart.role)} staffing — ${scope.facilityName}`);
  }, [cart?.role, scope.facilityName]);

  useEffect(() => {
    setAvailabilityStart(defaults.start);
    setAvailabilityEnd(defaults.end);
  }, [defaults.end, defaults.start]);

  const roleNeeded = cart?.role ?? selections[0]?.role ?? "rn";

  const removeSelection = (id: string) => {
    if (!cart) return;
    const nextIds = cart.professionalIds.filter((pid) => pid !== id);
    if (nextIds.length === 0) {
      sessionStorage.removeItem(MARKETPLACE_REQUEST_CART_KEY);
      router.push("/marketplace/search");
      return;
    }
    const next = { ...cart, professionalIds: nextIds };
    setCart(next);
    writeMarketplaceCart(next);
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.professionalIds.length) return;
    if (selections.some((s) => !s.eligible)) {
      setError("Remove professionals who are no longer available before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: scope.facilityId,
          professionalIds: cart.professionalIds,
          roleNeeded,
          title,
          availabilityStart: new Date(availabilityStart).toISOString(),
          availabilityEnd: new Date(availabilityEnd).toISOString(),
          shiftType: shiftType || "",
          professionalsRequired: cart.professionalIds.length,
          notes,
        }),
      });
      const data = (await res.json()) as {
        id?: string;
        error?: string;
        existingRequestId?: string;
      };
      if (!res.ok) {
        if (res.status === 409 && data.existingRequestId) {
          router.push(`/customer/requests/${data.existingRequestId}?duplicate=1`);
          return;
        }
        throw new Error(data.error ?? "Failed to submit request");
      }
      sessionStorage.removeItem(MARKETPLACE_REQUEST_CART_KEY);
      router.push(`/customer/requests/${data.id}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerShell
      facilityName={scope.facilityName}
      agencyName={scope.scopeType === "facility" ? scope.agencyName : null}
      requestsNavLabel={requestsNavLabel}
      userName={userName}
      userInitials={userInitials}
      title={isConsumer ? "Request care" : "Request professionals"}
      subtitle={
        isConsumer
          ? "Submit a home care staffing request for licensed agencies to coordinate. This is not direct hire."
          : "Submit a staffing request for agency coordinators to review. This is not a direct hire or instant booking."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        <section className="space-y-3">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">
            Selected professionals
          </h2>
          {loadingSelections ? (
            <p className="text-[14px] text-ink-600">Loading selections…</p>
          ) : (
            <CustomerRequestSelectionCards items={selections} onRemove={removeSelection} />
          )}
        </section>

        <section className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-[16px] font-medium tracking-tight">Staffing need</h2>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-800">Request title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-800">Facility</span>
            <input
              value={scope.facilityName}
              readOnly
              className="w-full h-11 rounded-lg border border-ink-200 bg-ink-50 px-3 text-[14px] text-ink-700"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-ink-800">Availability start</span>
              <input
                type="datetime-local"
                value={availabilityStart}
                onChange={(e) => setAvailabilityStart(e.target.value)}
                className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-ink-800">Availability end</span>
              <input
                type="datetime-local"
                value={availabilityEnd}
                onChange={(e) => setAvailabilityEnd(e.target.value)}
                className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px]"
                required
              />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-800">Shift type (optional)</span>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full h-11 rounded-lg border border-ink-200 px-3 text-[14px] bg-white"
            >
              {SHIFT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-800">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-[14px]"
              placeholder="Unit, special requirements, or context for coordinators"
            />
          </label>
        </section>

        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900 leading-relaxed">
          Agency coordinators will review your staffing request and confirm fulfillment or suggest
          an alternative. You will not be charged or confirmed until you approve agency
          fulfillment.
        </div>

        {error ? (
          <p className="text-[14px] text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-ink-200 bg-paper/95 backdrop-blur p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="max-w-[1100px] mx-auto flex flex-wrap gap-3 justify-end">
            <Button as={Link} href="/marketplace/search" variant="secondary" size="md">
              Back to search
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit staffing request"}
              <Icon name="arrow-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </CustomerShell>
  );
}
