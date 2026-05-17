import { notFound } from "next/navigation";
import { ShiftDetailClient } from "@/components/shifts/shift-detail-client";
import { loadShiftsPageContext } from "@/lib/shifts/load-page-context";
import { getShiftDetail } from "@/lib/shifts/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShiftDetailPage({ params }: PageProps) {
  const ctx = await loadShiftsPageContext();
  const { id } = await params;
  const detail = await getShiftDetail(ctx.agencyId, id);

  if (!detail) notFound();

  const serialized = {
    id: detail.id,
    shiftType: detail.shiftType,
    breakMinutes: detail.breakMinutes,
    startAt: detail.startAt.toISOString(),
    endAt: detail.endAt.toISOString(),
    requiredCount: detail.requiredCount,
    filledCount: detail.filledCount,
    progress: detail.progress,
    status: detail.status,
    staffingRequestId: detail.staffingRequestId,
    requestTitle: detail.requestTitle,
    requestStatus: detail.requestStatus,
    facility: detail.facility,
    assignments: detail.assignments.map((a) => ({
      ...a,
      invitedAt: a.invitedAt?.toISOString() ?? null,
      respondedAt: a.respondedAt?.toISOString() ?? null,
    })),
    isUrgent: detail.isUrgent,
    canEdit: detail.canEdit,
  };

  return (
    <ShiftDetailClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      shift={serialized}
    />
  );
}
