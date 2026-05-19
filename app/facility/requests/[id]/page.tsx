import { notFound } from "next/navigation";
import { FacilityNotLinked } from "@/components/facility/facility-not-linked";
import { FacilityRequestDetailView } from "@/components/facility/facility-request-detail-view";
import { getFacilityRequestDetail } from "@/lib/facility/queries";
import { loadFacilityPageContext } from "@/lib/facility/load-page-context";

export const metadata = {
  title: "Staffing request",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FacilityRequestDetailPage({ params, searchParams }: PageProps) {
  const ctx = await loadFacilityPageContext("/facility/requests");

  if (!ctx.linked) {
    return <FacilityNotLinked userName={ctx.userName} />;
  }

  const { id } = await params;
  const request = await getFacilityRequestDetail(ctx.facility, id);
  if (!request) notFound();

  const raw = await searchParams;
  const showSubmittedBanner = raw.submitted === "1";

  return (
    <FacilityRequestDetailView
      facilityName={ctx.facility.facilityName}
      agencyName={ctx.facility.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      request={request}
      showSubmittedBanner={showSubmittedBanner}
    />
  );
}
