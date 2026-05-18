import { cookies } from "next/headers";
import {
  MARKETPLACE_LOCATION_COOKIE,
  parseMarketplaceLocationCookie,
} from "@/lib/marketplace/location-cookie";
import type { CustomerLocationContext } from "@/lib/marketplace/types";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";

export async function getMarketplaceCustomerLocation(): Promise<CustomerLocationContext | null> {
  const jar = await cookies();
  const raw = jar.get(MARKETPLACE_LOCATION_COOKIE)?.value;
  const parsed = parseMarketplaceLocationCookie(raw);
  if (!isCustomerLocationValid(parsed)) return null;
  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    city: parsed.city,
    state: parsed.state,
  };
}
