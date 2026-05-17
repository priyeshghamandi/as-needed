import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lt,
  not,
  sql,
} from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  ActivityLogTable,
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserTable,
} from "@/drizzle/schema";
import { computeFillRate } from "./metrics";

const ACTIVE_REQUEST_STATUSES = [
  "open",
  "matching",
  "partially_filled",
  "at_risk",
] as const;

const FILLED_ASSIGNMENT_STATUSES = [
  "accepted",
  "confirmed",
  "checked_in",
  "completed",
] as const;

export interface DashboardSummary {
  openRequests: number;
  fillRate: number;
  availableProfessionals: number;
  urgentShifts: number;
  complianceAlerts: number;
}

export async function getDashboardSummary(agencyId: string): Promise<DashboardSummary> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [openRequests, availableProfs, urgentShifts, complianceAlerts, fillRate] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(StaffingRequestTable)
        .where(
          and(
            eq(StaffingRequestTable.agencyId, agencyId),
            inArray(StaffingRequestTable.status, [...ACTIVE_REQUEST_STATUSES]),
          ),
        )
        .then(([r]) => r.count),

      db
        .select({ count: count() })
        .from(HealthcareProfessionalTable)
        .where(
          and(
            eq(HealthcareProfessionalTable.agencyId, agencyId),
            eq(HealthcareProfessionalTable.isActive, true),
            eq(HealthcareProfessionalTable.availabilityStatus, "available"),
          ),
        )
        .then(([r]) => r.count),

      db
        .select({ count: count() })
        .from(ShiftTable)
        .where(
          and(
            eq(ShiftTable.agencyId, agencyId),
            gte(ShiftTable.startAt, now),
            lt(ShiftTable.startAt, in24h),
            not(
              inArray(ShiftTable.status, ["completed", "cancelled", "confirmed", "active"]),
            ),
          ),
        )
        .then(([r]) => r.count),

      db
        .select({ count: count() })
        .from(CredentialTable)
        .where(
          and(
            eq(CredentialTable.agencyId, agencyId),
            inArray(CredentialTable.status, ["expiring_soon", "expired", "pending_review"]),
          ),
        )
        .then(([r]) => r.count),

      (async () => {
        const requests = await db
          .select({
            id: StaffingRequestTable.id,
            professionalsRequired: StaffingRequestTable.professionalsRequired,
          })
          .from(StaffingRequestTable)
          .where(
            and(
              eq(StaffingRequestTable.agencyId, agencyId),
              inArray(StaffingRequestTable.status, [
                ...ACTIVE_REQUEST_STATUSES,
                "confirmed",
              ]),
            ),
          );

        if (requests.length === 0) return 0;

        const requestIds = requests.map((r) => r.id);
        const fillCounts = await db
          .select({
            staffingRequestId: ShiftTable.staffingRequestId,
            filled: count(),
          })
          .from(ShiftAssignmentTable)
          .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
          .where(
            and(
              inArray(ShiftTable.staffingRequestId, requestIds),
              inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
            ),
          )
          .groupBy(ShiftTable.staffingRequestId);

        const fillMap = new Map(fillCounts.map((f) => [f.staffingRequestId, f.filled]));
        return computeFillRate(
          requests.map((r) => ({
            professionalsRequired: r.professionalsRequired,
            filledCount: fillMap.get(r.id) ?? 0,
          })),
        );
      })(),
    ]);

  return { openRequests, availableProfessionals: availableProfs, urgentShifts, complianceAlerts, fillRate };
}

export interface ActiveRequest {
  id: string;
  title: string;
  facilityName: string;
  roleNeeded: string;
  status: string;
  priority: string;
  filledCount: number;
  professionalsRequired: number;
  coordinatorName: string | null;
  updatedAt: Date;
}

