import { notFound } from "next/navigation";
import { MatchPageClient } from "@/components/matching/match-page-client";
import { loadMatchPageContext } from "@/lib/matching/load-match-context";
import {
  getMatchCandidates,
  getMatchContext,
  getShiftAssignmentsForRequest,
} from "@/lib/matching/candidate-query";
import { getStaffingRequestDetail } from "@/lib/staffing-requests/queries";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffingRequestMatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const raw = await searchParams;
  const ctx = await loadMatchPageContext(`/staffing-requests/${id}/match`);

  const matchCtx = await getMatchContext(ctx.agencyId, id, raw.shiftId as string ?? "");
  if (!matchCtx) notFound();

  const shiftId =
    (typeof raw.shiftId === "string" ? raw.shiftId : undefined) ?? matchCtx.activeShift.id;

  const filters = {
    availableOnly: raw.availableOnly === "1",
    withinServiceArea: raw.withinServiceArea === "1",
    hasRequiredCredentials: raw.hasRequiredCredentials === "1",
  };

  const [candidates, assignments, detail] = await Promise.all([
    getMatchCandidates(ctx.agencyId, id, shiftId, filters),
    getShiftAssignmentsForRequest(ctx.agencyId, id, shiftId),
    getStaffingRequestDetail(ctx.agencyId, id),
  ]);

  if (!detail) notFound();

  const serialized = {
    request: {
      id: matchCtx.request.id,
      title: matchCtx.request.title,
      status: matchCtx.request.status,
      roleNeeded: matchCtx.request.roleNeeded,
      professionalsRequired: matchCtx.request.professionalsRequired,
      filledCount: detail.filledCount,
      facilityName: matchCtx.request.facilityName,
    },
    shifts: matchCtx.shifts.map((s) => ({
      ...s,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
    })),
    activeShiftId: shiftId,
    candidates,
    assignments: assignments.map((a) => ({
      ...a,
      invitedAt: a.invitedAt?.toISOString() ?? null,
      respondedAt: a.respondedAt?.toISOString() ?? null,
      confirmedAt: a.confirmedAt?.toISOString() ?? null,
    })),
    filters,
  };

  return (
    <MatchPageClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      data={serialized}
    />
  );
}
