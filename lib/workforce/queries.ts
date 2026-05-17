import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  UserInviteTable,
} from "@/drizzle/schema";

export type ComplianceStatus = "clear" | "attention" | "blocked";
export type ShiftReadiness = "ready" | "not_ready";

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
  const { q, role, availability, compliance, active = true, sort = "name", page = 1 } = params;

  const conditions = [
    eq(HealthcareProfessionalTable.agencyId, agencyId),
    eq(HealthcareProfessionalTable.isActive, active),
  ];

  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        ilike(HealthcareProfessionalTable.firstName, like),
        ilike(HealthcareProfessionalTable.lastName, like),
        ilike(HealthcareProfessionalTable.email, like),
      )!,
    );
  }

  if (role) {
    conditions.push(eq(HealthcareProfessionalTable.role, role as never));
  }

  if (availability) {
    conditions.push(
      eq(HealthcareProfessionalTable.availabilityStatus, availability as never),
    );
  }

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

  const credMap = new Map<string, { blocked: boolean; attention: boolean }>();
  for (const c of credRows) {
    const cur = credMap.get(c.professionalId) ?? { blocked: false, attention: false };
    if (c.status === "expired" || c.status === "rejected") cur.blocked = true;
    else if (c.status === "expiring_soon" || c.status === "pending_review") cur.attention = true;
    credMap.set(c.professionalId, cur);
  }

  const getCompliance = (id: string): ComplianceStatus => {
    const c = credMap.get(id);
    return c?.blocked ? "blocked" : c?.attention ? "attention" : "clear";
  };

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
    const shiftReadiness: ShiftReadiness =
      p.availabilityStatus === "available" && complianceStatus === "clear"
        ? "ready"
        : "not_ready";
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

  const credCur = { blocked: false, attention: false };
  for (const c of credentials) {
    if (c.status === "expired" || c.status === "rejected") credCur.blocked = true;
    else if (c.status === "expiring_soon" || c.status === "pending_review")
      credCur.attention = true;
  }
  const complianceStatus: ComplianceStatus = credCur.blocked
    ? "blocked"
    : credCur.attention
      ? "attention"
      : "clear";
  const shiftReadiness: ShiftReadiness =
    pro.availabilityStatus === "available" && complianceStatus === "clear"
      ? "ready"
      : "not_ready";

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
