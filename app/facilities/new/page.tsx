import { redirect } from "next/navigation";
import { FacilityAddForm } from "@/components/facilities/facility-add-form";
import { canManageFacilities } from "@/lib/auth/facilities-access-rules";
import { loadFacilitiesPageContext } from "@/lib/facilities/load-page-context";

export default async function FacilitiesNewPage() {
  const ctx = await loadFacilitiesPageContext("/facilities/new");

  if (!canManageFacilities(ctx.primaryRole)) {
    redirect("/facilities?error=forbidden");
  }

  return (
    <FacilityAddForm
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      serviceArea={ctx.serviceArea}
    />
  );
}
