import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable } from "@/drizzle/schema";
import type { AssignmentOpResult } from "@/lib/assignments/assignment-operations";
import { respondToShiftAssignmentCore } from "@/lib/assignments/assignment-operations";
import {
  canProviderDeclineAssignment,
  isAssignmentDeclineIdempotent,
} from "@/lib/provider/assignment-transitions";
import {
  formatDeclineReason,
  type DeclineShiftAssignmentInput,
} from "@/lib/validations/provider-assignment";

export async function declineShiftAssignmentForProvider(
  assignmentId: string,
  professionalId: string,
  input: DeclineShiftAssignmentInput,
): Promise<AssignmentOpResult> {
  const [row] = await db
    .select({
      id: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
    })
    .from(ShiftAssignmentTable)
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

  if (isAssignmentDeclineIdempotent(row.status)) {
    return { ok: false, status: 409, message: "Assignment is already declined." };
  }

  if (!canProviderDeclineAssignment(row.status)) {
    return { ok: false, status: 409, message: "Invalid assignment transition." };
  }

  return respondToShiftAssignmentCore(assignmentId, {
    status: "declined",
    declineReason: formatDeclineReason(input),
  });
}
