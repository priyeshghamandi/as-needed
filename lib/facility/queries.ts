import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
} from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserTable,
} from "@/drizzle/schema";
import { deriveFulfillmentTimeline } from "@/lib/facility/fulfillment-timeline";
import type { FacilityRequestListParams } from "@/lib/facility/list-filters";
import type { FacilityContext } from "@/lib/facility/resolve-facility";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";

const FACILITY_TZ = "America/New_York";

const OPEN_STATUSES = ["open", "matching", "partially_filled", "at_risk"] as const;
const ACTIVE_ASSIGNMENT_STATUSES = [
  "invited",
  "accepted",
  "confirmed",
  "checked_in",
  "completed",
] as const;
const ACCEPTED_ASSIGNMENT_STATUSES = ["accepted", "confirmed", "checked_in", "completed"] as const;

function facilityScope(facility: FacilityContext) {
  return and(
    eq(StaffingRequestTable.facilityId, facility.facilityId),
    eq(StaffingRequestTable.agencyId, facility.agencyId),
  );
}

function startOfWeekInTz(now: Date, timeZone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - dayIndex);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export type FacilityDashboardData = {
  kpis: {
    openRequests: number;
    atRisk: number;
    confirmedThisWeek: number;
    upcomingShifts: number;
  };
  activeRequests: {
    id: string;
    title: string;
    roleNeeded: string;
    roleLabel: string;
    status: string;
    createdAt: Date;
  }[];
  upcomingStaff: {
    assignmentId: string;
    professionalName: string;
    role: string;
    roleLabel: string;
    shiftWindow: string;
    assignmentStatus: string;
    requestTitle: string;
  }[];
};

