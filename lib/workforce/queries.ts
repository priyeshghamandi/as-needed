import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  UserInviteTable,
} from "@/drizzle/schema";
import { buildProfessionalWhereConditions } from "@/lib/workforce/list-filters";
import {
  computeShiftReadiness,
  deriveComplianceStatus,
  type ComplianceStatus,
  type ShiftReadiness,
} from "@/lib/workforce/shift-readiness";

export type { ComplianceStatus, ShiftReadiness };

export interface WorkforceListItem {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  city: string | null;
  state: string | null;
  availabilityStatus: string;
  reliabilityScore: number | null;
  isActive: boolean;
  updatedAt: Date;
  complianceStatus: ComplianceStatus;
  currentAssignment: string | null;
  lastShiftAt: Date | null;
  shiftReadiness: ShiftReadiness;
}

export interface WorkforceListParams {
  q?: string;
  role?: string;
  availability?: string;
  compliance?: ComplianceStatus;
  active?: boolean;
  sort?: "name" | "reliability" | "updated";
  page?: number;
}

export const PAGE_SIZE = 25;

export interface WorkforceListResult {
  items: WorkforceListItem[];
  total: number;
  page: number;
  pageCount: number;
}

export async function getWorkforceList(
  agencyId: string,
  params: WorkforceListParams = {},
): Promise<WorkforceListResult> {
  const { compliance, sort = "name", page = 1 } = params;
  const conditions = buildProfessionalWhereConditions(agencyId, params);

  const orderBy =
    sort === "reliability"
      ? [desc(HealthcareProfessionalTable.reliabilityScore)]
      : sort === "updated"
        ? [desc(HealthcareProfessionalTable.updatedAt)]
        : [
            asc(HealthcareProfessionalTable.lastName),
            asc(HealthcareProfessionalTable.firstName),
          ];

  const allPros = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      specialty: HealthcareProfessionalTable.specialty,
      city: HealthcareProfessionalTable.city,
      state: HealthcareProfessionalTable.state,
      availabilityStatus: HealthcareProfessionalTable.availabilityStatus,
      reliabilityScore: HealthcareProfessionalTable.reliabilityScore,
      isActive: HealthcareProfessionalTable.isActive,
      updatedAt: HealthcareProfessionalTable.updatedAt,
    })
    .from(HealthcareProfessionalTable)
    .where(and(...conditions))
    .orderBy(...orderBy);

  if (allPros.length === 0) {
    return { items: [], total: 0, page: 1, pageCount: 0 };
  }

  const allIds = allPros.map((p) => p.id);

  const credRows = await db
    .select({
      professionalId: CredentialTable.professionalId,
      status: CredentialTable.status,
    })
    .from(CredentialTable)
    .where(inArray(CredentialTable.professionalId, allIds));

  const credMap = new Map<string, { status: string }[]>();
  for (const c of credRows) {
    const list = credMap.get(c.professionalId) ?? [];
    list.push({ status: c.status });
    credMap.set(c.professionalId, list);
  }

  const getCompliance = (id: string): ComplianceStatus =>
    deriveComplianceStatus(credMap.get(id) ?? []);

  let filtered = allPros;
  if (compliance) {
    filtered = allPros.filter((p) => getCompliance(p.id) === compliance);
  }

  const total = filtered.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, pageCount || 1));
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);

  if (pageItems.length === 0) {
    return { items: [], total, page: safePage, pageCount };
  }

  const pageIds = pageItems.map((p) => p.id);

  const [currentAssignments, lastShifts] = await Promise.all([
    db
      .select({
        professionalId: ShiftAssignmentTable.professionalId,
        facilityName: FacilityTable.name,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
      .where(
        and(
          inArray(ShiftAssignmentTable.professionalId, pageIds),
          inArray(ShiftAssignmentTable.status, ["accepted", "confirmed", "checked_in"]),
        ),
      ),

    db
      .select({
        professionalId: ShiftAssignmentTable.professionalId,
        lastShiftAt: sql<Date | null>`MAX(${ShiftTable.startAt})`,
      })
      .from(ShiftAssignmentTable)
      .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
      .where(
        and(
          inArray(ShiftAssignmentTable.professionalId, pageIds),
          inArray(ShiftAssignmentTable.status, ["checked_in", "completed"]),
        ),
      )
      .groupBy(ShiftAssignmentTable.professionalId),
  ]);

  const assignmentMap = new Map<string, string>();
  for (const a of currentAssignments) {
    if (!assignmentMap.has(a.professionalId)) {
      assignmentMap.set(a.professionalId, a.facilityName.slice(0, 24));
    }
  }

  const lastShiftMap = new Map(lastShifts.map((s) => [s.professionalId, s.lastShiftAt]));

  const items: WorkforceListItem[] = pageItems.map((p) => {
    const complianceStatus = getCompliance(p.id);
    const shiftReadiness = computeShiftReadiness(p.availabilityStatus, complianceStatus);
    return {
      ...p,
      complianceStatus,
      currentAssignment: assignmentMap.get(p.id) ?? null,
      lastShiftAt: lastShiftMap.get(p.id) ?? null,
      shiftReadiness,
    };
  });

  return { items, total, page: safePage, pageCount };
}

export interface ProfessionalCredential {
  id: string;
  type: string;
  name: string;
  status: string;
  expiresAt: string | null;
}

export interface RecentShift {
  id: string;
  facilityName: string;
  startAt: Date;
  endAt: Date;
  status: string;
}

export interface CurrentAssignment {
  id: string;
  facilityName: string;
  startAt: Date;
  endAt: Date;
  status: string;
}

export interface ProfessionalProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  yearsExperience: number | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  availabilityStatus: string;
  reliabilityScore: number | null;
  isActive: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  complianceStatus: ComplianceStatus;
  shiftReadiness: ShiftReadiness;
  credentials: ProfessionalCredential[];
  recentShifts: RecentShift[];
  currentAssignments: CurrentAssignment[];
  pendingInviteEmail: string | null;
}

