import { notFound } from "next/navigation";
import { StaffingRequestDetailClient } from "@/components/staffing-requests/staffing-request-detail-client";
import { loadStaffingRequestsPageContext } from "@/lib/staffing-requests/load-page-context";
import { getStaffingRequestDetail } from "@/lib/staffing-requests/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffingRequestDetailPage({ params }: PageProps) {
  const ctx = await loadStaffingRequestsPageContext();
  const { id } = await params;
  const detail = await getStaffingRequestDetail(ctx.agencyId, id);

  if (!detail) notFound();

  const serialized = {
    id: detail.id,
    title: detail.title,
    status: detail.status,
    priority: detail.priority,
    roleNeeded: detail.roleNeeded,
    specialty: detail.specialty,
    professionalsRequired: detail.professionalsRequired,
    filledCount: detail.filledCount,
    progress: detail.progress,
    requiredCredentials: detail.requiredCredentials,
    notes: detail.notes,
    facilityInstructions: detail.facilityInstructions,
    coordinatorName: detail.coordinatorName,
    facility: detail.facility,
    shifts: detail.shifts.map((s) => ({
      id: s.id,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      shiftType: s.shiftType,
      status: s.status,
    })),
  };

  return (
    <StaffingRequestDetailClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      request={serialized}
    />
  );
}
