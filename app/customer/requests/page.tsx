import { CustomerRequestsList } from "@/components/customer-requests/customer-requests-list";
import { listCustomerRequests } from "@/lib/customer-requests/queries";
import { loadCustomerRequestsPageContext } from "@/lib/customer-requests/load-page-context";

export const metadata = {
  title: "My staffing requests",
};

export default async function CustomerRequestsPage() {
  const ctx = await loadCustomerRequestsPageContext();
  const items = await listCustomerRequests(ctx.scope.facilityId);

  return (
    <CustomerRequestsList
      scope={ctx.scope}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      items={items}
    />
  );
}
