import { Suspense } from "react";
import { StaffingRequestsListClient } from "@/components/staffing-requests/staffing-requests-list-client";
import { parseStaffingRequestsListParams } from "@/lib/staffing-requests/list-filters";
import { loadStaffingRequestsPageContext } from "@/lib/staffing-requests/load-page-context";
import {
  getAgencyFacilities,
  getStaffingRequestsList,
} from "@/lib/staffing-requests/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffingRequestsPage({ searchParams }: PageProps) {
  const ctx = await loadStaffingRequestsPageContext();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseStaffingRequestsListParams(sp);
  const [result, facilities] = await Promise.all([
    getStaffingRequestsList(ctx.agencyId, params),
    getAgencyFacilities(ctx.agencyId),
  ]);

  const items = result.items.map((item) => ({
    ...item,
    shiftStartAt: item.shiftStartAt?.toISOString() ?? null,
    shiftEndAt: item.shiftEndAt?.toISOString() ?? null,
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading requests…</div>}>
      <StaffingRequestsListClient
        agencyName={ctx.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        primaryRole={ctx.primaryRole}
        items={items}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        filters={{
          q: params.q ?? "",
          status: params.status?.[0] ?? "",
          facilityId: params.facilityId ?? "",
          priority: params.priority ?? "",
          page: result.page,
        }}
        facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
      />
    </Suspense>
  );
}
