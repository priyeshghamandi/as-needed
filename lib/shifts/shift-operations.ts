import { and, eq, inArray, not } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable, ShiftTable, StaffingRequestTable } from "@/drizzle/schema";
import { combineShiftDateTimes } from "@/lib/staffing-requests/shift-datetime";
import { assertShiftTransitionAllowed } from "@/lib/shifts/status-transitions";
import {
  createSecondaryShiftSchema,
  updateShiftSchema,
  type CreateSecondaryShiftInput,
  type UpdateShiftInput,
} from "@/lib/validations/shift";
import { recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";

export type ShiftOpResult =
  | { ok: true; shiftId: string }
  | { ok: false; status: number; field?: string; message: string };

export async function updateShiftCore(
  agencyId: string,
  shiftId: string,
  input: UpdateShiftInput,
): Promise<ShiftOpResult> {
  const parsed = updateShiftSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      status: 400,
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  const [existing] = await db
    .select({
      id: ShiftTable.id,
      status: ShiftTable.status,
      startAt: ShiftTable.startAt,
    })
    .from(ShiftTable)
    .where(and(eq(ShiftTable.id, shiftId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Shift not found." };
  }

  if (existing.status === "cancelled" || existing.status === "completed") {
    return { ok: false, status: 409, message: "This shift cannot be edited." };
  }

  const now = new Date();
  if (now >= existing.startAt && existing.status === "active") {
    return { ok: false, status: 409, message: "Cannot edit a shift that is in progress." };
  }

  const updates: Partial<typeof ShiftTable.$inferInsert> = {
    startAt: parsed.data.startAt,
    endAt: parsed.data.endAt,
    shiftType: parsed.data.shiftType || null,
    breakMinutes: parsed.data.breakMinutes ?? 0,
    updatedAt: new Date(),
  };
  if (parsed.data.requiredCount != null) {
    updates.requiredCount = parsed.data.requiredCount;
  }

  await db.update(ShiftTable).set(updates).where(eq(ShiftTable.id, shiftId));

  await recomputeShiftStatus(shiftId);

  return { ok: true, shiftId };
}

export async function cancelShiftCore(agencyId: string, shiftId: string): Promise<ShiftOpResult> {
  const [existing] = await db
    .select({ id: ShiftTable.id, status: ShiftTable.status })
    .from(ShiftTable)
    .where(and(eq(ShiftTable.id, shiftId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Shift not found." };
  }

  if (existing.status === "cancelled" || existing.status === "completed") {
    return { ok: false, status: 409, message: "Shift cannot be cancelled." };
  }

  try {
    assertShiftTransitionAllowed(existing.status, "cancelled");
  } catch (error) {
    return {
      ok: false,
      status: 409,
      message: error instanceof Error ? error.message : "Invalid transition.",
    };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(ShiftTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(ShiftTable.id, shiftId));

    await tx
      .update(ShiftAssignmentTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(ShiftAssignmentTable.shiftId, shiftId),
          not(inArray(ShiftAssignmentTable.status, ["completed", "cancelled"])),
        ),
      );
  });

  return { ok: true, shiftId };
}

export async function createSecondaryShiftCore(
  agencyId: string,
  input: CreateSecondaryShiftInput,
): Promise<ShiftOpResult> {
  const parsed = createSecondaryShiftSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      status: 400,
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  const [request] = await db
    .select({ id: StaffingRequestTable.id, facilityId: StaffingRequestTable.facilityId })
    .from(StaffingRequestTable)
    .where(
      and(
        eq(StaffingRequestTable.id, parsed.data.staffingRequestId),
        eq(StaffingRequestTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  if (!request) {
    return { ok: false, status: 404, message: "Staffing request not found." };
  }

  if (request.facilityId !== parsed.data.facilityId) {
    return { ok: false, status: 400, field: "facilityId", message: "Facility mismatch." };
  }

  const { startAt, endAt } = combineShiftDateTimes(
    parsed.data.shiftDate,
    parsed.data.startTime,
    parsed.data.endTime,
  );

  const [shift] = await db
    .insert(ShiftTable)
    .values({
      agencyId,
      staffingRequestId: parsed.data.staffingRequestId,
      facilityId: parsed.data.facilityId,
      startAt,
      endAt,
      shiftType: parsed.data.shiftType || null,
      breakMinutes: parsed.data.breakMinutes ?? 0,
      requiredCount: parsed.data.requiredCount,
      status: "open",
    })
    .returning({ id: ShiftTable.id });

  return { ok: true, shiftId: shift.id };
}
