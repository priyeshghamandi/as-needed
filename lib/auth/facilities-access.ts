import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  FACILITIES_VIEW_ROLES,
  FACILITIES_WRITE_ROLES,
  type FacilitiesViewRole,
  type FacilitiesWriteRole,
} from "@/lib/auth/facilities-access-rules";

export {
  FACILITIES_WRITE_ROLES,
  FACILITIES_VIEW_ROLES,
  canManageFacilities,
  canViewFacilities,
  type FacilitiesWriteRole,
  type FacilitiesViewRole,
} from "@/lib/auth/facilities-access-rules";

export async function assertCanViewFacilities(
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
        FACILITIES_VIEW_ROLES.includes(row.role as FacilitiesViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view facilities.");
  }
}

export async function assertCanManageFacilities(
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
        FACILITIES_WRITE_ROLES.includes(row.role as FacilitiesWriteRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to manage facilities.");
  }
}
