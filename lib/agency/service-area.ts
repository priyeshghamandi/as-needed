import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, UserRoleTable } from "@/drizzle/schema";
import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";

export type AgencyServiceAreaContext = {
  agencyId: string;
  displayName: string;
  placeId: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  radiusMiles: number;
};

export async function getAgencyServiceAreaForUser(
  userId: string,
): Promise<AgencyServiceAreaContext | null> {
  const roles = await db
    .select({ agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId))
    .limit(10);

  const agencyId = roles.find((r) => r.agencyId)?.agencyId;
  if (!agencyId) return null;

  const agencies = await db
    .select({
      id: AgencyTable.id,
      primaryServiceAreaName: AgencyTable.primaryServiceAreaName,
      primaryServiceAreaPlaceId: AgencyTable.primaryServiceAreaPlaceId,
      primaryServiceAreaCity: AgencyTable.primaryServiceAreaCity,
      primaryServiceAreaState: AgencyTable.primaryServiceAreaState,
      primaryServiceAreaCountry: AgencyTable.primaryServiceAreaCountry,
      primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
      primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  const agency = agencies[0];
  if (!agency?.primaryServiceAreaLat || !agency?.primaryServiceAreaLng) {
    return null;
  }

  const latitude = Number(agency.primaryServiceAreaLat);
  const longitude = Number(agency.primaryServiceAreaLng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    agencyId: agency.id,
    displayName: agency.primaryServiceAreaName ?? "Agency service area",
    placeId: agency.primaryServiceAreaPlaceId,
    city: agency.primaryServiceAreaCity,
    state: agency.primaryServiceAreaState,
    country: agency.primaryServiceAreaCountry,
    latitude,
    longitude,
    radiusMiles: DEFAULT_SERVICE_AREA_RADIUS_MILES,
  };
}
