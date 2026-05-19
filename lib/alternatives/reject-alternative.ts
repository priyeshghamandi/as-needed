import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestTable, SuggestedAlternativeTable } from "@/drizzle/schema";
import { assertAlternativeFulfillmentTransition } from "@/lib/fulfillment/alternative-status";
import { isMarketplaceCustomerSource } from "@/lib/staffing-requests/marketplace-sources";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";
import { rejectSuggestedAlternativeSchema } from "@/lib/validations/suggested-alternative";

export type RejectAlternativeResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function rejectSuggestedAlternative(params: {
  facilityId: string;
  staffingRequestId: string;
  alternativeId: string;
  body: unknown;
}): Promise<RejectAlternativeResult> {
  const parsed = rejectSuggestedAlternativeSchema.safeParse(params.body ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

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
    !isMarketplaceCustomerSource(request.source)
  ) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  const fulfillmentStatus = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  if (fulfillmentStatus !== "alternative_proposed") {
    return {
      ok: false,
      status: 409,
      message: "No suggested alternative is awaiting your response.",
    };
  }

  const [alt] = await db
    .select({
      id: SuggestedAlternativeTable.id,
      status: SuggestedAlternativeTable.status,
    })
    .from(SuggestedAlternativeTable)
    .where(
      and(
        eq(SuggestedAlternativeTable.id, params.alternativeId),
        eq(SuggestedAlternativeTable.staffingRequestId, params.staffingRequestId),
      ),
    )
    .limit(1);

  if (!alt) {
    return { ok: false, status: 404, message: "Suggested alternative not found." };
  }

  if (alt.status !== "pending_customer") {
    return {
      ok: false,
      status: 409,
      message: "This suggested alternative is no longer available to reject.",
    };
  }

  const now = new Date();
  await db
    .update(SuggestedAlternativeTable)
    .set({
      status: "rejected",
      resolvedAt: now,
      customerRejectionReason: parsed.data.reason?.trim() || null,
    })
    .where(eq(SuggestedAlternativeTable.id, alt.id));

  const transition = assertAlternativeFulfillmentTransition(
    fulfillmentStatus,
    "customer_rejected",
  );
  if (transition.ok) {
    await db
      .update(StaffingRequestTable)
      .set({
        fulfillmentStatus: "customer_rejected",
        updatedAt: now,
      })
      .where(eq(StaffingRequestTable.id, params.staffingRequestId));
  }

  return { ok: true };
}
