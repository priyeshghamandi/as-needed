import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FulfillmentReviewTable,
  HealthcareProfessionalTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
  SuggestedAlternativeTable,
} from "@/drizzle/schema";
import {
  assertAlternativeFulfillmentTransition,
  canProposeAlternative,
  hasPendingAlternativeConstraint,
} from "@/lib/fulfillment/alternative-status";
import { getAgencyRouteId } from "@/lib/fulfillment/recompute-status";
import { notifyCustomerAlternativeProposed } from "@/lib/alternatives/notify-alternative";
import { getCustomerLocationForStaffingRequest } from "@/lib/alternatives/facility-location";
import { isGeoEligible } from "@/lib/marketplace/geo-eligibility";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";
import { parseCoordinate } from "@/lib/matching/distance";
import { AgencyTable } from "@/drizzle/schema";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";
import { createSuggestedAlternativeSchema } from "@/lib/validations/suggested-alternative";

export type CreateAlternativeResult =
  | { ok: true; alternativeId: string }
  | { ok: false; status: number; message: string; code?: string };

export async function createSuggestedAlternative(params: {
  agencyId: string;
  userId: string;
  staffingRequestId: string;
  body: unknown;
}): Promise<CreateAlternativeResult> {
  const parsed = createSuggestedAlternativeSchema.safeParse(params.body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const allowed = await hasStaffingRequestAgencyAccess(params.agencyId, params.staffingRequestId);
  if (!allowed) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  const [request] = await db
    .select({
      roleNeeded: StaffingRequestTable.roleNeeded,
      source: StaffingRequestTable.source,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  if (!request || request.source !== "marketplace_customer") {
    return { ok: false, status: 404, message: "Marketplace request not found." };
  }

  const fulfillmentStatus = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  if (!canProposeAlternative(fulfillmentStatus)) {
    return {
      ok: false,
      status: 409,
      message: "Cannot propose an alternative in the current fulfillment state.",
    };
  }

  const routeId = await getAgencyRouteId(params.staffingRequestId, params.agencyId);
  if (!routeId) {
    return { ok: false, status: 404, message: "Route not found for this agency." };
  }

  const { originalProfessionalId, suggestedProfessionalId, messageToCustomer } = parsed.data;

  const [inSelections] = await db
    .select({ id: StaffingRequestSelectionTable.id })
    .from(StaffingRequestSelectionTable)
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, params.staffingRequestId),
        eq(StaffingRequestSelectionTable.healthcareProfessionalId, originalProfessionalId),
        eq(StaffingRequestSelectionTable.agencyId, params.agencyId),
      ),
    )
    .limit(1);

  if (!inSelections) {
    return {
      ok: false,
      status: 400,
      message: "Original professional is not in this agency's customer selections.",
    };
  }

  const existingAlternatives = await db
    .select({
      originalProfessionalId: SuggestedAlternativeTable.originalProfessionalId,
      status: SuggestedAlternativeTable.status,
    })
    .from(SuggestedAlternativeTable)
    .where(eq(SuggestedAlternativeTable.staffingRequestId, params.staffingRequestId));

  if (hasPendingAlternativeConstraint(existingAlternatives, originalProfessionalId)) {
    return {
      ok: false,
      status: 409,
      code: "duplicate_pending",
      message: "A pending suggested alternative already exists for this professional.",
    };
  }

  const [suggested] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      role: HealthcareProfessionalTable.role,
      agencyId: HealthcareProfessionalTable.agencyId,
      isActive: HealthcareProfessionalTable.isActive,
      latitude: HealthcareProfessionalTable.latitude,
      longitude: HealthcareProfessionalTable.longitude,
    })
    .from(HealthcareProfessionalTable)
    .where(eq(HealthcareProfessionalTable.id, suggestedProfessionalId))
    .limit(1);

  if (!suggested || !suggested.isActive || suggested.agencyId !== params.agencyId) {
    return {
      ok: false,
      status: 400,
      message: "Suggested professional must be active and employed by your agency.",
    };
  }

  if (suggested.role !== request.roleNeeded) {
    return {
      ok: false,
      status: 400,
      message: "Suggested professional must match the requested role.",
    };
  }

  const [alreadySelected] = await db
    .select({ id: StaffingRequestSelectionTable.id })
    .from(StaffingRequestSelectionTable)
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, params.staffingRequestId),
        eq(StaffingRequestSelectionTable.healthcareProfessionalId, suggestedProfessionalId),
      ),
    )
    .limit(1);

  if (alreadySelected) {
    return {
      ok: false,
      status: 400,
      code: "already_selected",
      message: "Cannot suggest a professional already in the customer selections.",
    };
  }

  const customerLocation = await getCustomerLocationForStaffingRequest(params.staffingRequestId);
  if (!customerLocation) {
    return {
      ok: false,
      status: 400,
      message: "Facility location is required to validate alternative eligibility.",
    };
  }

  const [agency] = await db
    .select({
      lat: AgencyTable.primaryServiceAreaLat,
      lng: AgencyTable.primaryServiceAreaLng,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, params.agencyId))
    .limit(1);

  const geoOk = isGeoEligible({
    professional: {
      latitude: parseCoordinate(suggested.latitude),
      longitude: parseCoordinate(suggested.longitude),
    },
    agencyCenter: {
      latitude: parseCoordinate(agency?.lat) ?? 0,
      longitude: parseCoordinate(agency?.lng) ?? 0,
    },
    agencyRadiusMiles: 50,
    customerLocation,
  });

  if (!geoOk) {
    return {
      ok: false,
      status: 400,
      code: "ineligible_location",
      message: "Suggested professional is not eligible for this facility location.",
    };
  }

  const now = new Date();
  const [row] = await db
    .insert(SuggestedAlternativeTable)
    .values({
      staffingRequestId: params.staffingRequestId,
      staffingRequestRouteId: routeId,
      agencyId: params.agencyId,
      originalProfessionalId,
      suggestedProfessionalId,
      messageToCustomer: messageToCustomer?.trim() || null,
      status: "pending_customer",
      proposedByUserId: params.userId,
      proposedAt: now,
    })
    .returning({ id: SuggestedAlternativeTable.id });

  const transition = assertAlternativeFulfillmentTransition(
    fulfillmentStatus,
    "alternative_proposed",
  );
  if (transition.ok) {
    await db
      .update(StaffingRequestTable)
      .set({
        fulfillmentStatus: "alternative_proposed",
        updatedAt: now,
      })
      .where(eq(StaffingRequestTable.id, params.staffingRequestId));
  }

  await notifyCustomerAlternativeProposed(params.staffingRequestId);

  return { ok: true, alternativeId: row.id };
}

export async function summarizeAgencyReviewsForWithdraw(staffingRequestId: string, agencyId: string) {
  const selections = await db
    .select({ professionalId: StaffingRequestSelectionTable.healthcareProfessionalId })
    .from(StaffingRequestSelectionTable)
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestSelectionTable.agencyId, agencyId),
      ),
    );

  const reviews = await db
    .select({ decision: FulfillmentReviewTable.decision })
    .from(FulfillmentReviewTable)
    .where(
      and(
        eq(FulfillmentReviewTable.staffingRequestId, staffingRequestId),
        eq(FulfillmentReviewTable.agencyId, agencyId),
      ),
    );

  const confirmedCount = reviews.filter((r) => r.decision === "confirmed").length;
  const declinedCount = reviews.filter((r) => r.decision === "declined").length;
  const allReviewed = selections.length > 0 && reviews.length >= selections.length;
  const allDeclined = allReviewed && confirmedCount === 0 && declinedCount === selections.length;

  return {
    hasAnyConfirmedReview: confirmedCount > 0,
    allSelectionsReviewed: allReviewed,
    allDeclined,
  };
}
