"use client";

import Link from "next/link";
import { AgencyShell } from "@/components/agency-shell";
import { RoutingStatusBadge } from "@/components/request-routing/routing-status-badge";
import { Badge } from "@/components/primitives";
import {
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_TONES,
  type StaffingRequestFulfillmentStatus,
} from "@/lib/ui/fulfillment-status";
import type { StaffingRequestRoutingStatus } from "@/lib/ui/routing-status";

export type SerializedRoutedRequestItem = {
  routeId: string;
  staffingRequestId: string;
  title: string;
  facilityName: string;
  fulfillmentStatus: string | null;
  routingStatus: StaffingRequestRoutingStatus;
  routedAt: string | null;
  responseDueAt: string | null;
  selectionCount: number;
  professionalNames: string;
  isOverdue: boolean;
};

export function RoutedRequestsListClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  items,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  items: SerializedRoutedRequestItem[];
}) {
  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Routed requests"
      subtitle="Marketplace staffing requests routed to your agency"
    >
      {items.length === 0 ? (
        <div className="rounded-xl border border-ink-200 bg-white p-8 text-center">
          <p className="text-[14px] text-ink-700">No marketplace requests are routed to your agency.</p>
          <p className="mt-2 text-[13px] text-ink-500">
            When a facility selects your professionals on the marketplace, requests appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/80">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Request
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Facility
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Professionals
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Routed
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Routing
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Fulfillment
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.routeId}
                  className={`border-b border-ink-100 last:border-0 ${
                    item.isOverdue ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/staffing-requests/${item.staffingRequestId}/fulfillment`}
                      className="font-medium text-teal-800 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{item.facilityName}</td>
                  <td className="px-4 py-3 text-ink-700">
                    <span className="block">{item.professionalNames || "—"}</span>
                    <span className="text-[11px] font-mono text-ink-500">
                      {item.selectionCount} selected
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-600">
                    {item.routedAt ? new Date(item.routedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <RoutingStatusBadge status={item.routingStatus} overdue={item.isOverdue} />
                  </td>
                  <td className="px-4 py-3">
                    {item.fulfillmentStatus ? (
                      <FulfillmentBadge status={item.fulfillmentStatus as StaffingRequestFulfillmentStatus} />
                    ) : (
                      <span className="text-ink-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AgencyShell>
  );
}

function FulfillmentBadge({ status }: { status: StaffingRequestFulfillmentStatus }) {
  return (
    <Badge tone={FULFILLMENT_STATUS_TONES[status]} className="font-mono text-[11px]">
      {FULFILLMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
