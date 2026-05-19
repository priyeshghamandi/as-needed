import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { FacilityTable, UserCareSiteTable, UserRoleTable } from "@/drizzle/schema";

export type ConsumerCareScope = {
  scopeType: "consumer";
  facilityId: string;
  facilityName: string;
  agencyId: null;
  agencyName: null;
};

export type ConsumerScopeResult =
  | { ok: true; scope: ConsumerCareScope }
  | { ok: false; reason: "not_consumer" | "no_care_site" };

export async function resolveConsumerCareScope(
  userId: string,
): Promise<ConsumerScopeResult> {
  const [roleRow] = await db
    .select({ role: UserRoleTable.role })
    .from(UserRoleTable)
    .where(
      and(eq(UserRoleTable.userId, userId), eq(UserRoleTable.role, "consumer")),
    )
    .limit(1);

  if (!roleRow) {
    return { ok: false, reason: "not_consumer" };
  }

  const [row] = await db
    .select({
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
    })
    .from(UserCareSiteTable)
    .innerJoin(FacilityTable, eq(UserCareSiteTable.careSiteId, FacilityTable.id))
    .where(
      and(
        eq(UserCareSiteTable.userId, userId),
        eq(FacilityTable.siteKind, "consumer_home"),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false, reason: "no_care_site" };
  }

  return {
    ok: true,
    scope: {
      scopeType: "consumer",
      facilityId: row.facilityId,
      facilityName: row.facilityName,
      agencyId: null,
      agencyName: null,
    },
  };
}
