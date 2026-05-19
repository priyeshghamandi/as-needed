import { db } from "@/drizzle/db";
import { ShiftTable, StaffingRequestTable } from "@/drizzle/schema";
import type { FacilityContext } from "@/lib/facility/resolve-facility";
import { combineShiftDateTimes } from "@/lib/staffing-requests/shift-datetime";
import {
  facilityStaffingRequestSchema,
  type FacilityStaffingRequestInput,
} from "@/lib/validations/facility-staffing-request";

export type CreateFacilityStaffingRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; status: number; field?: string; message: string };

export async function createFacilityStaffingRequest(
  facility: FacilityContext,
  userId: string,
  input: FacilityStaffingRequestInput,
): Promise<CreateFacilityStaffingRequestResult> {
  const parsed = facilityStaffingRequestSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      status: 400,
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  const data = parsed.data;
  const { startAt, endAt } = combineShiftDateTimes(
    data.shiftDate,
    data.startTime,
    data.endTime,
  );

  const requestId = await db.transaction(async (tx) => {
    const [request] = await tx
      .insert(StaffingRequestTable)
      .values({
        agencyId: facility.agencyId,
        facilityId: facility.facilityId,
        createdByUserId: userId,
        title: data.title.trim(),
        roleNeeded: data.roleNeeded,
        specialty: data.specialty?.trim() || null,
        professionalsRequired: data.professionalsRequired,
        priority: data.priority,
        status: "open",
        source: "agency",
        assignedCoordinatorId: null,
        requiredCredentials: null,
        notes: data.notes?.trim() || null,
        facilityInstructions: data.facilityInstructions?.trim() || null,
      })
      .returning({ id: StaffingRequestTable.id });

    await tx.insert(ShiftTable).values({
      agencyId: facility.agencyId,
      staffingRequestId: request.id,
      facilityId: facility.facilityId,
      startAt,
      endAt,
      requiredCount: data.professionalsRequired,
      status: "open",
    });

    return request.id;
  });

  return { ok: true, requestId };
}
