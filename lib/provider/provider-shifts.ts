import { and, desc, eq, gt, inArray, lt, ne, or, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  FacilityTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserTable,
} from "@/drizzle/schema";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";

export type ProviderShiftTab = "invites" | "upcoming" | "past";

export type ProviderShiftListItem = {
  assignmentId: string;
  status: string;
  facilityName: string;
  requestTitle: string;
  roleNeeded: string;
  startAt: string;
  endAt: string;
  shiftWindow: string;
  shiftStatus: string;
  isExpired: boolean;
};

export type ProviderShiftDetail = ProviderShiftListItem & {
  facilityAddress: string | null;
  facilityInstructions: string | null;
  requestNotes: string | null;
  coordinatorName: string | null;
  verifiedCredentialCount: number;
  invitedAt: string | null;
};

function tabFilter(tab: ProviderShiftTab, now: Date) {
  const upcomingStatuses = ["accepted", "confirmed", "checked_in"] as const;
  const pastStatuses = ["completed", "cancelled", "no_show", "declined"] as const;

  switch (tab) {
    case "invites":
      return and(
        eq(ShiftAssignmentTable.status, "invited"),
        ne(ShiftTable.status, "cancelled"),
      );
    case "upcoming":
      return and(
        inArray(ShiftAssignmentTable.status, upcomingStatuses),
        gt(ShiftTable.endAt, now),
      );
    case "past":
      return or(
        inArray(ShiftAssignmentTable.status, pastStatuses),
        lt(ShiftTable.endAt, now),
      );
  }
}

export async function listProviderShifts(
  professionalId: string,
  tab: ProviderShiftTab,
): Promise<ProviderShiftListItem[]> {
  const now = new Date();
  const order =
    tab === "past"
      ? desc(ShiftTable.startAt)
      : sql`${ShiftTable.startAt} asc`;

  const rows = await db
    .select({
      assignmentId: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      facilityName: FacilityTable.name,
      requestTitle: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      shiftStatus: ShiftTable.status,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
    .innerJoin(
      StaffingRequestTable,
      eq(ShiftTable.staffingRequestId, StaffingRequestTable.id),
    )
    .where(
      and(
        eq(ShiftAssignmentTable.professionalId, professionalId),
        tabFilter(tab, now),
      ),
    )
    .orderBy(order);

  return rows.map((row) => ({
    assignmentId: row.assignmentId,
    status: row.status,
    facilityName: row.facilityName,
    requestTitle: row.requestTitle,
    roleNeeded: row.roleNeeded,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    shiftWindow: formatShiftWindow(row.startAt, row.endAt),
    shiftStatus: row.shiftStatus,
    isExpired:
      row.status === "invited" && row.startAt.getTime() <= now.getTime(),
  }));
}

export async function getProviderShiftDetail(
  professionalId: string,
  assignmentId: string,
): Promise<ProviderShiftDetail | null> {
  const now = new Date();

  const [row] = await db
    .select({
      assignmentId: ShiftAssignmentTable.id,
      status: ShiftAssignmentTable.status,
      invitedAt: ShiftAssignmentTable.invitedAt,
      facilityName: FacilityTable.name,
      facilityAddress: FacilityTable.addressLine1,
      requestTitle: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      requestNotes: StaffingRequestTable.notes,
      facilityInstructions: StaffingRequestTable.facilityInstructions,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      shiftStatus: ShiftTable.status,
      coordinatorName: UserTable.name,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
    .innerJoin(
      StaffingRequestTable,
      eq(ShiftTable.staffingRequestId, StaffingRequestTable.id),
    )
    .leftJoin(
      UserTable,
      eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id),
    )
    .where(
      and(
        eq(ShiftAssignmentTable.id, assignmentId),
        eq(ShiftAssignmentTable.professionalId, professionalId),
      ),
    )
    .limit(1);

  if (!row) return null;

  const credRows = await db
    .select({ id: CredentialTable.id })
    .from(CredentialTable)
    .where(
      and(
        eq(CredentialTable.professionalId, professionalId),
        inArray(CredentialTable.status, ["verified", "expiring_soon"]),
      ),
    );

  return {
    assignmentId: row.assignmentId,
    status: row.status,
    facilityName: row.facilityName,
    requestTitle: row.requestTitle,
    roleNeeded: row.roleNeeded,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    shiftWindow: formatShiftWindow(row.startAt, row.endAt),
    shiftStatus: row.shiftStatus,
    isExpired: row.status === "invited" && row.startAt.getTime() <= now.getTime(),
    facilityAddress: row.facilityAddress,
    facilityInstructions: row.facilityInstructions,
    requestNotes: row.requestNotes,
    coordinatorName: row.coordinatorName,
    verifiedCredentialCount: credRows.length,
    invitedAt: row.invitedAt?.toISOString() ?? null,
  };
}
