import type { GeographicLocation } from "@/lib/geographic-location";

/** Default workforce search radius from agency service area center (MVP). */
export const DEFAULT_SERVICE_AREA_RADIUS_MILES = 75;

/** Google Places locationRestriction circle max radius (meters). */
export const GOOGLE_PLACES_MAX_RADIUS_METERS = 50_000;

/** Max radius for Google autocomplete restriction (~31 miles). */
export const GOOGLE_PLACES_MAX_RADIUS_MILES =
  GOOGLE_PLACES_MAX_RADIUS_METERS / 1609.344;

export const OUT_OF_SERVICE_AREA_MESSAGE =
  "This location is outside your agency's service area.";

export type ServiceAreaCenter = {
  latitude: number;
  longitude: number;
};

export type ServiceAreaSearchBounds = ServiceAreaCenter & {
  radiusMiles: number;
};

const EARTH_RADIUS_MILES = 3958.8;

/** Great-circle distance in miles between two WGS84 points. */
export function distanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

export function milesToMeters(miles: number): number {
  return miles * 1609.344;
}

export function isWithinServiceArea(
  location: Pick<GeographicLocation, "latitude" | "longitude">,
  center: ServiceAreaCenter,
  radiusMiles: number,
): boolean {
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    !Number.isFinite(center.latitude) ||
    !Number.isFinite(center.longitude)
  ) {
    return false;
  }
  const miles = distanceMiles(
    center.latitude,
    center.longitude,
    location.latitude,
    location.longitude,
  );
  return miles <= radiusMiles;
}

export function parseServiceAreaSearchParams(
  searchParams: URLSearchParams,
): ServiceAreaSearchBounds | null {
  const latRaw = searchParams.get("centerLat");
  const lngRaw = searchParams.get("centerLng");
  if (latRaw == null || lngRaw == null || latRaw === "" || lngRaw === "") {
    return null;
  }

  const centerLat = Number(latRaw);
  const centerLng = Number(lngRaw);
  const radiusMiles = Number(
    searchParams.get("radiusMiles") ?? DEFAULT_SERVICE_AREA_RADIUS_MILES,
  );

  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) {
    return null;
  }

  return {
    latitude: centerLat,
    longitude: centerLng,
    radiusMiles: Number.isFinite(radiusMiles)
      ? radiusMiles
      : DEFAULT_SERVICE_AREA_RADIUS_MILES,
  };
}
