import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FulfillmentReviewTable,
  HealthcareProfessionalTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { canAgencyReviewFulfillment } from "@/lib/fulfillment/fulfillment-status";
import { notifyCustomerAgencyConfirmed } from "@/lib/fulfillment/notify-fulfillment";
import {
  assertProfessionalInAgencySelections,
  findExistingReview,
  getAgencyRouteId,
  recomputeStaffingRequestFulfillmentStatus,
} from "@/lib/fulfillment/recompute-status";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";
import { getVisibilityBlockReason } from "@/lib/marketplace/eligibility";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";
import { fulfillmentConfirmSchema } from "@/lib/validations/fulfillment-review";

export type ConfirmFulfillmentResult =
  | { ok: true; fulfillmentStatus: StaffingRequestFulfillmentStatus | null }
  | { ok: false; status: number; message: string; code?: string };

export async function confirmAgencyFulfillment(params: {
  agencyId: string;
  userId: string;
  staffingRequestId: string;
  body: unknown;
}): Promise<ConfirmFulfillmentResult> {
  const parsed = fulfillmentConfirmSchema.safeParse(params.body);
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

  if (!request || request.source !== "marketplace_customer") {
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

  const { healthcareProfessionalId } = parsed.data;

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

  const [professional] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      isActive: HealthcareProfessionalTable.isActive,
      agencyId: HealthcareProfessionalTable.agencyId,
    })
    .from(HealthcareProfessionalTable)
    .where(eq(HealthcareProfessionalTable.id, healthcareProfessionalId))
    .limit(1);

  if (!professional || !professional.isActive || professional.agencyId !== params.agencyId) {
    return {
      ok: false,
      status: 400,
      message: "Professional is not active or not employed by your agency.",
    };
  }

  const blockReason = await getVisibilityBlockReason(healthcareProfessionalId);
  if (blockReason === "compliance_expired") {
    return {
      ok: false,
      status: 400,
      code: "compliance_blocked",
      message: "Cannot confirm — compliance block is active for this professional.",
    };
  }

  const now = new Date();
  await db.insert(FulfillmentReviewTable).values({
    staffingRequestId: params.staffingRequestId,
    staffingRequestRouteId: routeId,
    agencyId: params.agencyId,
    healthcareProfessionalId,
    decision: "confirmed",
    reviewedByUserId: params.userId,
    reviewedAt: now,
  });

  const previousStatus = fulfillmentStatus;
  const nextStatus = await recomputeStaffingRequestFulfillmentStatus(params.staffingRequestId);

  if (nextStatus === "agency_confirmed" && previousStatus !== "agency_confirmed") {
    await notifyCustomerAgencyConfirmed(params.staffingRequestId);
  }

  return { ok: true, fulfillmentStatus: nextStatus };
}
