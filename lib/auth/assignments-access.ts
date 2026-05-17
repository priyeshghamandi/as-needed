import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  UserRoleTable,
} from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  ASSIGNMENTS_WRITE_ROLES,
  MATCH_VIEW_ROLES,
  type AssignmentsWriteRole,
  type MatchViewRole,
} from "@/lib/auth/assignments-access-rules";

export {
  ASSIGNMENTS_WRITE_ROLES,
  MATCH_VIEW_ROLES,
  canManageAssignments,
  canViewMatchPage,
  type AssignmentsWriteRole,
  type MatchViewRole,
} from "@/lib/auth/assignments-access-rules";

export async function assertCanViewMatchPageAccess(
  userId: string,
  agencyId: string,
): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      row.role === "platform_admin" ||
      (row.agencyId === agencyId && MATCH_VIEW_ROLES.includes(row.role as MatchViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view matching.");
  }
}

export async function assertCanManageAssignments(
  userId: string,
  agencyId: string,
): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      row.role === "platform_admin" ||
      (row.agencyId === agencyId &&
        ASSIGNMENTS_WRITE_ROLES.includes(row.role as AssignmentsWriteRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to manage assignments.");
  }
}

export async function assertProviderOwnsAssignment(
  userId: string,
  assignmentId: string,
): Promise<{ professionalId: string; shiftId: string }> {
  const [row] = await db
    .select({
      professionalId: ShiftAssignmentTable.professionalId,
      shiftId: ShiftAssignmentTable.shiftId,
      proUserId: HealthcareProfessionalTable.userId,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(ShiftAssignmentTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(eq(ShiftAssignmentTable.id, assignmentId))
    .limit(1);

  if (!row || row.proUserId !== userId) {
    throw new ForbiddenError("You do not have access to this assignment.");
  }

  return { professionalId: row.professionalId, shiftId: row.shiftId };
}

export async function getAssignmentAgencyId(assignmentId: string): Promise<string | null> {
  const [row] = await db
    .select({ agencyId: ShiftTable.agencyId })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .where(eq(ShiftAssignmentTable.id, assignmentId))
    .limit(1);

  return row?.agencyId ?? null;
}
