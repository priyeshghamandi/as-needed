import { Suspense } from "react";
import { CustomerRequestCreateForm } from "@/components/customer-requests/customer-request-create-form";
import { loadCustomerRequestsPageContext } from "@/lib/customer-requests/load-page-context";

export const metadata = {
  title: "Request professionals",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerRequestNewPage({ searchParams }: PageProps) {
  const ctx = await loadCustomerRequestsPageContext();
  const raw = await searchParams;
  const prefillProfessionalId =
    typeof raw.professionalId === "string" ? raw.professionalId : undefined;

  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-600">Loading…</p>}>
      <CustomerRequestCreateForm
        scope={ctx.scope}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        prefillProfessionalId={prefillProfessionalId}
      />
    </Suspense>
  );
}
