import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestTable, SuggestedAlternativeTable } from "@/drizzle/schema";
import {
  assertAlternativeFulfillmentTransition,
  fulfillmentStatusAfterWithdrawAlternative,
} from "@/lib/fulfillment/alternative-status";
import { summarizeAgencyReviewsForWithdraw } from "@/lib/alternatives/create-alternative";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export type WithdrawAlternativeResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function withdrawSuggestedAlternative(params: {
  agencyId: string;
  staffingRequestId: string;
  alternativeId: string;
}): Promise<WithdrawAlternativeResult> {
  const allowed = await hasStaffingRequestAgencyAccess(params.agencyId, params.staffingRequestId);
  if (!allowed) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  const [alt] = await db
    .select({
      id: SuggestedAlternativeTable.id,
      status: SuggestedAlternativeTable.status,
      agencyId: SuggestedAlternativeTable.agencyId,
    })
    .from(SuggestedAlternativeTable)
    .where(
      and(
        eq(SuggestedAlternativeTable.id, params.alternativeId),
        eq(SuggestedAlternativeTable.staffingRequestId, params.staffingRequestId),
      ),
    )
    .limit(1);

  if (!alt || alt.agencyId !== params.agencyId) {
    return { ok: false, status: 404, message: "Suggested alternative not found." };
  }

  if (alt.status !== "pending_customer") {
    return {
      ok: false,
      status: 409,
      message: "Only pending suggested alternatives can be withdrawn.",
    };
  }

  const now = new Date();
  await db
    .update(SuggestedAlternativeTable)
    .set({
      status: "withdrawn",
      resolvedAt: now,
    })
    .where(eq(SuggestedAlternativeTable.id, alt.id));

  const [request] = await db
    .select({ fulfillmentStatus: StaffingRequestTable.fulfillmentStatus })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  const current = request?.fulfillmentStatus as StaffingRequestFulfillmentStatus | null;
  if (current === "alternative_proposed") {
    const summary = await summarizeAgencyReviewsForWithdraw(
      params.staffingRequestId,
      params.agencyId,
    );
    const next = fulfillmentStatusAfterWithdrawAlternative(summary);
    const transition = assertAlternativeFulfillmentTransition(current, next);
    if (transition.ok) {
      await db
        .update(StaffingRequestTable)
        .set({ fulfillmentStatus: next, updatedAt: now })
        .where(eq(StaffingRequestTable.id, params.staffingRequestId));
    }
  }

  return { ok: true };
}
