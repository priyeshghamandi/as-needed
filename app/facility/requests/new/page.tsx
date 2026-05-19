import { FacilityNotLinked } from "@/components/facility/facility-not-linked";
import { FacilityRequestCreateForm } from "@/components/facility/facility-request-create-form";
import { loadFacilityPageContext } from "@/lib/facility/load-page-context";

export const metadata = {
  title: "Create staffing request",
};

export default async function FacilityRequestNewPage() {
  const ctx = await loadFacilityPageContext("/facility/requests/new");

  if (!ctx.linked) {
    return <FacilityNotLinked userName={ctx.userName} />;
  }

  return (
    <FacilityRequestCreateForm
      facilityName={ctx.facility.facilityName}
      agencyName={ctx.facility.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
    />
  );
}