export async function getActiveRequests(agencyId: string): Promise<ActiveRequest[]> {
  const requests = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      facilityName: FacilityTable.name,
      roleNeeded: StaffingRequestTable.roleNeeded,
      status: StaffingRequestTable.status,
      priority: StaffingRequestTable.priority,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      coordinatorName: UserTable.name,
      updatedAt: StaffingRequestTable.updatedAt,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .leftJoin(UserTable, eq(StaffingRequestTable.assignedCoordinatorId, UserTable.id))
    .where(
      and(
        eq(StaffingRequestTable.agencyId, agencyId),
        inArray(StaffingRequestTable.status, [...ACTIVE_REQUEST_STATUSES]),
      ),
    )
    .orderBy(desc(StaffingRequestTable.updatedAt))
    .limit(10);

  if (requests.length === 0) return [];

  const requestIds = requests.map((r) => r.id);
  const fillCounts = await db
    .select({
      staffingRequestId: ShiftTable.staffingRequestId,
      filled: count(),
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(
      and(
        inArray(ShiftTable.staffingRequestId, requestIds),
        inArray(ShiftAssignmentTable.status, [...FILLED_ASSIGNMENT_STATUSES]),
      ),
    )
    .groupBy(ShiftTable.staffingRequestId);

  const fillMap = new Map(fillCounts.map((f) => [f.staffingRequestId, f.filled]));

  return requests.map((r) => ({
    ...r,
    filledCount: fillMap.get(r.id) ?? 0,
  }));
}

export interface AvailableProfessional {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  city: string | null;
  state: string | null;
  availabilityStatus: string;
  complianceStatus: "clear" | "attention" | "blocked";
  reliabilityScore: number | null;
  lastShiftAt: Date | null;
}

export async function getAvailableWorkforce(agencyId: string): Promise<AvailableProfessional[]> {
  const professionals = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      city: HealthcareProfessionalTable.city,
      state: HealthcareProfessionalTable.state,
      availabilityStatus: HealthcareProfessionalTable.availabilityStatus,
      reliabilityScore: HealthcareProfessionalTable.reliabilityScore,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, agencyId),
        eq(HealthcareProfessionalTable.isActive, true),
        eq(HealthcareProfessionalTable.availabilityStatus, "available"),
      ),
    )
    .orderBy(desc(HealthcareProfessionalTable.updatedAt))
    .limit(10);

  if (professionals.length === 0) return [];

  const profIds = professionals.map((p) => p.id);

  const [credRows, lastShifts] = await Promise.all([
    db
      .select({
        professionalId: CredentialTable.professionalId,
        status: CredentialTable.status,
      })
      .from(CredentialTable)
      .where(inArray(CredentialTable.professionalId, profIds)),

    db
      .select({
        professionalId: ShiftAssignmentTable.professionalId,
        lastShiftAt: sql<Date | null>`MAX(${ShiftTable.startAt})`,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          inArray(ShiftAssignmentTable.professionalId, profIds),
          inArray(ShiftAssignmentTable.status, ["checked_in", "completed"]),
        ),
      )
      .groupBy(ShiftAssignmentTable.professionalId),
  ]);

  const credMap = new Map<string, { blocked: boolean; attention: boolean }>();
  for (const c of credRows) {
    const cur = credMap.get(c.professionalId) ?? { blocked: false, attention: false };
    if (c.status === "expired" || c.status === "rejected") cur.blocked = true;
    else if (c.status === "expiring_soon" || c.status === "pending_review") cur.attention = true;
    credMap.set(c.professionalId, cur);
  }

  const lastShiftMap = new Map(lastShifts.map((s) => [s.professionalId, s.lastShiftAt]));

  return professionals.map((p) => {
    const cred = credMap.get(p.id);
    const complianceStatus: "clear" | "attention" | "blocked" = cred?.blocked
      ? "blocked"
      : cred?.attention
        ? "attention"
        : "clear";
    return { ...p, complianceStatus, lastShiftAt: lastShiftMap.get(p.id) ?? null };
  });
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorName: string | null;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
}

export async function getActivityFeed(agencyId: string): Promise<ActivityLogEntry[]> {
  return db
    .select({
      id: ActivityLogTable.id,
      action: ActivityLogTable.action,
      entityType: ActivityLogTable.entityType,
      entityId: ActivityLogTable.entityId,
      actorName: UserTable.name,
      createdAt: ActivityLogTable.createdAt,
      metadata: ActivityLogTable.metadata,
    })
    .from(ActivityLogTable)
    .leftJoin(UserTable, eq(ActivityLogTable.actorUserId, UserTable.id))
    .where(eq(ActivityLogTable.agencyId, agencyId))
    .orderBy(desc(ActivityLogTable.createdAt))
    .limit(20);
}