export async function getFacilityDashboard(
  facility: FacilityContext,
): Promise<FacilityDashboardData> {
  const scope = facilityScope(facility);
  const now = new Date();
  const in14d = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const weekStart = startOfWeekInTz(now, FACILITY_TZ);

  const [[openRow], [atRiskRow], [confirmedRow], [upcomingShiftRow]] = await Promise.all([
    db
      .select({ value: count() })
      .from(StaffingRequestTable)
      .where(and(scope, inArray(StaffingRequestTable.status, [...OPEN_STATUSES]))),
    db
      .select({ value: count() })
      .from(StaffingRequestTable)
      .where(and(scope, eq(StaffingRequestTable.status, "at_risk"))),
    db
      .select({ value: count() })
      .from(StaffingRequestTable)
      .where(
        and(
          scope,
          eq(StaffingRequestTable.status, "confirmed"),
          gte(StaffingRequestTable.updatedAt, weekStart),
        ),
      ),
    db
      .select({ value: count() })
      .from(ShiftTable)
      .where(
        and(
          eq(ShiftTable.facilityId, facility.facilityId),
          eq(ShiftTable.agencyId, facility.agencyId),
          gte(ShiftTable.startAt, now),
          lte(ShiftTable.startAt, in14d),
          ne(ShiftTable.status, "cancelled"),
          ne(ShiftTable.status, "completed"),
        ),
      ),
  ]);

  const activeRequests = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      status: StaffingRequestTable.status,
      createdAt: StaffingRequestTable.createdAt,
    })
    .from(StaffingRequestTable)
    .where(and(scope, inArray(StaffingRequestTable.status, [...OPEN_STATUSES])))
    .orderBy(desc(StaffingRequestTable.createdAt))
    .limit(5);

  const upcomingStaff = await db
    .select({
      assignmentId: ShiftAssignmentTable.id,
      professionalFirstName: HealthcareProfessionalTable.firstName,
      professionalLastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      assignmentStatus: ShiftAssignmentTable.status,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      requestTitle: StaffingRequestTable.title,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .innerJoin(
      StaffingRequestTable,
      eq(ShiftTable.staffingRequestId, StaffingRequestTable.id),
    )
    .innerJoin(
      HealthcareProfessionalTable,
      eq(ShiftAssignmentTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(
      and(
        eq(ShiftTable.facilityId, facility.facilityId),
        eq(ShiftTable.agencyId, facility.agencyId),
        gte(ShiftTable.startAt, now),
        lte(ShiftTable.startAt, in14d),
        inArray(ShiftAssignmentTable.status, [...ACCEPTED_ASSIGNMENT_STATUSES]),
        eq(StaffingRequestTable.status, "confirmed"),
      ),
    )
    .orderBy(ShiftTable.startAt)
    .limit(8);

  return {
    kpis: {
      openRequests: Number(openRow?.value ?? 0),
      atRisk: Number(atRiskRow?.value ?? 0),
      confirmedThisWeek: Number(confirmedRow?.value ?? 0),
      upcomingShifts: Number(upcomingShiftRow?.value ?? 0),
    },
    activeRequests: activeRequests.map((r) => ({
      ...r,
      roleLabel: roleNeededLabel(r.roleNeeded),
    })),
    upcomingStaff: upcomingStaff.map((row) => ({
      assignmentId: row.assignmentId,
      professionalName: `${row.professionalFirstName} ${row.professionalLastName}`.trim(),
      role: row.role,
      roleLabel: roleNeededLabel(row.role),
      shiftWindow: formatShiftWindow(row.startAt, row.endAt),
      assignmentStatus: row.assignmentStatus,
      requestTitle: row.requestTitle,
    })),
  };
}

export type FacilityRequestListItem = {
  id: string;
  title: string;
  roleNeeded: string;
  roleLabel: string;
  status: string;
  priority: string;
  professionalsRequired: number;
  assignedCount: number;
  coordinatorName: string | null;
  createdAt: Date;
};

export async function listFacilityRequests(
  facility: FacilityContext,
  params: FacilityRequestListParams,
): Promise<{ items: FacilityRequestListItem[]; total: number }> {
  const conditions = [facilityScope(facility)];

  if (params.status?.length) {
    conditions.push(inArray(StaffingRequestTable.status, params.status));
  }
  if (params.priority) {
    conditions.push(eq(StaffingRequestTable.priority, params.priority));
  }
  if (params.search) {
    conditions.push(ilike(StaffingRequestTable.title, `%${params.search}%`));
  }

  const whereClause = and(...conditions);
  const offset = (params.page - 1) * params.pageSize;

  const [totalRow] = await db
    .select({ value: count() })
    .from(StaffingRequestTable)
    .where(whereClause);

  const rows = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      status: StaffingRequestTable.status,
      priority: StaffingRequestTable.priority,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      coordinatorFirst: UserTable.name,
      createdAt: StaffingRequestTable.createdAt,
    })
    .from(StaffingRequestTable)
    .leftJoin(UserTable, eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id))
    .where(whereClause)
    .orderBy(desc(StaffingRequestTable.createdAt))
    .limit(params.pageSize)
    .offset(offset);

  const requestIds = rows.map((r) => r.id);
  const assignedCounts = new Map<string, number>();

  if (requestIds.length > 0) {
    const counts = await db
      .select({
        requestId: ShiftTable.staffingRequestId,
        value: count(ShiftAssignmentTable.id),
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          inArray(ShiftTable.staffingRequestId, requestIds),
          inArray(ShiftAssignmentTable.status, [...ACTIVE_ASSIGNMENT_STATUSES]),
        ),
      )
      .groupBy(ShiftTable.staffingRequestId);

    for (const row of counts) {
      assignedCounts.set(row.requestId, Number(row.value));
    }
  }

  return {
    total: Number(totalRow?.value ?? 0),
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      roleNeeded: row.roleNeeded,
      roleLabel: roleNeededLabel(row.roleNeeded),
      status: row.status,
      priority: row.priority,
      professionalsRequired: row.professionalsRequired,
      assignedCount: assignedCounts.get(row.id) ?? 0,
      coordinatorName: row.coordinatorFirst,
      createdAt: row.createdAt,
    })),
  };
}

export type FacilityAssignedProfessional = {
  assignmentId: string;
  professionalName: string;
  roleLabel: string;
  assignmentStatus: string;
  shiftWindow: string;
  complianceVerified: boolean;
};

export type FacilityRequestDetail = {
  id: string;
  title: string;
  roleNeeded: string;
  roleLabel: string;
  specialty: string | null;
  status: string;
  priority: string;
  professionalsRequired: number;
  notes: string | null;
  facilityInstructions: string | null;
  createdAt: Date;
  updatedAt: Date;
  coordinator: { name: string | null; email: string | null } | null;
  shifts: {
    id: string;
    startAt: Date;
    endAt: Date;
    status: string;
    shiftWindow: string;
  }[];
  assignedProfessionals: FacilityAssignedProfessional[];
  timeline: ReturnType<typeof deriveFulfillmentTimeline>;
};

