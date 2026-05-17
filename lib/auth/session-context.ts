import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import {
  pickPrimaryAgencyId,
  pickPrimaryRole,
  type ScopedRole,
} from "@/lib/auth/roles";

export type UserAuthContext = {
  userId: string;
  roles: ScopedRole[];
  primaryRole: ScopedRole["role"] | null;
  agencyId: string | null;
};

export async function loadUserAuthContext(
  userId: string,
): Promise<UserAuthContext> {
  const rows = await db
    .select({
      role: UserRoleTable.role,
      agencyId: UserRoleTable.agencyId,
    })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const roles: ScopedRole[] = rows.map((row) => ({
    role: row.role,
    agencyId: row.agencyId,
  }));

  return {
    userId,
    roles,
    primaryRole: pickPrimaryRole(roles),
    agencyId: pickPrimaryAgencyId(roles),
  };
}
