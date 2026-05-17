import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserTable } from "@/drizzle/schema";
import { canViewWorkforce } from "@/lib/auth/workforce-access";
import type { ServiceAreaRestrictionInput } from "@/lib/places/query-params";
import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";

export async function loadWorkforcePageContext() {
  const session = await auth();
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId;
  const primaryRole = session?.user?.primaryRole ?? null;

  if (!userId || !agencyId) redirect("/login?callbackUrl=/workforce");

  if (!canViewWorkforce(primaryRole)) redirect("/login");

  const [agency, user] = await Promise.all([
    db
      .select({
        name: AgencyTable.name,
        primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
        primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
        serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
      })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1)
      .then(([r]) => r ?? null),
    db
      .select({ name: UserTable.name })
      .from(UserTable)
      .where(eq(UserTable.id, userId))
      .limit(1)
      .then(([r]) => r ?? null),
  ]);

  if (!agency) redirect("/login");

  const userName = user?.name ?? "Team Member";
  const userInitials = userName
    .split(" ")
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasCenter = Boolean(agency.primaryServiceAreaLat && agency.primaryServiceAreaLng);
  const serviceArea: ServiceAreaRestrictionInput = {
    restrictedToServiceArea: hasCenter,
    serviceAreaCenterLat: hasCenter ? Number(agency.primaryServiceAreaLat) : undefined,
    serviceAreaCenterLng: hasCenter ? Number(agency.primaryServiceAreaLng) : undefined,
    serviceAreaRadiusMiles:
      agency.serviceAreaRadiusMiles ?? DEFAULT_SERVICE_AREA_RADIUS_MILES,
  };

  return {
    agencyId,
    agencyName: agency.name,
    userName,
    userInitials,
    primaryRole: primaryRole ?? "staffing_coordinator",
    serviceArea,
  };
}
