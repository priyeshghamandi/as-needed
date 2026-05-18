import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  FacilityTable,
  UserInviteTable,
  UserTable,
} from "@/drizzle/schema";

export type CustomerFacilityScope = {
  facilityId: string;
  facilityName: string;
  agencyId: string;
  agencyName: string;
};

export type CustomerFacilityScopeResult =
  | { ok: true; scope: CustomerFacilityScope }
  | { ok: false; reason: "no_facility" | "not_facility_user" };

export async function resolveCustomerFacilityScope(
  userId: string,
  userEmail: string,
): Promise<CustomerFacilityScopeResult> {
  const [invite] = await db
    .select({
      facilityId: UserInviteTable.facilityId,
      agencyId: UserInviteTable.agencyId,
    })
    .from(UserInviteTable)
    .where(
      and(
        eq(UserInviteTable.email, userEmail.toLowerCase()),
        eq(UserInviteTable.role, "facility_user"),
        eq(UserInviteTable.status, "accepted"),
      ),
    )
    .orderBy(desc(UserInviteTable.updatedAt))
    .limit(1);

  if (!invite?.facilityId) {
    return { ok: false, reason: "no_facility" };
  }

  const [row] = await db
    .select({
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      agencyId: AgencyTable.id,
      agencyName: AgencyTable.name,
    })
    .from(FacilityTable)
    .innerJoin(AgencyTable, eq(FacilityTable.agencyId, AgencyTable.id))
    .where(eq(FacilityTable.id, invite.facilityId))
    .limit(1);

  if (!row) {
    return { ok: false, reason: "no_facility" };
  }

  const [user] = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(eq(UserTable.id, userId))
    .limit(1);

  if (!user) {
    return { ok: false, reason: "not_facility_user" };
  }

  return {
    ok: true,
    scope: {
      facilityId: row.facilityId,
      facilityName: row.facilityName,
      agencyId: row.agencyId,
      agencyName: row.agencyName,
    },
  };
}

export async function assertCustomerRequestAccess(
  userId: string,
  userEmail: string,
  requestFacilityId: string,
): Promise<boolean> {
  const scope = await resolveCustomerFacilityScope(userId, userEmail);
  if (!scope.ok) return false;
  return scope.scope.facilityId === requestFacilityId;
}
