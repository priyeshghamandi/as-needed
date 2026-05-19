import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { FulfillmentReviewTable, StaffingRequestTable } from "@/drizzle/schema";
import { canAgencyReviewFulfillment } from "@/lib/fulfillment/fulfillment-status";
import { isMarketplaceCustomerSource } from "@/lib/staffing-requests/marketplace-sources";
import { notifyCustomerAgencyDeclined } from "@/lib/fulfillment/notify-fulfillment";
import {
  assertProfessionalInAgencySelections,
  findExistingReview,
  getAgencyRouteId,
  recomputeStaffingRequestFulfillmentStatus,
} from "@/lib/fulfillment/recompute-status";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";
import { fulfillmentDeclineSchema } from "@/lib/validations/fulfillment-review";

export type DeclineFulfillmentResult =
  | { ok: true; fulfillmentStatus: StaffingRequestFulfillmentStatus | null }
  | { ok: false; status: number; message: string; code?: string };

export async function declineAgencyFulfillment(params: {
  agencyId: string;
  userId: string;
  staffingRequestId: string;
  body: unknown;
}): Promise<DeclineFulfillmentResult> {
  const parsed = fulfillmentDeclineSchema.safeParse(params.body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const allowed = await hasStaffingRequestAgencyAccess(
    params.agencyId,
    params.staffingRequestId,
  );
  if (!allowed) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  const [request] = await db
    .select({
      source: StaffingRequestTable.source,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  if (!request || !isMarketplaceCustomerSource(request.source)) {
    return { ok: false, status: 404, message: "Marketplace request not found." };
  }

  const fulfillmentStatus = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  if (!canAgencyReviewFulfillment(fulfillmentStatus)) {
    return {
      ok: false,
      status: 409,
      message: "This request is no longer awaiting agency fulfillment review.",
    };
  }

  const routeId = await getAgencyRouteId(params.staffingRequestId, params.agencyId);
  if (!routeId) {
    return { ok: false, status: 404, message: "Route not found for this agency." };
  }

  const { healthcareProfessionalId, declineReason, declineNotes } = parsed.data;

  const inSelections = await assertProfessionalInAgencySelections(
    params.staffingRequestId,
    params.agencyId,
    healthcareProfessionalId,
  );
  if (!inSelections) {
    return {
      ok: false,
      status: 400,
      code: "invalid_selection",
      message: "Professional is not in this agency's customer selections.",
    };
  }

  const existing = await findExistingReview(
    params.staffingRequestId,
    params.agencyId,
    healthcareProfessionalId,
  );
  if (existing) {
    return {
      ok: false,
      status: 409,
      message: "This professional has already been reviewed.",
    };
  }

  const now = new Date();
  await db.insert(FulfillmentReviewTable).values({
    staffingRequestId: params.staffingRequestId,
    staffingRequestRouteId: routeId,
    agencyId: params.agencyId,
    healthcareProfessionalId,
    decision: "declined",
    declineReason,
    declineNotes: declineNotes?.trim() || null,
    reviewedByUserId: params.userId,
    reviewedAt: now,
  });

  const previousStatus = fulfillmentStatus;
  const nextStatus = await recomputeStaffingRequestFulfillmentStatus(params.staffingRequestId);

  if (nextStatus === "agency_declined" && previousStatus !== "agency_declined") {
    await notifyCustomerAgencyDeclined(params.staffingRequestId);
  }

  return { ok: true, fulfillmentStatus: nextStatus };
}
