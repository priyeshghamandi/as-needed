import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { UserRoleTable } from "@/drizzle/schema";
import {
  INVITE_CREATOR_ROLES,
  isAgencyRole,
  type AppRole,
  type ScopedRole,
} from "@/lib/auth/roles";
export { canAccessPath } from "@/lib/auth/path-access";
import { loadUserAuthContext } from "@/lib/auth/session-context";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireAuthContext() {
  const session = await requireSession();
  const context =
    session.user.roles && session.user.primaryRole
      ? {
          userId: session.user.id,
          roles: session.user.roles,
          primaryRole: session.user.primaryRole,
          agencyId: session.user.agencyId ?? null,
        }
      : await loadUserAuthContext(session.user.id);

  return { session, context };
}

export function userHasRole(
  roles: ScopedRole[],
  allowed: AppRole[],
  agencyId?: string | null,
): boolean {
  return roles.some(
    (r) =>
      allowed.includes(r.role) &&
      (agencyId == null || r.agencyId === agencyId || r.role === "platform_admin"),
  );
}

export async function assertAgencyAccess(
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
      (row.agencyId === agencyId && isAgencyRole(row.role)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have access to this agency workspace.");
  }
}

export async function assertCanManageOnboarding(
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
      ((row.role === "agency_owner" || row.role === "agency_admin") && row.agencyId === agencyId),
  );

  if (!allowed) {
    throw new ForbiddenError("Only agency owners and admins can manage onboarding.");
  }
}

export async function assertCanCreateInvite(
  userId: string,
  agencyId: string,
): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      INVITE_CREATOR_ROLES.includes(row.role) &&
      (row.role === "platform_admin" || row.agencyId === agencyId),
  );

  if (!allowed) {
    throw new ForbiddenError("You cannot send invites for this agency.");
  }
}
