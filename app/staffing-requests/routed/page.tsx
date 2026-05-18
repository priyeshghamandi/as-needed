import { RoutedRequestsListClient } from "@/components/request-routing/routed-requests-list-client";
import { getRoutedRequestsForAgency } from "@/lib/request-routing/queries";
import { loadStaffingRequestsPageContext } from "@/lib/staffing-requests/load-page-context";

export default async function RoutedRequestsPage() {
  const ctx = await loadStaffingRequestsPageContext("/staffing-requests/routed");
  const items = await getRoutedRequestsForAgency(ctx.agencyId);

  return (
    <RoutedRequestsListClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      items={items.map((item) => ({
        ...item,
        routedAt: item.routedAt?.toISOString() ?? null,
        responseDueAt: item.responseDueAt?.toISOString() ?? null,
      }))}
    />
  );
}
