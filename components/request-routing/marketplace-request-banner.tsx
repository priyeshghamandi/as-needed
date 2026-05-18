import { Icon } from "@/components/primitives";
import { RoutingStatusBadge } from "@/components/request-routing/routing-status-badge";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";
import type { StaffingRequestRoutingStatus } from "@/lib/ui/routing-status";

export function MarketplaceRequestBanner({
  routingStatus,
  isOverdue,
  responseDueAt,
  marketplaceSelections,
}: {
  routingStatus: StaffingRequestRoutingStatus;
  isOverdue: boolean;
  responseDueAt: string | null;
  marketplaceSelections: { id: string; displayName: string; role: string }[];
}) {
  return (
    <section
      role="region"
      aria-label="Marketplace staffing request"
      className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-8 h-8 rounded-lg bg-teal-700 text-white inline-flex items-center justify-center shrink-0">
          <Icon name="store" className="w-4 h-4" />
        </span>
        <div>
          <h2 className="text-[14px] font-medium tracking-tight text-ink-900">
            Marketplace request — customer selected professionals
          </h2>
          <p className="mt-1 text-[13px] text-ink-700">
            This request came from the public marketplace. Review the facility&apos;s preferred
            professionals for your agency below.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RoutingStatusBadge status={routingStatus} overdue={isOverdue} />
        {responseDueAt ? (
          <span className="text-[12px] font-mono text-ink-600">
            Response due {new Date(responseDueAt).toLocaleString()}
          </span>
        ) : null}
      </div>
      {marketplaceSelections.length > 0 ? (
        <div>
          <h3 className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">
            Customer selections (your agency)
          </h3>
          <ul className="mt-2 space-y-1.5">
            {marketplaceSelections.map((pro) => (
              <li
                key={pro.id}
                className="flex items-center justify-between text-[13px] text-ink-800 rounded-md bg-white/80 border border-teal-100 px-3 py-2"
              >
                <span className="font-medium">{pro.displayName}</span>
                <span className="font-mono text-[11px] text-ink-500 uppercase">
                  {roleNeededLabel(pro.role)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

