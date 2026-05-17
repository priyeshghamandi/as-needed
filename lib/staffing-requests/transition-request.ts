import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftTable, StaffingRequestTable } from "@/drizzle/schema";
import { assertTransitionAllowed } from "@/lib/staffing-requests/status-transitions";

export type TransitionResult =
  | { ok: true; requestId: string; status: string }
  | { ok: false; status: number; message: string };

export async function transitionStaffingRequestCore(
  agencyId: string,
  requestId: string,
  toStatus: string,
): Promise<TransitionResult> {
  const [existing] = await db
    .select({
      id: StaffingRequestTable.id,
      status: StaffingRequestTable.status,
    })
    .from(StaffingRequestTable)
    .where(and(eq(StaffingRequestTable.id, requestId), eq(StaffingRequestTable.agencyId, agencyId)))
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Request not found." };
  }

  try {
    assertTransitionAllowed(existing.status, toStatus);
  } catch (error) {
    return {
      ok: false,
      status: 409,
      message: error instanceof Error ? error.message : "Invalid status transition.",
    };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(StaffingRequestTable)
      .set({ status: toStatus as (typeof StaffingRequestTable.$inferInsert)["status"], updatedAt: new Date() })
      .where(eq(StaffingRequestTable.id, requestId));

    if (toStatus === "cancelled") {
      await tx
        .update(ShiftTable)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(ShiftTable.staffingRequestId, requestId));
    }
  });

  return { ok: true, requestId, status: toStatus };
}
