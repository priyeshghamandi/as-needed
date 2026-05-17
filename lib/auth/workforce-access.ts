import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  WORKFORCE_VIEW_ROLES,
  WORKFORCE_WRITE_ROLES,
  type WorkforceViewRole,
  type WorkforceWriteRole,
} from "@/lib/auth/workforce-access-rules";

export {
  WORKFORCE_WRITE_ROLES,
  WORKFORCE_VIEW_ROLES,
  canManageWorkforce,
  canViewWorkforce,
  type WorkforceWriteRole,
  type WorkforceViewRole,
} from "@/lib/auth/workforce-access-rules";

export async function assertCanViewWorkforce(
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
        WORKFORCE_VIEW_ROLES.includes(row.role as WorkforceViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view workforce.");
  }
}

export async function assertCanManageWorkforce(
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
        WORKFORCE_WRITE_ROLES.includes(row.role as WorkforceWriteRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to manage workforce.");
  }
}
