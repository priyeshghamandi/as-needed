import Link from "next/link";
import { CustomerSuggestedAlternativeCard } from "@/components/alternatives/customer-suggested-alternative-card";
import { CustomerApproveFulfillment } from "@/components/fulfillment/customer-approve-fulfillment";
import type { PendingAlternativeForCustomer } from "@/lib/alternatives/queries";
import { CustomerShell } from "@/components/customer-requests/customer-shell";
import { CustomerRequestSelectionCards } from "@/components/customer-requests/customer-request-selection-cards";
import { Badge } from "@/components/primitives";
import type { CustomerRequestDetail } from "@/lib/customer-requests/queries";
import {
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_TONES,
  type StaffingRequestFulfillmentStatus,
} from "@/lib/ui/fulfillment-status";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";

export function CustomerRequestDetailView({
  scope,
  requestsNavLabel,
  userName,
  userInitials,
  request,
  pendingAlternative,
  showSubmittedBanner,
}: {
  scope: { facilityName: string; agencyName?: string | null };
  requestsNavLabel?: string;
  userName: string;
  userInitials: string;
  request: CustomerRequestDetail;
  pendingAlternative: (Omit<PendingAlternativeForCustomer, "proposedAt"> & {
    proposedAt: string;
  }) | null;
  showSubmittedBanner?: boolean;
}) {
  const status = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  const tone = status ? FULFILLMENT_STATUS_TONES[status] : "neutral";
  const label = status ? FULFILLMENT_STATUS_LABELS[status] : "Pending";

  const selectionPreviews = request.selections.map((s) => ({
    id: s.id,
    displayName: s.displayName,
    role: s.role,
    roleLabel: roleNeededLabel(s.role),
    agencyName: scope.agencyName ?? "Agency",
    headline: null,
    eligible: true,
  }));

  const window =
    request.shiftStartAt && request.shiftEndAt
      ? formatShiftWindow(request.shiftStartAt, request.shiftEndAt)
      : "—";

  return (
    <CustomerShell
      facilityName={scope.facilityName}
      agencyName={scope.agencyName}
      requestsNavLabel={requestsNavLabel}
      userName={userName}
      userInitials={userInitials}
      title={request.title}
      subtitle="Agency-mediated staffing request — not a direct hire."
    >
      <div className="space-y-6">
        {showSubmittedBanner ? (
          <div
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[14px] text-teal-900"
            role="status"
          >
            Your staffing request was submitted. Agency coordinators will review it and confirm
            fulfillment or suggest an alternative.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={tone}>{label}</Badge>
          <span className="text-[13px] text-ink-600">
            {roleNeededLabel(request.roleNeeded)} · {request.selections.length} preferred
            professional{request.selections.length === 1 ? "" : "s"}
          </span>
        </div>

        <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
            <div>
              <dt className="text-ink-500">Availability window</dt>
              <dd className="font-medium text-ink-900">{window}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Professionals required</dt>
              <dd className="font-medium text-ink-900">{request.professionalsRequired}</dd>
            </div>
            {request.shiftType ? (
              <div>
                <dt className="text-ink-500">Shift type</dt>
                <dd className="font-medium text-ink-900">{request.shiftType.replace("_", " ")}</dd>
              </div>
            ) : null}
            {request.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-ink-500">Notes</dt>
                <dd className="text-ink-800 whitespace-pre-wrap">{request.notes}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        {pendingAlternative ? (
          <CustomerSuggestedAlternativeCard
            requestId={request.id}
            alternative={pendingAlternative}
          />
        ) : null}

        {status === "agency_confirmed" ? (
          <CustomerApproveFulfillment requestId={request.id} />
        ) : null}

        <section className="space-y-3">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">
            Preferred professionals
          </h2>
          <CustomerRequestSelectionCards items={selectionPreviews} readOnly />
        </section>

        <p className="text-[13px] text-ink-600">
          <Link href="/customer/requests" className="text-teal-800 hover:underline">
            ← Back to all requests
          </Link>
        </p>
      </div>
    </CustomerShell>
  );
}
