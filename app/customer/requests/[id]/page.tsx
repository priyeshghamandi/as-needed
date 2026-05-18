import { notFound } from "next/navigation";
import { CustomerRequestDetailView } from "@/components/customer-requests/customer-request-detail";
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
  const request = await getCustomerRequestDetail(ctx.scope.facilityId, id);
  if (!request) notFound();

  const raw = await searchParams;
  const showSubmittedBanner = raw.submitted === "1" || raw.duplicate === "1";

  return (
    <CustomerRequestDetailView
      scope={ctx.scope}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      request={request}
      showSubmittedBanner={showSubmittedBanner}
    />
  );
}
