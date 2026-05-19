import { and, desc, eq, inArray } from "drizzle-orm";
import { MARKETPLACE_CUSTOMER_SOURCES } from "@/lib/staffing-requests/marketplace-sources";
import { db } from "@/drizzle/db";
import {
  HealthcareProfessionalTable,
  ShiftTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export type CustomerRequestListItem = {
  id: string;
  title: string;
  fulfillmentStatus: StaffingRequestFulfillmentStatus | null;
  selectionCount: number;
  shiftStartAt: Date | null;
  shiftEndAt: Date | null;
  updatedAt: Date;
};

export type CustomerRequestSelectionDetail = {
  id: string;
  displayName: string;
  role: string;
  agencyId: string;
  sortOrder: number;
};

export type CustomerRequestDetail = {
  id: string;
  title: string;
  roleNeeded: string;
  fulfillmentStatus: StaffingRequestFulfillmentStatus | null;
  status: string;
  professionalsRequired: number;
  notes: string | null;
  shiftStartAt: Date | null;
  shiftEndAt: Date | null;
  shiftType: string | null;
  customerSubmittedAt: Date | null;
  updatedAt: Date;
  selections: CustomerRequestSelectionDetail[];
};

export async function listCustomerRequests(
  facilityId: string,
): Promise<CustomerRequestListItem[]> {
  const requests = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
      updatedAt: StaffingRequestTable.updatedAt,
    })
    .from(StaffingRequestTable)
    .where(
      and(
        eq(StaffingRequestTable.facilityId, facilityId),
        inArray(StaffingRequestTable.source, [...MARKETPLACE_CUSTOMER_SOURCES]),
      ),
    )
    .orderBy(desc(StaffingRequestTable.updatedAt));

  if (requests.length === 0) return [];

  const requestIds = requests.map((r) => r.id);
  const shifts = await db
    .select({
      staffingRequestId: ShiftTable.staffingRequestId,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
    })
    .from(ShiftTable)
    .where(inArray(ShiftTable.staffingRequestId, requestIds));

  const shiftByRequest = new Map<string, { startAt: Date; endAt: Date }>();
  for (const shift of shifts) {
    if (!shiftByRequest.has(shift.staffingRequestId)) {
      shiftByRequest.set(shift.staffingRequestId, {
        startAt: shift.startAt,
        endAt: shift.endAt,
      });
    }
  }
  const selectionRows = await db
    .select({
      requestId: StaffingRequestSelectionTable.staffingRequestId,
    })
    .from(StaffingRequestSelectionTable)
    .where(inArray(StaffingRequestSelectionTable.staffingRequestId, requestIds));

  const counts = new Map<string, number>();
  for (const row of selectionRows) {
    counts.set(row.requestId, (counts.get(row.requestId) ?? 0) + 1);
  }

  return requests.map((row) => {
    const shift = shiftByRequest.get(row.id);
    return {
      id: row.id,
      title: row.title,
      fulfillmentStatus: row.fulfillmentStatus as StaffingRequestFulfillmentStatus | null,
      selectionCount: counts.get(row.id) ?? 0,
      shiftStartAt: shift?.startAt ?? null,
      shiftEndAt: shift?.endAt ?? null,
      updatedAt: row.updatedAt,
    };
  });
}

export async function getCustomerRequestDetail(
  facilityId: string,
  requestId: string,
): Promise<CustomerRequestDetail | null> {
  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
      status: StaffingRequestTable.status,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      notes: StaffingRequestTable.notes,
      customerSubmittedAt: StaffingRequestTable.customerSubmittedAt,
      updatedAt: StaffingRequestTable.updatedAt,
      shiftStartAt: ShiftTable.startAt,
      shiftEndAt: ShiftTable.endAt,
      shiftType: ShiftTable.shiftType,
    })
    .from(StaffingRequestTable)
    .leftJoin(ShiftTable, eq(ShiftTable.staffingRequestId, StaffingRequestTable.id))
    .where(
      and(
        eq(StaffingRequestTable.id, requestId),
        eq(StaffingRequestTable.facilityId, facilityId),
        inArray(StaffingRequestTable.source, [...MARKETPLACE_CUSTOMER_SOURCES]),
      ),
    )
    .limit(1);

  if (!request) return null;

  const selections = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      agencyId: StaffingRequestSelectionTable.agencyId,
      sortOrder: StaffingRequestSelectionTable.sortOrder,
    })
    .from(StaffingRequestSelectionTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(StaffingRequestSelectionTable.healthcareProfessionalId, HealthcareProfessionalTable.id),
    )
    .where(eq(StaffingRequestSelectionTable.staffingRequestId, requestId))
    .orderBy(StaffingRequestSelectionTable.sortOrder);

  return {
    id: request.id,
    title: request.title,
    roleNeeded: request.roleNeeded,
    fulfillmentStatus: request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null,
    status: request.status,
    professionalsRequired: request.professionalsRequired,
    notes: request.notes,
    shiftStartAt: request.shiftStartAt,
    shiftEndAt: request.shiftEndAt,
    shiftType: request.shiftType,
    customerSubmittedAt: request.customerSubmittedAt,
    updatedAt: request.updatedAt,
    selections: selections.map((s) => ({
      id: s.id,
      displayName: `${s.firstName} ${s.lastName}`.trim(),
      role: s.role,
      agencyId: s.agencyId,
      sortOrder: s.sortOrder,
    })),
  };
}
