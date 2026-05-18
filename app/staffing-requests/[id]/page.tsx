import { notFound } from "next/navigation";
import { StaffingRequestDetailClient } from "@/components/staffing-requests/staffing-request-detail-client";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { getMatchCandidates } from "@/lib/matching/candidate-query";
import { acknowledgeStaffingRequestRoute } from "@/lib/request-routing/acknowledge-route";
import {
  getAgencyMarketplaceSelections,
  getAgencyRouteForRequest,
} from "@/lib/request-routing/queries";
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

  const isMarketplace = detail.source === "marketplace_customer";
  let routeContext = isMarketplace ? await getAgencyRouteForRequest(ctx.agencyId, id) : null;

  if (
    routeContext?.routingStatus === "routed" &&
    canManageStaffingRequests(ctx.primaryRole)
  ) {
    await acknowledgeStaffingRequestRoute({
      agencyId: ctx.agencyId,
      staffingRequestId: id,
      userId: ctx.userId,
    });
    routeContext = await getAgencyRouteForRequest(ctx.agencyId, id);
  }

  const marketplaceSelections =
    isMarketplace && routeContext
      ? await getAgencyMarketplaceSelections(ctx.agencyId, id)
      : [];

  const primaryShiftId = detail.shifts[0]?.id ?? "";
  const suggestedCandidates =
    primaryShiftId && !["cancelled", "draft", "completed"].includes(detail.status)
      ? await getMatchCandidates(ctx.agencyId, id, primaryShiftId, { limit: 5 })
      : [];

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
      primaryShiftId={primaryShiftId}
      suggestedCandidates={suggestedCandidates}
      marketplaceContext={
        isMarketplace && routeContext
          ? {
              routingStatus: routeContext.routingStatus,
              isOverdue: routeContext.isOverdue,
              responseDueAt: routeContext.responseDueAt?.toISOString() ?? null,
              fulfillmentStatus: detail.fulfillmentStatus,
              selections: marketplaceSelections,
            }
          : null
      }
    />
  );
}