export async function getProfessionalProfile(
  agencyId: string,
  professionalId: string,
): Promise<ProfessionalProfile | null> {
  const rows = await db
    .select()
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.id, professionalId),
        eq(HealthcareProfessionalTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  const pro = rows[0];
  if (!pro) return null;

  const [credentials, recentShiftRows, currentAssignmentRows, inviteRows] =
    await Promise.all([
      db
        .select({
          id: CredentialTable.id,
          type: CredentialTable.type,
          name: CredentialTable.name,
          status: CredentialTable.status,
          expiresAt: CredentialTable.expiresAt,
        })
        .from(CredentialTable)
        .where(eq(CredentialTable.professionalId, professionalId))
        .orderBy(asc(CredentialTable.name)),

      db
        .select({
          id: ShiftAssignmentTable.id,
          facilityName: FacilityTable.name,
          startAt: ShiftTable.startAt,
          endAt: ShiftTable.endAt,
          status: ShiftAssignmentTable.status,
        })
        .from(ShiftAssignmentTable)
        .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
        .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
        .where(
          and(
            eq(ShiftAssignmentTable.professionalId, professionalId),
            inArray(ShiftAssignmentTable.status, ["completed", "checked_in", "no_show"]),
          ),
        )
        .orderBy(desc(ShiftTable.startAt))
        .limit(5),

      db
        .select({
          id: ShiftAssignmentTable.id,
          facilityName: FacilityTable.name,
          startAt: ShiftTable.startAt,
          endAt: ShiftTable.endAt,
          status: ShiftAssignmentTable.status,
        })
        .from(ShiftAssignmentTable)
        .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
        .innerJoin(FacilityTable, eq(ShiftTable.facilityId, FacilityTable.id))
        .where(
          and(
            eq(ShiftAssignmentTable.professionalId, professionalId),
            inArray(ShiftAssignmentTable.status, ["accepted", "confirmed"]),
          ),
        )
        .orderBy(asc(ShiftTable.startAt))
        .limit(5),

      pro.email
        ? db
            .select({ id: UserInviteTable.id, email: UserInviteTable.email })
            .from(UserInviteTable)
            .where(
              and(
                eq(UserInviteTable.email, pro.email),
                eq(UserInviteTable.agencyId, agencyId),
                eq(UserInviteTable.status, "pending"),
              ),
            )
            .limit(1)
        : Promise.resolve([]),
    ]);

  const complianceStatus = deriveComplianceStatus(credentials);
  const shiftReadiness = computeShiftReadiness(pro.availabilityStatus, complianceStatus);

  return {
    id: pro.id,
    firstName: pro.firstName,
    lastName: pro.lastName,
    role: pro.role,
    specialty: pro.specialty,
    yearsExperience: pro.yearsExperience,
    email: pro.email,
    phone: pro.phone,
    city: pro.city,
    state: pro.state,
    country: pro.country,
    availabilityStatus: pro.availabilityStatus,
    reliabilityScore: pro.reliabilityScore,
    isActive: pro.isActive,
    userId: pro.userId,
    createdAt: pro.createdAt,
    updatedAt: pro.updatedAt,
    complianceStatus,
    shiftReadiness,
    credentials: credentials.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      status: c.status,
      expiresAt: c.expiresAt,
    })),
    recentShifts: recentShiftRows,
    currentAssignments: currentAssignmentRows,
    pendingInviteEmail: inviteRows[0]?.email ?? null,
  };
}
