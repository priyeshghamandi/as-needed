import Link from "next/link";
import { CustomerShell } from "@/components/customer-requests/customer-shell";
import { Badge } from "@/components/primitives";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";
import type { CustomerRequestListItem } from "@/lib/customer-requests/queries";
import {
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_TONES,
  type StaffingRequestFulfillmentStatus,
} from "@/lib/ui/fulfillment-status";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";

export function CustomerRequestsList({
  scope,
  userName,
  userInitials,
  items,
}: {
  scope: { facilityName: string; agencyName: string };
  userName: string;
  userInitials: string;
  items: CustomerRequestListItem[];
}) {
  return (
    <CustomerShell
      facilityName={scope.facilityName}
      agencyName={scope.agencyName}
      userName={userName}
      userInitials={userInitials}
      title="My staffing requests"
      subtitle="Track marketplace staffing requests submitted to your agency coordinators."
      headerActionHref="/marketplace/search"
      headerActionLabel="Find professionals"
    >
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center space-y-4">
          <p className="text-[15px] text-ink-700">No staffing requests yet.</p>
          <Link href="/marketplace/search" className={PRIMARY_LINK_CLASS}>
            Search the marketplace
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium">Professionals</th>
                <th className="px-4 py-3 font-medium">Availability</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = item.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
                const tone = status ? FULFILLMENT_STATUS_TONES[status] : "neutral";
                const label = status ? FULFILLMENT_STATUS_LABELS[status] : "—";
                const window =
                  item.shiftStartAt && item.shiftEndAt
                    ? formatShiftWindow(item.shiftStartAt, item.shiftEndAt)
                    : "—";
                return (
                  <tr key={item.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/customer/requests/${item.id}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {status ? <Badge tone={tone}>{label}</Badge> : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{item.selectionCount}</td>
                    <td className="px-4 py-3 text-ink-600">{window}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {item.updatedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CustomerShell>
  );
}
