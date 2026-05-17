import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FacilityTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserRoleTable,
  UserTable,
} from "@/drizzle/schema";
import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";
import { computeFulfillment } from "@/lib/staffing-requests/fulfillment";
import {
  buildStaffingRequestWhereConditions,
  PAGE_SIZE,
  type StaffingRequestsListParams,
} from "@/lib/staffing-requests/list-filters";

export interface StaffingRequestListItem {
  id: string;
  title: string;
  facilityName: string;
  roleNeeded: string;
  shiftStartAt: Date | null;
  shiftEndAt: Date | null;
  professionalsRequired: number;
  filledCount: number;
  priority: string;
  status: string;
  coordinatorName: string | null;
  updatedAt: Date;
}

export interface StaffingRequestsListResult {
  items: StaffingRequestListItem[];
  total: number;
  page: number;
  pageCount: number;
}

export async function getStaffingRequestsList(
  agencyId: string,
  params: StaffingRequestsListParams = {},
): Promise<StaffingRequestsListResult> {
  const { page = 1 } = params;
  const conditions = buildStaffingRequestWhereConditions(agencyId, params).filter(
    (c) => c !== undefined,
  );

  const rows = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      facilityName: FacilityTable.name,
      roleNeeded: StaffingRequestTable.roleNeeded,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      priority: StaffingRequestTable.priority,
      status: StaffingRequestTable.status,
      coordinatorName: UserTable.name,
      updatedAt: StaffingRequestTable.updatedAt,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .leftJoin(UserTable, eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id))
    .where(and(...conditions))
    .orderBy(desc(StaffingRequestTable.updatedAt));

  const uniqueById = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    uniqueById.set(row.id, row);
  }
  const all = Array.from(uniqueById.values());
  const total = all.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, pageCount || 1));
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageRows = all.slice(offset, offset + PAGE_SIZE);

  if (pageRows.length === 0) {
    return { items: [], total, page: safePage, pageCount };
  }

  const requestIds = pageRows.map((r) => r.id);

  const [shifts, filledCounts] = await Promise.all([
    db
      .select({
        staffingRequestId: ShiftTable.staffingRequestId,
        startAt: ShiftTable.startAt,
        endAt: ShiftTable.endAt,
      })
      .from(ShiftTable)
      .where(inArray(ShiftTable.staffingRequestId, requestIds))
      .orderBy(asc(ShiftTable.startAt)),
    db
      .select({
        staffingRequestId: ShiftTable.staffingRequestId,
        filled: sql<number>`count(distinct ${ShiftAssignmentTable.professionalId})::int`,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          inArray(ShiftTable.staffingRequestId, requestIds),
          inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
        ),
      )
      .groupBy(ShiftTable.staffingRequestId),
  ]);

  const primaryShift = new Map<string, { startAt: Date; endAt: Date }>();
  for (const shift of shifts) {
    if (!primaryShift.has(shift.staffingRequestId)) {
      primaryShift.set(shift.staffingRequestId, {
        startAt: shift.startAt,
        endAt: shift.endAt,
      });
    }
  }

  const filledMap = new Map(filledCounts.map((r) => [r.staffingRequestId, r.filled]));

  let items: StaffingRequestListItem[] = pageRows.map((row) => {
    const shift = primaryShift.get(row.id);
    const filledCount = filledMap.get(row.id) ?? 0;
    return {
      id: row.id,
      title: row.title,
      facilityName: row.facilityName,
      roleNeeded: row.roleNeeded,
      shiftStartAt: shift?.startAt ?? null,
      shiftEndAt: shift?.endAt ?? null,
      professionalsRequired: row.professionalsRequired,
      filledCount,
      priority: row.priority,
      status: row.status,
      coordinatorName: row.coordinatorName,
      updatedAt: row.updatedAt,
    };
  });

  if (params.from || params.to) {
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;
    items = items.filter((item) => {
      if (!item.shiftStartAt) return false;
      if (fromDate && !Number.isNaN(fromDate.getTime()) && item.shiftStartAt < fromDate) {
        return false;
      }
      if (toDate && !Number.isNaN(toDate.getTime()) && item.shiftStartAt > toDate) {
        return false;
      }
      return true;
    });
  }

  return { items, total, page: safePage, pageCount };
}

