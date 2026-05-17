import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";
import { computeShiftFill } from "@/lib/shifts/fill-count";
import {
  buildShiftWhereConditions,
  PAGE_SIZE,
  type ShiftsListParams,
} from "@/lib/shifts/list-filters";
import { maybePromoteShiftTimeStatus, recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";

export interface ShiftListItem {
  id: string;
  shiftType: string | null;
  requestId: string;
  requestTitle: string;
  facilityName: string;
  startAt: Date;
  endAt: Date;
  requiredCount: number;
  filledCount: number;
  status: string;
  updatedAt: Date;
  isUrgent: boolean;
}

export interface ShiftsListResult {
  items: ShiftListItem[];
  total: number;
  page: number;
  pageCount: number;
}

export async function getShiftsList(
  agencyId: string,
  params: ShiftsListParams = {},
): Promise<ShiftsListResult> {
  const { page = 1 } = params;
  const conditions = buildShiftWhereConditions(agencyId, params);

  const rows = await db
    .select({
      id: ShiftTable.id,
      shiftType: ShiftTable.shiftType,
      requestId: StaffingRequestTable.id,
      requestTitle: StaffingRequestTable.title,
      facilityName: FacilityTable.name,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      requiredCount: ShiftTable.requiredCount,
      status: ShiftTable.status,
      updatedAt: ShiftTable.updatedAt,
    })
    .from(ShiftTable)
    .innerJoin(StaffingRequestTable, eq(ShiftTable.staffingRequestId, StaffingRequestTable.id))
    .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
    .where(and(...conditions))
    .orderBy(asc(ShiftTable.startAt));

  const shiftIds = rows.map((r) => r.id);
  const filledMap = new Map<string, number>();

  if (shiftIds.length > 0) {
    const filledRows = await db
      .select({
        shiftId: ShiftTable.id,
        filled: sql<number>`count(distinct ${ShiftAssignmentTable.professionalId})::int`,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          inArray(ShiftTable.id, shiftIds),
          inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
        ),
      )
      .groupBy(ShiftTable.id);

    for (const row of filledRows) {
      filledMap.set(row.shiftId, row.filled);
    }
  }

  const in24h = Date.now() + 24 * 60 * 60 * 1000;

  let items: ShiftListItem[] = rows.map((row) => {
    const filledCount = filledMap.get(row.id) ?? 0;
    const isUrgent =
      row.startAt.getTime() < in24h &&
      row.status !== "confirmed" &&
      row.status !== "completed" &&
      row.status !== "cancelled" &&
      filledCount < row.requiredCount;

    return {
      id: row.id,
      shiftType: row.shiftType,
      requestId: row.requestId,
      requestTitle: row.requestTitle,
      facilityName: row.facilityName,
      startAt: row.startAt,
      endAt: row.endAt,
      requiredCount: row.requiredCount,
      filledCount,
      status: row.status,
      updatedAt: row.updatedAt,
      isUrgent,
    };
  });

  if (params.unfilled) {
    items = items.filter(
      (item) =>
        item.filledCount < item.requiredCount &&
        item.status !== "completed" &&
        item.status !== "cancelled",
    );
  }

  const total = items.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, pageCount || 1));
  const offset = (safePage - 1) * PAGE_SIZE;

  return {
    items: items.slice(offset, offset + PAGE_SIZE),
    total,
    page: safePage,
    pageCount,
  };
}

export interface ShiftAssignmentRow {
  id: string;
  professionalId: string;
  professionalName: string;
  role: string;
  status: string;
  invitedAt: Date | null;
  respondedAt: Date | null;
}

export interface ShiftDetail {
  id: string;
  shiftType: string | null;
  breakMinutes: number | null;
  startAt: Date;
  endAt: Date;
  requiredCount: number;
  filledCount: number;
  progress: number;
  status: string;
  updatedAt: Date;
  staffingRequestId: string;
  requestTitle: string;
  requestStatus: string;
  facility: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  };
  assignments: ShiftAssignmentRow[];
  isUrgent: boolean;
  canEdit: boolean;
}

export async function getShiftDetail(agencyId: string, shiftId: string): Promise<ShiftDetail | null> {
  const [row] = await db
    .select({
      id: ShiftTable.id,
      shiftType: ShiftTable.shiftType,
      breakMinutes: ShiftTable.breakMinutes,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      requiredCount: ShiftTable.requiredCount,
      status: ShiftTable.status,
      updatedAt: ShiftTable.updatedAt,
      staffingRequestId: ShiftTable.staffingRequestId,
      requestTitle: StaffingRequestTable.title,
      requestStatus: StaffingRequestTable.status,
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      facilityCity: FacilityTable.city,
      facilityState: FacilityTable.state,
    })
    .from(ShiftTable)
    .innerJoin(StaffingRequestTable, eq(ShiftTable.staffingRequestId, StaffingRequestTable.id))
    .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
    .where(and(eq(ShiftTable.id, shiftId), eq(ShiftTable.agencyId, agencyId)))
    .limit(1);

  if (!row) return null;

  await recomputeShiftStatus(shiftId);

  const status = await maybePromoteShiftTimeStatus({
    id: row.id,
    status: row.status,
    startAt: row.startAt,
    endAt: row.endAt,
  });

  const assignmentRows = await db
    .select({
      id: ShiftAssignmentTable.id,
      professionalId: ShiftAssignmentTable.professionalId,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      status: ShiftAssignmentTable.status,
      invitedAt: ShiftAssignmentTable.invitedAt,
      respondedAt: ShiftAssignmentTable.respondedAt,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(ShiftAssignmentTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(eq(ShiftAssignmentTable.shiftId, shiftId));

  const fill = computeShiftFill(row.requiredCount, assignmentRows, status);
  const in24h = Date.now() + 24 * 60 * 60 * 1000;
  const isUrgent =
    row.startAt.getTime() < in24h &&
    status !== "confirmed" &&
    status !== "completed" &&
    status !== "cancelled" &&
    fill.filledCount < fill.requiredCount;

  const canEdit = status !== "cancelled" && status !== "completed";

  return {
    id: row.id,
    shiftType: row.shiftType,
    breakMinutes: row.breakMinutes,
    startAt: row.startAt,
    endAt: row.endAt,
    requiredCount: fill.requiredCount,
    filledCount: fill.filledCount,
    progress: fill.filledCount / fill.requiredCount,
    status,
    updatedAt: row.updatedAt,
    staffingRequestId: row.staffingRequestId,
    requestTitle: row.requestTitle,
    requestStatus: row.requestStatus,
    facility: {
      id: row.facilityId,
      name: row.facilityName,
      city: row.facilityCity,
      state: row.facilityState,
    },
    assignments: assignmentRows.map((a) => ({
      id: a.id,
      professionalId: a.professionalId,
      professionalName: `${a.firstName} ${a.lastName}`.trim(),
      role: a.role,
      status: a.status,
      invitedAt: a.invitedAt,
      respondedAt: a.respondedAt,
    })),
    isUrgent,
    canEdit,
  };
}
