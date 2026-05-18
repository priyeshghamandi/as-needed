import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FulfillmentReviewTable,
  StaffingRequestRouteTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import {
  assertFulfillmentTransition,
  deriveFulfillmentStatusFromAgencyReviews,
  type AgencyFulfillmentAggregate,
} from "@/lib/fulfillment/fulfillment-status";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export async function recomputeStaffingRequestFulfillmentStatus(
  staffingRequestId: string,
): Promise<StaffingRequestFulfillmentStatus | null> {
  const [request] = await db
    .select({
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, staffingRequestId))
    .limit(1);

  if (!request) return null;

  const current = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;

  const routes = await db
    .select({ agencyId: StaffingRequestRouteTable.agencyId })
    .from(StaffingRequestRouteTable)
    .where(eq(StaffingRequestRouteTable.staffingRequestId, staffingRequestId));

  const agencyIds = [...new Set(routes.map((r) => r.agencyId))];
  if (agencyIds.length === 0) return current;

  const selections = await db
    .select({
      agencyId: StaffingRequestSelectionTable.agencyId,
      professionalId: StaffingRequestSelectionTable.healthcareProfessionalId,
    })
    .from(StaffingRequestSelectionTable)
    .where(eq(StaffingRequestSelectionTable.staffingRequestId, staffingRequestId));

  const reviews = await db
    .select({
      agencyId: FulfillmentReviewTable.agencyId,
      professionalId: FulfillmentReviewTable.healthcareProfessionalId,
      decision: FulfillmentReviewTable.decision,
    })
    .from(FulfillmentReviewTable)
    .where(eq(FulfillmentReviewTable.staffingRequestId, staffingRequestId));

  const aggregates: AgencyFulfillmentAggregate[] = agencyIds.map((agencyId) => {
    const agencySelections = selections.filter((s) => s.agencyId === agencyId);
    const agencyReviews = reviews.filter((r) => r.agencyId === agencyId);
    const confirmedCount = agencyReviews.filter((r) => r.decision === "confirmed").length;
    const declinedCount = agencyReviews.filter((r) => r.decision === "declined").length;
    const reviewedIds = new Set(
      agencyReviews.map((r) => r.professionalId).filter(Boolean) as string[],
    );
    const pendingCount = agencySelections.filter(
      (s) => !reviewedIds.has(s.professionalId),
    ).length;

    return {
      selectionCount: agencySelections.length,
      reviewedCount: agencyReviews.length,
      confirmedCount,
      declinedCount,
      pendingCount,
    };
  }).filter((a) => a.selectionCount > 0);

  const next = deriveFulfillmentStatusFromAgencyReviews(aggregates, current);
  if (!next || next === current) return current;

  const transition = assertFulfillmentTransition(current, next);
  if (!transition.ok) return current;

  const now = new Date();
  await db
    .update(StaffingRequestTable)
    .set({
      fulfillmentStatus: next,
      updatedAt: now,
    })
    .where(eq(StaffingRequestTable.id, staffingRequestId));

  return next;
}

export async function getAgencyRouteId(
  staffingRequestId: string,
  agencyId: string,
): Promise<string | null> {
  const [route] = await db
    .select({ id: StaffingRequestRouteTable.id })
    .from(StaffingRequestRouteTable)
    .where(
      and(
        eq(StaffingRequestRouteTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestRouteTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  return route?.id ?? null;
}

export async function findExistingReview(
  staffingRequestId: string,
  agencyId: string,
  healthcareProfessionalId: string,
) {
  const [row] = await db
    .select({ id: FulfillmentReviewTable.id, decision: FulfillmentReviewTable.decision })
    .from(FulfillmentReviewTable)
    .where(
      and(
        eq(FulfillmentReviewTable.staffingRequestId, staffingRequestId),
        eq(FulfillmentReviewTable.agencyId, agencyId),
        eq(FulfillmentReviewTable.healthcareProfessionalId, healthcareProfessionalId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function assertProfessionalInAgencySelections(
  staffingRequestId: string,
  agencyId: string,
  healthcareProfessionalId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: StaffingRequestSelectionTable.id })
    .from(StaffingRequestSelectionTable)
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestSelectionTable.agencyId, agencyId),
        eq(StaffingRequestSelectionTable.healthcareProfessionalId, healthcareProfessionalId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function listRoutedAgencyIds(staffingRequestId: string): Promise<string[]> {
  const rows = await db
    .select({ agencyId: StaffingRequestRouteTable.agencyId })
    .from(StaffingRequestRouteTable)
    .where(eq(StaffingRequestRouteTable.staffingRequestId, staffingRequestId));

  return [...new Set(rows.map((r) => r.agencyId))];
}

export async function getMarketplaceRequestFacilityId(
  staffingRequestId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ facilityId: StaffingRequestTable.facilityId })
    .from(StaffingRequestTable)
    .where(
      and(
        eq(StaffingRequestTable.id, staffingRequestId),
        eq(StaffingRequestTable.source, "marketplace_customer"),
      ),
    )
    .limit(1);

  return row?.facilityId ?? null;
}

export async function getRequestCreatorUserId(
  staffingRequestId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ createdByUserId: StaffingRequestTable.createdByUserId })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, staffingRequestId))
    .limit(1);

  return row?.createdByUserId ?? null;
}
