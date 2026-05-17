import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  STAFFING_REQUESTS_VIEW_ROLES,
  STAFFING_REQUESTS_WRITE_ROLES,
  type StaffingRequestsViewRole,
  type StaffingRequestsWriteRole,
} from "@/lib/auth/staffing-requests-access-rules";

export {
  STAFFING_REQUESTS_WRITE_ROLES,
  STAFFING_REQUESTS_VIEW_ROLES,
  canManageStaffingRequests,
  canViewStaffingRequests,
  type StaffingRequestsWriteRole,
  type StaffingRequestsViewRole,
} from "@/lib/auth/staffing-requests-access-rules";

export async function assertCanViewStaffingRequests(
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
        STAFFING_REQUESTS_VIEW_ROLES.includes(row.role as StaffingRequestsViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view staffing requests.");
  }
}

export async function assertCanManageStaffingRequests(
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
        STAFFING_REQUESTS_WRITE_ROLES.includes(row.role as StaffingRequestsWriteRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to manage staffing requests.");
  }
}
