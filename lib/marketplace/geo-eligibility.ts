import {
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
  isWithinServiceArea,
  type ServiceAreaCenter,
} from "@/lib/places/service-area-bounds";
import type { CustomerLocationContext } from "@/lib/marketplace/types";

export type GeoPoint = {
  latitude: number | null;
  longitude: number | null;
};

export function hasValidGeoPoint(point: GeoPoint): boolean {
  return (
    point.latitude != null &&
    point.longitude != null &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude)
  );
}

export function isCustomerLocationValid(
  location: CustomerLocationContext | null | undefined,
): location is CustomerLocationContext {
  if (!location) return false;
  return Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
}

/** Professional must be within agency service area from agency center. */
export function isProfessionalInAgencyServiceArea(
  professional: GeoPoint,
  agencyCenter: ServiceAreaCenter,
  agencyRadiusMiles: number,
): boolean {
  if (!hasValidGeoPoint(professional)) return false;
  return isWithinServiceArea(
    { latitude: professional.latitude!, longitude: professional.longitude! },
    agencyCenter,
    agencyRadiusMiles,
  );
}

/** Customer location must be within agency service area (discovery coverage). */
export function isCustomerInAgencyServiceArea(
  customer: CustomerLocationContext,
  agencyCenter: ServiceAreaCenter,
  agencyRadiusMiles: number,
): boolean {
  return isWithinServiceArea(
    { latitude: customer.latitude, longitude: customer.longitude },
    agencyCenter,
    agencyRadiusMiles,
  );
}

/**
 * Professional is discoverable for a customer when both are within the agency
 * service area and the customer is within radius of the professional.
 */
export function isGeoEligible(params: {
  professional: GeoPoint;
  agencyCenter: ServiceAreaCenter;
  agencyRadiusMiles: number;
  customerLocation: CustomerLocationContext;
}): boolean {
  const { professional, agencyCenter, agencyRadiusMiles, customerLocation } = params;

  if (!hasValidGeoPoint(professional) || !isCustomerLocationValid(customerLocation)) {
    return false;
  }

  const radius = agencyRadiusMiles || DEFAULT_SERVICE_AREA_RADIUS_MILES;

  if (!isProfessionalInAgencyServiceArea(professional, agencyCenter, radius)) {
    return false;
  }

  if (!isCustomerInAgencyServiceArea(customerLocation, agencyCenter, radius)) {
    return false;
  }

  return isWithinServiceArea(
    { latitude: customerLocation.latitude, longitude: customerLocation.longitude },
    {
      latitude: professional.latitude!,
      longitude: professional.longitude!,
    },
    radius,
  );
}