export async function getFacilityRequestDetail(
  facility: FacilityContext,
  requestId: string,
): Promise<FacilityRequestDetail | null> {
  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      roleNeeded: StaffingRequestTable.roleNeeded,
      specialty: StaffingRequestTable.specialty,
      status: StaffingRequestTable.status,
      priority: StaffingRequestTable.priority,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      notes: StaffingRequestTable.notes,
      facilityInstructions: StaffingRequestTable.facilityInstructions,
      createdAt: StaffingRequestTable.createdAt,
      updatedAt: StaffingRequestTable.updatedAt,
      coordinatorName: UserTable.name,
      coordinatorEmail: UserTable.email,
    })
    .from(StaffingRequestTable)
    .leftJoin(UserTable, eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id))
    .where(and(facilityScope(facility), eq(StaffingRequestTable.id, requestId)))
    .limit(1);

  if (!request) return null;

  const shifts = await db
    .select({
      id: ShiftTable.id,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      status: ShiftTable.status,
    })
    .from(ShiftTable)
    .where(
      and(
        eq(ShiftTable.staffingRequestId, requestId),
        eq(ShiftTable.facilityId, facility.facilityId),
      ),
    )
    .orderBy(ShiftTable.startAt);

  const shiftIds = shifts.map((s) => s.id);

  let assignmentRows: {
    assignmentId: string;
    professionalId: string;
    professionalFirstName: string;
    professionalLastName: string;
    role: string;
    assignmentStatus: string;
    startAt: Date;
    endAt: Date;
  }[] = [];

  if (shiftIds.length > 0) {
    assignmentRows = await db
      .select({
        assignmentId: ShiftAssignmentTable.id,
        professionalId: HealthcareProfessionalTable.id,
        professionalFirstName: HealthcareProfessionalTable.firstName,
        professionalLastName: HealthcareProfessionalTable.lastName,
        role: HealthcareProfessionalTable.role,
        assignmentStatus: ShiftAssignmentTable.status,
        startAt: ShiftTable.startAt,
        endAt: ShiftTable.endAt,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .innerJoin(
        HealthcareProfessionalTable,
        eq(ShiftAssignmentTable.professionalId, HealthcareProfessionalTable.id),
      )
      .where(
        and(
          inArray(ShiftAssignmentTable.shiftId, shiftIds),
          ne(ShiftAssignmentTable.status, "declined"),
          ne(ShiftAssignmentTable.status, "cancelled"),
        ),
      );
  }

  const proIds = [...new Set(assignmentRows.map((a) => a.professionalId))];
  const verifiedByPro = new Map<string, boolean>();

  if (proIds.length > 0) {
    const creds = await db
      .select({
        professionalId: CredentialTable.professionalId,
        status: CredentialTable.status,
      })
      .from(CredentialTable)
      .where(
        and(
          eq(CredentialTable.agencyId, facility.agencyId),
          inArray(CredentialTable.professionalId, proIds),
        ),
      );

    const byPro = new Map<string, { total: number; verified: number }>();
    for (const row of creds) {
      const current = byPro.get(row.professionalId) ?? { total: 0, verified: 0 };
      current.total += 1;
      if (row.status === "verified") current.verified += 1;
      byPro.set(row.professionalId, current);
    }
    for (const [proId, counts] of byPro) {
      verifiedByPro.set(proId, counts.total > 0 && counts.verified === counts.total);
    }
  }

  const hasAssignments = assignmentRows.length > 0;
  const hasAcceptedAssignment = assignmentRows.some((a) =>
    ACCEPTED_ASSIGNMENT_STATUSES.includes(
      a.assignmentStatus as (typeof ACCEPTED_ASSIGNMENT_STATUSES)[number],
    ),
  );
  const hasActiveShift = shifts.some((s) => s.status === "active");

  return {
    id: request.id,
    title: request.title,
    roleNeeded: request.roleNeeded,
    roleLabel: roleNeededLabel(request.roleNeeded),
    specialty: request.specialty,
    status: request.status,
    priority: request.priority,
    professionalsRequired: request.professionalsRequired,
    notes: request.notes,
    facilityInstructions: request.facilityInstructions,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    coordinator:
      request.coordinatorName || request.coordinatorEmail
        ? { name: request.coordinatorName, email: request.coordinatorEmail }
        : null,
    shifts: shifts.map((s) => ({
      ...s,
      shiftWindow: formatShiftWindow(s.startAt, s.endAt),
    })),
    assignedProfessionals: assignmentRows.map((a) => ({
      assignmentId: a.assignmentId,
      professionalName: `${a.professionalFirstName} ${a.professionalLastName}`.trim(),
      roleLabel: roleNeededLabel(a.role),
      assignmentStatus: a.assignmentStatus,
      shiftWindow: formatShiftWindow(a.startAt, a.endAt),
      complianceVerified: verifiedByPro.get(a.professionalId) ?? false,
    })),
    timeline: deriveFulfillmentTimeline({
      requestStatus: request.status,
      hasAssignments,
      hasAcceptedAssignment,
      hasActiveShift,
    }),
  };
}
