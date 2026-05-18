import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestTable } from "@/drizzle/schema";
import {
  assertFulfillmentTransition,
  canCustomerApproveFulfillment,
} from "@/lib/fulfillment/fulfillment-status";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export type ApproveCustomerFulfillmentResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function approveCustomerFulfillment(params: {
  facilityId: string;
  staffingRequestId: string;
}): Promise<ApproveCustomerFulfillmentResult> {
  const [request] = await db
    .select({
      facilityId: StaffingRequestTable.facilityId,
      source: StaffingRequestTable.source,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  if (
    !request ||
    request.facilityId !== params.facilityId ||
    request.source !== "marketplace_customer"
  ) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  const current = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;

  if (!canCustomerApproveFulfillment(current)) {
    return {
      ok: false,
      status: 409,
      message: "Agency confirmation is required before you can approve fulfillment.",
    };
  }

  const transition = assertFulfillmentTransition(current, "customer_approved");
  if (!transition.ok) {
    return { ok: false, status: 409, message: transition.message };
  }

  const now = new Date();
  await db
    .update(StaffingRequestTable)
    .set({
      fulfillmentStatus: "customer_approved",
      customerApprovedAt: now,
      updatedAt: now,
    })
    .where(eq(StaffingRequestTable.id, params.staffingRequestId));

  return { ok: true };
}
