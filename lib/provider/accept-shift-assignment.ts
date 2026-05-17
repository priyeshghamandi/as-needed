import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable, ShiftTable } from "@/drizzle/schema";
import type { AssignmentOpResult } from "@/lib/assignments/assignment-operations";
import { respondToShiftAssignmentCore } from "@/lib/assignments/assignment-operations";
import {
  canProviderAcceptAssignment,
  isAssignmentResponseIdempotent,
} from "@/lib/provider/assignment-transitions";
import { hasConflictingAssignment } from "@/lib/provider/conflicting-assignments";

export async function acceptShiftAssignmentForProvider(
  assignmentId: string,
  professionalId: string,
): Promise<AssignmentOpResult> {
  const [row] = await db
    .select({
      id: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      professionalId: ShiftAssignmentTable.professionalId,
      shiftStatus: ShiftTable.status,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(
      and(
        eq(ShiftAssignmentTable.id, assignmentId),
        eq(ShiftAssignmentTable.professionalId, professionalId),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false, status: 404, message: "Assignment not found." };
  }

  if (isAssignmentResponseIdempotent(row.status)) {
    return { ok: true, assignmentId: row.id };
  }

  if (!canProviderAcceptAssignment(row.status)) {
    return { ok: false, status: 409, message: "Invalid assignment transition." };
  }

  if (row.shiftStatus === "cancelled") {
    return { ok: false, status: 409, message: "Cannot accept a cancelled shift." };
  }

  if (row.startAt.getTime() <= Date.now()) {
    return { ok: false, status: 409, message: "This invite has expired." };
  }

  const conflict = await hasConflictingAssignment(
    professionalId,
    row.startAt,
    row.endAt,
    assignmentId,
  );
  if (conflict) {
    return {
      ok: false,
      status: 409,
      message: "This shift overlaps another confirmed assignment.",
    };
  }

  return respondToShiftAssignmentCore(assignmentId, { status: "accepted" });
}
