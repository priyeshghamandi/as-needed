import { and, asc, eq, inArray, not, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";
import { shouldMarkRequestAtRisk } from "@/lib/assignments/at-risk";
import { computeFulfillment } from "@/lib/staffing-requests/fulfillment";
import { recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";

const TERMINAL_SHIFT_STATUSES = ["completed", "cancelled"] as const;
const TERMINAL_REQUEST_STATUSES = ["cancelled", "draft", "completed"] as const;

export async function syncFulfillmentForRequest(staffingRequestId: string): Promise<void> {
  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      status: StaffingRequestTable.status,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, staffingRequestId))
    .limit(1);

  if (!request || TERMINAL_REQUEST_STATUSES.includes(request.status as "cancelled")) {
    return;
  }

  const shifts = await db
    .select({
      id: ShiftTable.id,
      startAt: ShiftTable.startAt,
      status: ShiftTable.status,
    })
    .from(ShiftTable)
    .where(
      and(
        eq(ShiftTable.staffingRequestId, staffingRequestId),
        not(inArray(ShiftTable.status, [...TERMINAL_SHIFT_STATUSES])),
      ),
    )
    .orderBy(asc(ShiftTable.startAt));

  for (const shift of shifts) {
    await recomputeShiftStatus(shift.id);
  }

  const [filledRow] = await db
    .select({
      filled: sql<number>`count(distinct ${ShiftAssignmentTable.professionalId})::int`,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(
      and(
        eq(ShiftTable.staffingRequestId, staffingRequestId),
        inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
      ),
    );

  const filledCount = filledRow?.filled ?? 0;
  const fulfillment = computeFulfillment(request.professionalsRequired, filledCount);

  const earliestStart = shifts[0]?.startAt ?? null;
  const in24h = shouldMarkRequestAtRisk(
    filledCount,
    request.professionalsRequired,
    earliestStart,
  );

  let nextStatus = request.status;

  if (fulfillment.suggestedStatus === "confirmed") {
    nextStatus = "confirmed";
  } else if (fulfillment.suggestedStatus === "partially_filled") {
    nextStatus = "partially_filled";
  } else if (in24h && filledCount < request.professionalsRequired) {
    nextStatus = "at_risk";
  } else if (request.status === "open" && filledCount === 0) {
    const hasInvites = await db
      .select({ id: ShiftAssignmentTable.id })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          eq(ShiftTable.staffingRequestId, staffingRequestId),
          inArray(ShiftAssignmentTable.status, ["invited", "accepted"]),
        ),
      )
      .limit(1);
    nextStatus = hasInvites.length > 0 ? "matching" : "open";
  } else if (filledCount === 0 && ["matching", "partially_filled"].includes(request.status)) {
    nextStatus = in24h ? "at_risk" : "matching";
  }

  if (nextStatus !== request.status) {
    await db
      .update(StaffingRequestTable)
      .set({
        status: nextStatus as (typeof StaffingRequestTable.$inferInsert)["status"],
        updatedAt: new Date(),
      })
      .where(eq(StaffingRequestTable.id, staffingRequestId));
  }
}

export async function promoteShiftToMatching(shiftId: string): Promise<void> {
  const [shift] = await db
    .select({ id: ShiftTable.id, status: ShiftTable.status, staffingRequestId: ShiftTable.staffingRequestId })
    .from(ShiftTable)
    .where(eq(ShiftTable.id, shiftId))
    .limit(1);

  if (!shift || shift.status === "cancelled" || shift.status === "completed") return;

  if (shift.status === "open") {
    await db
      .update(ShiftTable)
      .set({ status: "matching", updatedAt: new Date() })
      .where(eq(ShiftTable.id, shiftId));
  }

  const [request] = await db
    .select({ status: StaffingRequestTable.status })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, shift.staffingRequestId))
    .limit(1);

  if (request?.status === "open") {
    await db
      .update(StaffingRequestTable)
      .set({ status: "matching", updatedAt: new Date() })
      .where(eq(StaffingRequestTable.id, shift.staffingRequestId));
  }
}
