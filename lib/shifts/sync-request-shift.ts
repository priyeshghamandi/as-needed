import { and, asc, eq, inArray, not } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { computeShiftFill } from "@/lib/shifts/fill-count";
import { computeFulfillment } from "@/lib/staffing-requests/fulfillment";

const TERMINAL_SHIFT_STATUSES = ["completed", "cancelled"] as const;

export async function syncPrimaryShiftRequiredCount(
  agencyId: string,
  staffingRequestId: string,
  professionalsRequired: number,
): Promise<void> {
  const shifts = await db
    .select({ id: ShiftTable.id })
    .from(ShiftTable)
    .where(
      and(
        eq(ShiftTable.agencyId, agencyId),
        eq(ShiftTable.staffingRequestId, staffingRequestId),
      ),
    )
    .orderBy(asc(ShiftTable.createdAt))
    .limit(1);

  const primary = shifts[0];
  if (!primary) return;

  await db
    .update(ShiftTable)
    .set({ requiredCount: professionalsRequired, updatedAt: new Date() })
    .where(eq(ShiftTable.id, primary.id));
}

export async function recomputeShiftStatus(shiftId: string): Promise<void> {
  const [shift] = await db
    .select({
      id: ShiftTable.id,
      status: ShiftTable.status,
      requiredCount: ShiftTable.requiredCount,
      staffingRequestId: ShiftTable.staffingRequestId,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
    })
    .from(ShiftTable)
    .where(eq(ShiftTable.id, shiftId))
    .limit(1);

  if (!shift || TERMINAL_SHIFT_STATUSES.includes(shift.status as "completed" | "cancelled")) {
    return;
  }

  const assignments = await db
    .select({ status: ShiftAssignmentTable.status })
    .from(ShiftAssignmentTable)
    .where(eq(ShiftAssignmentTable.shiftId, shiftId));

  const fill = computeShiftFill(shift.requiredCount, assignments, shift.status);
  let nextStatus: string = fill.suggestedStatus;

  const now = new Date();
  if (now >= shift.startAt && now <= shift.endAt && nextStatus === "confirmed") {
    nextStatus = "active";
  } else if (now > shift.endAt && (nextStatus === "confirmed" || nextStatus === "active")) {
    nextStatus = "completed";
  }

  if (nextStatus !== shift.status) {
    await db
      .update(ShiftTable)
      .set({
        status: nextStatus as (typeof ShiftTable.$inferInsert)["status"],
        updatedAt: new Date(),
      })
      .where(eq(ShiftTable.id, shiftId));
  }

  await syncStaffingRequestFromShifts(shift.staffingRequestId);
}

async function syncStaffingRequestFromShifts(staffingRequestId: string): Promise<void> {
  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      status: StaffingRequestTable.status,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, staffingRequestId))
    .limit(1);

  if (!request || request.status === "cancelled" || request.status === "draft") return;

  const shifts = await db
    .select({ id: ShiftTable.id, requiredCount: ShiftTable.requiredCount })
    .from(ShiftTable)
    .where(
      and(
        eq(ShiftTable.staffingRequestId, staffingRequestId),
        not(inArray(ShiftTable.status, [...TERMINAL_SHIFT_STATUSES])),
      ),
    );

  if (shifts.length === 0) return;

  let totalFilled = 0;
  for (const shift of shifts) {
    const assignments = await db
      .select({ status: ShiftAssignmentTable.status })
      .from(ShiftAssignmentTable)
      .where(eq(ShiftAssignmentTable.shiftId, shift.id));
    totalFilled += computeShiftFill(shift.requiredCount, assignments, "open").filledCount;
  }

  const fulfillment = computeFulfillment(
    request.professionalsRequired,
    Math.min(totalFilled, request.professionalsRequired),
  );

  const requestStatusMap: Record<string, string> = {
    open: "open",
    partially_filled: "partially_filled",
    confirmed: "confirmed",
  };

  const nextRequestStatus = requestStatusMap[fulfillment.suggestedStatus];
  if (nextRequestStatus && nextRequestStatus !== request.status) {
    await db
      .update(StaffingRequestTable)
      .set({
        status: nextRequestStatus as (typeof StaffingRequestTable.$inferInsert)["status"],
        updatedAt: new Date(),
      })
      .where(eq(StaffingRequestTable.id, staffingRequestId));
  }
}

export async function maybePromoteShiftTimeStatus(shift: {
  id: string;
  status: string;
  startAt: Date;
  endAt: Date;
}): Promise<string> {
  if (shift.status === "cancelled" || shift.status === "completed") return shift.status;

  const now = new Date();
  let next = shift.status;

  if (
    now >= shift.startAt &&
    now <= shift.endAt &&
    (shift.status === "confirmed" || shift.status === "partially_filled")
  ) {
    next = "active";
  } else if (now > shift.endAt && (shift.status === "confirmed" || shift.status === "active")) {
    next = "completed";
  }

  if (next !== shift.status) {
    await db
      .update(ShiftTable)
      .set({
        status: next as (typeof ShiftTable.$inferInsert)["status"],
        updatedAt: new Date(),
      })
      .where(eq(ShiftTable.id, shift.id));
  }

  return next;
}
