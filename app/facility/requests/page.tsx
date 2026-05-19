import { Suspense } from "react";
import { FacilityNotLinked } from "@/components/facility/facility-not-linked";
import { FacilityRequestsListView } from "@/components/facility/facility-requests-list-view";
import { parseFacilityRequestListParams } from "@/lib/facility/list-filters";
import { listFacilityRequests } from "@/lib/facility/queries";
import { loadFacilityPageContext } from "@/lib/facility/load-page-context";

export const metadata = {
  title: "Staffing requests",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FacilityRequestsPage({ searchParams }: PageProps) {
  const ctx = await loadFacilityPageContext("/facility/requests");

  if (!ctx.linked) {
    return <FacilityNotLinked userName={ctx.userName} />;
  }

  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseFacilityRequestListParams(sp);
  const { items, total } = await listFacilityRequests(ctx.facility, params);

  return (
    <Suspense>
      <FacilityRequestsListView
        facilityName={ctx.facility.facilityName}
        agencyName={ctx.facility.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        items={items}
        total={total}
        page={params.page}
        pageSize={params.pageSize}
        initialStatus={params.status?.[0]}
        initialSearch={params.search}
      />
    </Suspense>
  );
}
