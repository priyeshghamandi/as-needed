import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable, ShiftTable } from "@/drizzle/schema";
import { AUTO_CONFIRM_ON_ACCEPT } from "@/lib/assignments/config";
import {
  promoteShiftToMatching,
  syncFulfillmentForRequest,
} from "@/lib/assignments/fulfillment-sync";
import {
  canCoordinatorTransitionAssignment,
  canProviderTransitionAssignment,
} from "@/lib/assignments/status-transitions";
import { recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";
import { computeShiftFill } from "@/lib/shifts/fill-count";
import type { RespondToAssignmentInput } from "@/lib/validations/assignment";

export type AssignmentOpResult =
  | { ok: true; assignmentId: string }
  | { ok: false; status: number; message: string };

function isDuplicateShiftAssignmentError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string; cause?: unknown };
  if (record.code === "23505") return true;
  const message = record.message ?? "";
  if (/ux_shift_professional|unique/i.test(message)) return true;
  if (record.cause) return isDuplicateShiftAssignmentError(record.cause);
  return false;
}

async function getShiftForInvite(agencyId: string, shiftId: string) {
  const [shift] = await db
    .select({
      id: ShiftTable.id,
      status: ShiftTable.status,
      requiredCount: ShiftTable.requiredCount,
      staffingRequestId: ShiftTable.staffingRequestId,
    })
    .from(ShiftTable)
    .where(and(eq(ShiftTable.id, shiftId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  return shift ?? null;
}

export async function inviteProfessionalToShiftCore(
  agencyId: string,
  shiftId: string,
  professionalId: string,
  invitedByUserId: string,
): Promise<AssignmentOpResult> {
  const shift = await getShiftForInvite(agencyId, shiftId);
  if (!shift) {
    return { ok: false, status: 404, message: "Shift not found." };
  }

  if (shift.status === "cancelled" || shift.status === "completed") {
    return { ok: false, status: 409, message: "Cannot invite on a cancelled or completed shift." };
  }

  const assignments = await db
    .select({ status: ShiftAssignmentTable.status })
    .from(ShiftAssignmentTable)
    .where(eq(ShiftAssignmentTable.shiftId, shiftId));

  const fill = computeShiftFill(shift.requiredCount, assignments, shift.status);
  if (fill.filledCount >= fill.requiredCount) {
    return { ok: false, status: 409, message: "This shift is fully staffed." };
  }

  const invitedCount = assignments.filter((a) => a.status === "invited").length;
  if (fill.filledCount + invitedCount >= fill.requiredCount) {
    return { ok: false, status: 409, message: "No remaining slots for new invites." };
  }

  try {
    const [created] = await db
      .insert(ShiftAssignmentTable)
      .values({
        shiftId,
        professionalId,
        invitedByUserId,
        status: "invited",
        invitedAt: new Date(),
      })
      .returning({ id: ShiftAssignmentTable.id });

    await promoteShiftToMatching(shiftId);
    await recomputeShiftStatus(shiftId);
    await syncFulfillmentForRequest(shift.staffingRequestId);

    return { ok: true, assignmentId: created.id };
  } catch (error) {
    if (isDuplicateShiftAssignmentError(error)) {
      return {
        ok: false,
        status: 409,
        message: "This professional is already invited to this shift.",
      };
    }
    throw error;
  }
}

export async function bulkInviteProfessionalsCore(
  agencyId: string,
  shiftId: string,
  professionalIds: string[],
  invitedByUserId: string,
): Promise<{
  ok: true;
  created: string[];
  failed: { professionalId: string; message: string }[];
}> {
  const created: string[] = [];
  const failed: { professionalId: string; message: string }[] = [];

  for (const professionalId of professionalIds) {
    const result = await inviteProfessionalToShiftCore(
      agencyId,
      shiftId,
      professionalId,
      invitedByUserId,
    );
    if (result.ok) {
      created.push(result.assignmentId);
    } else {
      failed.push({ professionalId, message: result.message });
    }
  }

  return { ok: true, created, failed };
}

export async function cancelShiftAssignmentCore(
  agencyId: string,
  assignmentId: string,
  cancellationReason?: string,
): Promise<AssignmentOpResult> {
  const [row] = await db
    .select({
      id: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      shiftId: ShiftAssignmentTable.shiftId,
      staffingRequestId: ShiftTable.staffingRequestId,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(and(eq(ShiftAssignmentTable.id, assignmentId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  if (!row) {
    return { ok: false, status: 404, message: "Assignment not found." };
  }

  if (!canCoordinatorTransitionAssignment(row.status, "cancelled")) {
    return { ok: false, status: 409, message: "This assignment cannot be cancelled." };
  }

  await db
    .update(ShiftAssignmentTable)
    .set({
      status: "cancelled",
      cancellationReason: cancellationReason?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(ShiftAssignmentTable.id, assignmentId));

  await recomputeShiftStatus(row.shiftId);
  await syncFulfillmentForRequest(row.staffingRequestId);

  return { ok: true, assignmentId };
}

export async function confirmShiftAssignmentCore(
  agencyId: string,
  assignmentId: string,
): Promise<AssignmentOpResult> {
  const [row] = await db
    .select({
      id: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      shiftId: ShiftAssignmentTable.shiftId,
      staffingRequestId: ShiftTable.staffingRequestId,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(and(eq(ShiftAssignmentTable.id, assignmentId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  if (!row) {
    return { ok: false, status: 404, message: "Assignment not found." };
  }

  if (!canCoordinatorTransitionAssignment(row.status, "confirmed")) {
    return { ok: false, status: 409, message: "Only accepted assignments can be confirmed." };
  }

  await db
    .update(ShiftAssignmentTable)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(ShiftAssignmentTable.id, assignmentId));

  await recomputeShiftStatus(row.shiftId);
  await syncFulfillmentForRequest(row.staffingRequestId);

  return { ok: true, assignmentId };
}

export async function respondToShiftAssignmentCore(
  assignmentId: string,
  input: RespondToAssignmentInput,
): Promise<AssignmentOpResult> {
  if (input.status === "declined") {
    const reason = input.declineReason?.trim() ?? "";
    if (reason.length < 3) {
      return { ok: false, status: 400, message: "Decline reason must be at least 3 characters." };
    }
  }

  const [row] = await db
    .select({
      id: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      shiftId: ShiftAssignmentTable.shiftId,
      staffingRequestId: ShiftTable.staffingRequestId,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(eq(ShiftAssignmentTable.id, assignmentId))
    .limit(1);

  if (!row) {
    return { ok: false, status: 404, message: "Assignment not found." };
  }

  if (!canProviderTransitionAssignment(row.status, input.status)) {
    return { ok: false, status: 409, message: "Invalid assignment transition." };
  }

  const now = new Date();
  if (input.status === "accepted") {
    const updates: Partial<typeof ShiftAssignmentTable.$inferInsert> = {
      status: AUTO_CONFIRM_ON_ACCEPT ? "confirmed" : "accepted",
      respondedAt: now,
      updatedAt: now,
    };
    if (AUTO_CONFIRM_ON_ACCEPT) {
      updates.confirmedAt = now;
    }
    await db.update(ShiftAssignmentTable).set(updates).where(eq(ShiftAssignmentTable.id, assignmentId));
  } else {
    await db
      .update(ShiftAssignmentTable)
      .set({
        status: "declined",
        respondedAt: now,
        declineReason: input.declineReason?.trim() ?? null,
        updatedAt: now,
      })
      .where(eq(ShiftAssignmentTable.id, assignmentId));
  }

  await recomputeShiftStatus(row.shiftId);
  await syncFulfillmentForRequest(row.staffingRequestId);

  return { ok: true, assignmentId };
}
