import type { GeographicLocation } from "@/lib/geographic-location";

export const MARKETPLACE_LOCATION_COOKIE = "marketplace_location";
export const MARKETPLACE_LOCATION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type MarketplaceLocationCookie = Pick<
  GeographicLocation,
  "displayName" | "placeId" | "city" | "state" | "latitude" | "longitude"
>;

export function parseMarketplaceLocationCookie(
  value: string | undefined,
): MarketplaceLocationCookie | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as MarketplaceLocationCookie;
    if (
      !parsed.placeId ||
      !Number.isFinite(parsed.latitude) ||
      !Number.isFinite(parsed.longitude)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function serializeMarketplaceLocationCookie(
  location: MarketplaceLocationCookie,
): string {
  return JSON.stringify(location);
}
