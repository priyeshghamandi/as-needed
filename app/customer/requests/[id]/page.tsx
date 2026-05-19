import { notFound } from "next/navigation";
import { CustomerRequestDetailView } from "@/components/customer-requests/customer-request-detail";
import { getPendingAlternativeForCustomer } from "@/lib/alternatives/queries";
import { getCustomerRequestDetail } from "@/lib/customer-requests/queries";
import { loadCustomerRequestsPageContext } from "@/lib/customer-requests/load-page-context";

export const metadata = {
  title: "Staffing request",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerRequestDetailPage({ params, searchParams }: PageProps) {
  const ctx = await loadCustomerRequestsPageContext();
  const { id } = await params;
  const [request, pendingAlternative] = await Promise.all([
    getCustomerRequestDetail(ctx.scope.facilityId, id),
    getPendingAlternativeForCustomer(id),
  ]);
  if (!request) notFound();

  const raw = await searchParams;
  const showSubmittedBanner = raw.submitted === "1" || raw.duplicate === "1";

  return (
    <CustomerRequestDetailView
      scope={{
        facilityName: ctx.facilityName,
        agencyName: ctx.agencyName,
      }}
      requestsNavLabel={ctx.navRequestsLabel}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      request={request}
      pendingAlternative={
        pendingAlternative
          ? { ...pendingAlternative, proposedAt: pendingAlternative.proposedAt.toISOString() }
          : null
      }
      showSubmittedBanner={showSubmittedBanner}
    />
  );
}
