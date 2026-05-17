import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FacilityTable,
  ShiftTable,
  StaffingRequestTable,
  UserRoleTable,
} from "@/drizzle/schema";
import {
  appendMinExperienceToNotes,
  formatFacilityInstructions,
} from "@/lib/staffing-requests/format-notes";
import { combineShiftDateTimes } from "@/lib/staffing-requests/shift-datetime";
import {
  staffingRequestCreateSchema,
  staffingRequestDraftSchema,
  type StaffingRequestCreateInput,
  type StaffingRequestDraftInput,
  type StaffingRequestFormInput,
} from "@/lib/validations/staffing-request";

export type CreateStaffingRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; status: number; field?: string; message: string };

const COORDINATOR_ROLES = ["agency_owner", "agency_admin", "staffing_coordinator"] as const;

async function assertFacilityInAgency(agencyId: string, facilityId: string) {
  const [facility] = await db
    .select({ id: FacilityTable.id })
    .from(FacilityTable)
    .where(and(eq(FacilityTable.id, facilityId), eq(FacilityTable.agencyId, agencyId)))
    .limit(1);
  return Boolean(facility);
}

async function assertCoordinatorInAgency(agencyId: string, coordinatorId: string) {
  const [row] = await db
    .select({ userId: UserRoleTable.userId })
    .from(UserRoleTable)
    .where(
      and(
        eq(UserRoleTable.userId, coordinatorId),
        eq(UserRoleTable.agencyId, agencyId),
        inArray(UserRoleTable.role, [...COORDINATOR_ROLES]),
      ),
    )
    .limit(1);
  return Boolean(row);
}

function mapRequestValues(
  data: StaffingRequestCreateInput | StaffingRequestDraftInput,
  status: "draft" | "open",
) {
  const facilityInstructions = formatFacilityInstructions(
    "facilityUnit" in data ? data.facilityUnit : undefined,
    "facilityInstructions" in data ? data.facilityInstructions : undefined,
  );
  const notes =
    "minYearsExperience" in data
      ? appendMinExperienceToNotes(data.notes, data.minYearsExperience)
      : data.notes?.trim() || null;

  return {
    facilityId: data.facilityId,
    title: data.title.trim(),
    roleNeeded: ("roleNeeded" in data && data.roleNeeded) || "rn",
    specialty: data.specialty?.trim() || null,
    professionalsRequired:
      ("professionalsRequired" in data && data.professionalsRequired) || 1,
    priority: ("priority" in data && data.priority) || "normal",
    status,
    requiredCredentials:
      "requiredCredentials" in data && data.requiredCredentials?.length
        ? data.requiredCredentials
        : null,
    notes,
    facilityInstructions,
    assignedCoordinatorId:
      data.assignedCoordinatorId && data.assignedCoordinatorId !== ""
        ? data.assignedCoordinatorId
        : null,
  };
}

export async function createStaffingRequestCore(
  agencyId: string,
  userId: string,
  input: StaffingRequestFormInput,
): Promise<CreateStaffingRequestResult> {
  if (input.saveAsDraft) {
    const parsed = staffingRequestDraftSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        status: 400,
        field: issue?.path[0]?.toString(),
        message: issue?.message ?? "Invalid input.",
      };
    }

    if (!(await assertFacilityInAgency(agencyId, parsed.data.facilityId))) {
      return { ok: false, status: 404, field: "facilityId", message: "Facility not found." };
    }

    if (
      parsed.data.assignedCoordinatorId &&
      !(await assertCoordinatorInAgency(agencyId, parsed.data.assignedCoordinatorId))
    ) {
      return {
        ok: false,
        status: 400,
        field: "assignedCoordinatorId",
        message: "Invalid coordinator for this agency.",
      };
    }

    const values = mapRequestValues(parsed.data, "draft");
    const [request] = await db
      .insert(StaffingRequestTable)
      .values({
        agencyId,
        createdByUserId: userId,
        ...values,
        roleNeeded: values.roleNeeded as (typeof StaffingRequestTable.$inferInsert)["roleNeeded"],
      })
      .returning({ id: StaffingRequestTable.id });

    return { ok: true, requestId: request.id };
  }

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

  if (!(await assertFacilityInAgency(agencyId, parsed.data.facilityId))) {
    return { ok: false, status: 404, field: "facilityId", message: "Facility not found." };
  }

  const coordinatorId =
    parsed.data.assignedCoordinatorId && parsed.data.assignedCoordinatorId !== ""
      ? parsed.data.assignedCoordinatorId
      : userId;

  if (!(await assertCoordinatorInAgency(agencyId, coordinatorId))) {
    return {
      ok: false,
      status: 400,
      field: "assignedCoordinatorId",
      message: "Invalid coordinator for this agency.",
    };
  }

  const values = mapRequestValues({ ...parsed.data, assignedCoordinatorId: coordinatorId }, "open");
  const { startAt, endAt } = combineShiftDateTimes(
    parsed.data.shiftDate,
    parsed.data.startTime,
    parsed.data.endTime,
  );

  const requestId = await db.transaction(async (tx) => {
    const [request] = await tx
      .insert(StaffingRequestTable)
      .values({
        agencyId,
        createdByUserId: userId,
        ...values,
        assignedCoordinatorId: coordinatorId,
        roleNeeded: values.roleNeeded as (typeof StaffingRequestTable.$inferInsert)["roleNeeded"],
        status: "open",
      })
      .returning({ id: StaffingRequestTable.id });

    await tx.insert(ShiftTable).values({
      agencyId,
      staffingRequestId: request.id,
      facilityId: parsed.data.facilityId,
      startAt,
      endAt,
      shiftType: parsed.data.shiftType || null,
      requiredCount: parsed.data.professionalsRequired,
      status: "open",
    });

    return request.id;
  });

  return { ok: true, requestId };
}