export interface StaffingRequestShiftRow {
  id: string;
  startAt: Date;
  endAt: Date;
  shiftType: string | null;
  status: string;
  requiredCount: number;
}

export interface StaffingRequestDetail {
  id: string;
  title: string;
  status: string;
  priority: string;
  roleNeeded: string;
  specialty: string | null;
  professionalsRequired: number;
  filledCount: number;
  progress: number;
  requiredCredentials: string[] | null;
  notes: string | null;
  facilityInstructions: string | null;
  createdAt: Date;
  updatedAt: Date;
  coordinatorName: string | null;
  assignedCoordinatorId: string | null;
  facility: {
    id: string;
    name: string;
    type: string;
    city: string | null;
    state: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  shifts: StaffingRequestShiftRow[];
}

export async function getStaffingRequestDetail(
  agencyId: string,
  requestId: string,
): Promise<StaffingRequestDetail | null> {
  const [row] = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      status: StaffingRequestTable.status,
      priority: StaffingRequestTable.priority,
      roleNeeded: StaffingRequestTable.roleNeeded,
      specialty: StaffingRequestTable.specialty,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      requiredCredentials: StaffingRequestTable.requiredCredentials,
      notes: StaffingRequestTable.notes,
      facilityInstructions: StaffingRequestTable.facilityInstructions,
      createdAt: StaffingRequestTable.createdAt,
      updatedAt: StaffingRequestTable.updatedAt,
      assignedCoordinatorId: StaffingRequestTable.assignedCoordinatorId,
      coordinatorName: UserTable.name,
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      facilityType: FacilityTable.type,
      facilityCity: FacilityTable.city,
      facilityState: FacilityTable.state,
      facilityContactName: FacilityTable.contactName,
      facilityContactEmail: FacilityTable.contactEmail,
      facilityContactPhone: FacilityTable.contactPhone,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .leftJoin(UserTable, eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id))
    .where(and(eq(StaffingRequestTable.id, requestId), eq(StaffingRequestTable.agencyId, agencyId)))
    .limit(1);

  if (!row) return null;

  const shifts = await db
    .select({
      id: ShiftTable.id,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      shiftType: ShiftTable.shiftType,
      status: ShiftTable.status,
      requiredCount: ShiftTable.requiredCount,
    })
    .from(ShiftTable)
    .where(eq(ShiftTable.staffingRequestId, requestId))
    .orderBy(asc(ShiftTable.startAt));

  const [filledRow] = await db
    .select({
      filled: sql<number>`count(distinct ${ShiftAssignmentTable.professionalId})::int`,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(
      and(
        eq(ShiftTable.staffingRequestId, requestId),
        inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
      ),
    );

  const filledCount = filledRow?.filled ?? 0;
  const fulfillment = computeFulfillment(row.professionalsRequired, filledCount);

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    roleNeeded: row.roleNeeded,
    specialty: row.specialty,
    professionalsRequired: row.professionalsRequired,
    filledCount: fulfillment.filledCount,
    progress: fulfillment.progress,
    requiredCredentials: row.requiredCredentials,
    notes: row.notes,
    facilityInstructions: row.facilityInstructions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    coordinatorName: row.coordinatorName,
    assignedCoordinatorId: row.assignedCoordinatorId,
    facility: {
      id: row.facilityId,
      name: row.facilityName,
      type: row.facilityType,
      city: row.facilityCity,
      state: row.facilityState,
      contactName: row.facilityContactName,
      contactEmail: row.facilityContactEmail,
      contactPhone: row.facilityContactPhone,
    },
    shifts,
  };
}

export async function getAgencyFacilities(agencyId: string) {
  return db
    .select({
      id: FacilityTable.id,
      name: FacilityTable.name,
      type: FacilityTable.type,
    })
    .from(FacilityTable)
    .where(eq(FacilityTable.agencyId, agencyId))
    .orderBy(asc(FacilityTable.name));
}

export async function getAgencyCoordinators(agencyId: string) {
  return db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      role: UserRoleTable.role,
    })
    .from(UserRoleTable)
    .innerJoin(UserTable, eq(UserRoleTable.userId, UserTable.id))
    .where(
      and(
        eq(UserRoleTable.agencyId, agencyId),
        inArray(UserRoleTable.role, [
          "agency_owner",
          "agency_admin",
          "staffing_coordinator",
        ]),
      ),
    )
    .orderBy(asc(UserTable.name));
}