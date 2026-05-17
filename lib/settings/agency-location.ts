import type { GeographicLocation } from "@/lib/geographic-location";

type AgencyLocationRow = {
  primaryServiceAreaName: string | null;
  primaryServiceAreaPlaceId: string | null;
  primaryServiceAreaCity: string | null;
  primaryServiceAreaState: string | null;
  primaryServiceAreaCountry: string | null;
  primaryServiceAreaLat: string | null;
  primaryServiceAreaLng: string | null;
};

export function agencyRowToGeographicLocation(
  row: AgencyLocationRow,
): GeographicLocation | null {
  if (!row.primaryServiceAreaPlaceId || !row.primaryServiceAreaName) {
    return null;
  }

  const lat = row.primaryServiceAreaLat ? Number(row.primaryServiceAreaLat) : NaN;
  const lng = row.primaryServiceAreaLng ? Number(row.primaryServiceAreaLng) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    displayName: row.primaryServiceAreaName,
    placeId: row.primaryServiceAreaPlaceId,
    city: row.primaryServiceAreaCity ?? "",
    state: row.primaryServiceAreaState ?? "",
    country: row.primaryServiceAreaCountry ?? "",
    latitude: lat,
    longitude: lng,
  };
}
