import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { CredentialTable, UserRoleTable } from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import {
  COMPLIANCE_VIEW_ROLES,
  type ComplianceViewRole,
} from "@/lib/auth/compliance-access-rules";

export {
  COMPLIANCE_VIEW_ROLES,
  canManageCompliance,
  canViewCompliance,
  type ComplianceViewRole,
} from "@/lib/auth/compliance-access-rules";

export async function assertCanViewCompliance(
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
        COMPLIANCE_VIEW_ROLES.includes(row.role as ComplianceViewRole)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view compliance.");
  }
}

export async function assertCanManageCompliance(
  userId: string,
  agencyId: string,
): Promise<void> {
  await assertCanViewCompliance(userId, agencyId);
}

export async function getCredentialAgencyId(credentialId: string): Promise<string | null> {
  const [row] = await db
    .select({ agencyId: CredentialTable.agencyId })
    .from(CredentialTable)
    .where(eq(CredentialTable.id, credentialId))
    .limit(1);

  return row?.agencyId ?? null;
}
