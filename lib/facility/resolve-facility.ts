import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  FacilityTable,
  UserInviteTable,
  UserRoleTable,
} from "@/drizzle/schema";

export type FacilityContext = {
  facilityId: string;
  facilityName: string;
  agencyId: string;
  agencyName: string;
  facilityState: string | null;
};

export type ResolveFacilityResult =
  | { ok: true; context: FacilityContext }
  | { ok: false; reason: "no_facility" | "not_facility_user" };

/**
 * Resolve facility + agency for an invited facility_user from accepted invite.
 * MVP: one facility per account (most recent accepted invite with facility_id).
 */
export async function resolveFacilityContext(
  userId: string,
  userEmail: string,
): Promise<ResolveFacilityResult> {
  const [roleRow] = await db
    .select({ role: UserRoleTable.role })
    .from(UserRoleTable)
    .where(
      and(eq(UserRoleTable.userId, userId), eq(UserRoleTable.role, "facility_user")),
    )
    .limit(1);

  if (!roleRow) {
    return { ok: false, reason: "not_facility_user" };
  }

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

  if (!invite?.facilityId || !invite.agencyId) {
    return { ok: false, reason: "no_facility" };
  }

  const [row] = await db
    .select({
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      facilityState: FacilityTable.state,
      agencyId: AgencyTable.id,
      agencyName: AgencyTable.name,
    })
    .from(FacilityTable)
    .innerJoin(AgencyTable, eq(FacilityTable.agencyId, AgencyTable.id))
    .where(
      and(
        eq(FacilityTable.id, invite.facilityId),
        eq(FacilityTable.agencyId, invite.agencyId),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false, reason: "no_facility" };
  }

  return {
    ok: true,
    context: {
      facilityId: row.facilityId,
      facilityName: row.facilityName,
      agencyId: row.agencyId,
      agencyName: row.agencyName,
      facilityState: row.facilityState,
    },
  };
}
