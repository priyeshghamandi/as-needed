import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  StaffingRequestSelectionTable,
  StaffingRequestTable,
  SuggestedAlternativeTable,
} from "@/drizzle/schema";
import { assertAlternativeFulfillmentTransition } from "@/lib/fulfillment/alternative-status";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export type ApproveAlternativeResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function approveSuggestedAlternative(params: {
  facilityId: string;
  staffingRequestId: string;
  alternativeId: string;
}): Promise<ApproveAlternativeResult> {
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

  const fulfillmentStatus = request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  if (fulfillmentStatus !== "alternative_proposed") {
    return {
      ok: false,
      status: 409,
      message: "No suggested alternative is awaiting your approval.",
    };
  }

  const [alt] = await db
    .select({
      id: SuggestedAlternativeTable.id,
      status: SuggestedAlternativeTable.status,
      agencyId: SuggestedAlternativeTable.agencyId,
      suggestedProfessionalId: SuggestedAlternativeTable.suggestedProfessionalId,
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
      message: "This suggested alternative is no longer available for approval.",
    };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(SuggestedAlternativeTable)
      .set({
        status: "approved",
        resolvedAt: now,
      })
      .where(eq(SuggestedAlternativeTable.id, alt.id));

    const existingSelection = await tx
      .select({ id: StaffingRequestSelectionTable.id })
      .from(StaffingRequestSelectionTable)
      .where(
        and(
          eq(StaffingRequestSelectionTable.staffingRequestId, params.staffingRequestId),
          eq(
            StaffingRequestSelectionTable.healthcareProfessionalId,
            alt.suggestedProfessionalId,
          ),
        ),
      )
      .limit(1);

    if (existingSelection.length === 0) {
      const maxOrder = await tx
        .select({ sortOrder: StaffingRequestSelectionTable.sortOrder })
        .from(StaffingRequestSelectionTable)
        .where(eq(StaffingRequestSelectionTable.staffingRequestId, params.staffingRequestId));

      const nextOrder =
        maxOrder.length > 0 ? Math.max(...maxOrder.map((r) => r.sortOrder)) + 1 : 0;

      await tx.insert(StaffingRequestSelectionTable).values({
        staffingRequestId: params.staffingRequestId,
        healthcareProfessionalId: alt.suggestedProfessionalId,
        agencyId: alt.agencyId,
        selectionType: "suggested_alternative",
        sortOrder: nextOrder,
      });
    } else {
      await tx
        .update(StaffingRequestSelectionTable)
        .set({ selectionType: "suggested_alternative" })
        .where(eq(StaffingRequestSelectionTable.id, existingSelection[0]!.id));
    }

    const transition = assertAlternativeFulfillmentTransition(
      fulfillmentStatus,
      "customer_approved",
    );
    if (transition.ok) {
      await tx
        .update(StaffingRequestTable)
        .set({
          fulfillmentStatus: "customer_approved",
          customerApprovedAt: now,
          updatedAt: now,
        })
        .where(eq(StaffingRequestTable.id, params.staffingRequestId));
    }
  });

  return { ok: true };
}
