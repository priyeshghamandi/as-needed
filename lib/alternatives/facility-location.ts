import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, FacilityTable, StaffingRequestTable } from "@/drizzle/schema";
import { parseCoordinate } from "@/lib/matching/distance";
import type { CustomerLocationContext } from "@/lib/marketplace/types";

export async function getCustomerLocationForStaffingRequest(
  staffingRequestId: string,
): Promise<CustomerLocationContext | null> {
  const [row] = await db
    .select({
      facilityCity: FacilityTable.city,
      facilityState: FacilityTable.state,
      facilityLat: FacilityTable.latitude,
      facilityLng: FacilityTable.longitude,
      facilityPlaceId: FacilityTable.placeId,
      agencyLat: AgencyTable.primaryServiceAreaLat,
      agencyLng: AgencyTable.primaryServiceAreaLng,
      agencyName: AgencyTable.primaryServiceAreaName,
      agencyPlaceId: AgencyTable.primaryServiceAreaPlaceId,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .innerJoin(AgencyTable, eq(StaffingRequestTable.agencyId, AgencyTable.id))
    .where(eq(StaffingRequestTable.id, staffingRequestId))
    .limit(1);

  if (!row) return null;

  const lat =
    parseCoordinate(row.facilityLat) ?? parseCoordinate(row.agencyLat);
  const lng =
    parseCoordinate(row.facilityLng) ?? parseCoordinate(row.agencyLng);

  if (lat == null || lng == null) return null;

  return {
    city: row.facilityCity ?? undefined,
    state: row.facilityState ?? undefined,
    latitude: lat,
    longitude: lng,
  };
}
