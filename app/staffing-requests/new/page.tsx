import { redirect } from "next/navigation";
import { StaffingRequestCreateForm } from "@/components/staffing-requests/staffing-request-create-form";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { loadStaffingRequestsPageContext } from "@/lib/staffing-requests/load-page-context";
import {
  getAgencyCoordinators,
  getAgencyFacilities,
} from "@/lib/staffing-requests/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewStaffingRequestPage({ searchParams }: PageProps) {
  const ctx = await loadStaffingRequestsPageContext("/staffing-requests/new");

  if (!canManageStaffingRequests(ctx.primaryRole)) {
    redirect("/staffing-requests?error=forbidden");
  }

  const raw = await searchParams;
  const facilityId =
    typeof raw.facilityId === "string" ? raw.facilityId : undefined;

  const [facilities, coordinators] = await Promise.all([
    getAgencyFacilities(ctx.agencyId),
    getAgencyCoordinators(ctx.agencyId),
  ]);

  return (
    <StaffingRequestCreateForm
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      userId={ctx.userId}
      facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
      coordinators={coordinators.map((c) => ({ id: c.id, name: c.name ?? "Coordinator" }))}
      prefillFacilityId={facilityId}
    />
  );
}
