import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable, ShiftTable } from "@/drizzle/schema";
import { shiftsOverlap } from "@/lib/provider/shift-overlap";

const BLOCKING_STATUSES = ["accepted", "confirmed", "checked_in"] as const;

export async function hasConflictingAssignment(
  professionalId: string,
  startAt: Date,
  endAt: Date,
  excludeAssignmentId?: string,
): Promise<boolean> {
  const rows = await db
    .select({
      assignmentId: ShiftAssignmentTable.id,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(
      and(
        eq(ShiftAssignmentTable.professionalId, professionalId),
        inArray(ShiftAssignmentTable.status, [...BLOCKING_STATUSES]),
        excludeAssignmentId
          ? ne(ShiftAssignmentTable.id, excludeAssignmentId)
          : undefined,
      ),
    );

  return rows.some((row) =>
    shiftsOverlap(startAt, endAt, row.startAt, row.endAt),
  );
}
