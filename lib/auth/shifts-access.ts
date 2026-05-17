import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  SHIFTS_VIEW_ROLES,
  SHIFTS_WRITE_ROLES,
  type ShiftsViewRole,
  type ShiftsWriteRole,
} from "@/lib/auth/shifts-access-rules";

export {
  SHIFTS_WRITE_ROLES,
  SHIFTS_VIEW_ROLES,
  canManageShifts,
  canViewShifts,
  type ShiftsWriteRole,
  type ShiftsViewRole,
} from "@/lib/auth/shifts-access-rules";

export async function assertCanViewShifts(userId: string, agencyId: string): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      row.role === "platform_admin" ||
      (row.agencyId === agencyId && SHIFTS_VIEW_ROLES.includes(row.role as ShiftsViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view shifts.");
  }
}

export async function assertCanManageShifts(userId: string, agencyId: string): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      row.role === "platform_admin" ||
      (row.agencyId === agencyId && SHIFTS_WRITE_ROLES.includes(row.role as ShiftsWriteRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to manage shifts.");
  }
}
