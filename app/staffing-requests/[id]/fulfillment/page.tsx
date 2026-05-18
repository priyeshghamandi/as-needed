import { notFound } from "next/navigation";
import { AgencyFulfillmentReviewClient } from "@/components/fulfillment/agency-fulfillment-review-client";
import { getAgencyFulfillmentPageData } from "@/lib/fulfillment/queries";
import { loadStaffingRequestsPageContext } from "@/lib/staffing-requests/load-page-context";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffingRequestFulfillmentPage({ params }: PageProps) {
  const ctx = await loadStaffingRequestsPageContext();
  const { id } = await params;
  const data = await getAgencyFulfillmentPageData(ctx.agencyId, id);

  if (!data) notFound();

  return (
    <AgencyFulfillmentReviewClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      data={{
        ...data,
        shiftStartAt: data.shiftStartAt?.toISOString() ?? null,
        shiftEndAt: data.shiftEndAt?.toISOString() ?? null,
        reviewHistory: data.reviewHistory.map((item) => ({
          ...item,
          reviewedAt: item.reviewedAt.toISOString(),
        })),
        alternatives: data.alternatives.map((alt) => ({
          ...alt,
          proposedAt: alt.proposedAt.toISOString(),
        })),
      }}
    />
  );
}
