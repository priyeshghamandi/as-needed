import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftTable, StaffingRequestTable } from "@/drizzle/schema";
import {
  appendMinExperienceToNotes,
  formatFacilityInstructions,
} from "@/lib/staffing-requests/format-notes";
import { combineShiftDateTimes } from "@/lib/staffing-requests/shift-datetime";
import {
  staffingRequestCreateSchema,
  type StaffingRequestCreateInput,
} from "@/lib/validations/staffing-request";

export type PublishDraftResult =
  | { ok: true; requestId: string }
  | { ok: false; status: number; field?: string; message: string };

export async function publishStaffingRequestDraftCore(
  agencyId: string,
  requestId: string,
  input: StaffingRequestCreateInput,
): Promise<PublishDraftResult> {
  const parsed = staffingRequestCreateSchema.safeParse(input);
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
      id: StaffingRequestTable.id,
      status: StaffingRequestTable.status,
      facilityId: StaffingRequestTable.facilityId,
    })
    .from(StaffingRequestTable)
    .where(and(eq(StaffingRequestTable.id, requestId), eq(StaffingRequestTable.agencyId, agencyId)))
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Request not found." };
  }
  if (existing.status !== "draft") {
    return { ok: false, status: 409, message: "Only draft requests can be published." };
  }
  if (existing.facilityId !== parsed.data.facilityId) {
    return { ok: false, status: 400, field: "facilityId", message: "Facility mismatch." };
  }

  const facilityInstructions = formatFacilityInstructions(
    parsed.data.facilityUnit,
    parsed.data.facilityInstructions,
  );
  const notes = appendMinExperienceToNotes(parsed.data.notes, parsed.data.minYearsExperience);
  const { startAt, endAt } = combineShiftDateTimes(
    parsed.data.shiftDate,
    parsed.data.startTime,
    parsed.data.endTime,
  );

  const coordinatorId =
    parsed.data.assignedCoordinatorId && parsed.data.assignedCoordinatorId !== ""
      ? parsed.data.assignedCoordinatorId
      : null;

  await db.transaction(async (tx) => {
    await tx
      .update(StaffingRequestTable)
      .set({
        title: parsed.data.title.trim(),
        roleNeeded: parsed.data.roleNeeded,
        specialty: parsed.data.specialty?.trim() || null,
        professionalsRequired: parsed.data.professionalsRequired,
        priority: parsed.data.priority,
        requiredCredentials: parsed.data.requiredCredentials?.length
          ? parsed.data.requiredCredentials
          : null,
        notes,
        facilityInstructions,
        assignedCoordinatorId: coordinatorId,
        status: "open",
        updatedAt: new Date(),
      })
      .where(eq(StaffingRequestTable.id, requestId));

    const shifts = await tx
      .select({ id: ShiftTable.id })
      .from(ShiftTable)
      .where(eq(ShiftTable.staffingRequestId, requestId))
      .limit(1);

    if (shifts.length === 0) {
      await tx.insert(ShiftTable).values({
        agencyId,
        staffingRequestId: requestId,
        facilityId: parsed.data.facilityId,
        startAt,
        endAt,
        shiftType: parsed.data.shiftType || null,
        requiredCount: parsed.data.professionalsRequired,
        status: "open",
      });
    }
  });

  return { ok: true, requestId };
}
