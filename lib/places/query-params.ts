import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";

export type ServiceAreaRestrictionInput = {
  restrictedToServiceArea?: boolean;
  serviceAreaCenterLat?: number;
  serviceAreaCenterLng?: number;
  serviceAreaRadiusMiles?: number;
};

export function hasServiceAreaRestriction(
  input: ServiceAreaRestrictionInput,
): input is ServiceAreaRestrictionInput & {
  restrictedToServiceArea: true;
  serviceAreaCenterLat: number;
  serviceAreaCenterLng: number;
} {
  return (
    input.restrictedToServiceArea === true &&
    input.serviceAreaCenterLat != null &&
    input.serviceAreaCenterLng != null &&
    Number.isFinite(input.serviceAreaCenterLat) &&
    Number.isFinite(input.serviceAreaCenterLng)
  );
}

export function appendServiceAreaParams(
  params: URLSearchParams,
  input: ServiceAreaRestrictionInput,
): void {
  if (!hasServiceAreaRestriction(input)) return;
  params.set("centerLat", String(input.serviceAreaCenterLat));
  params.set("centerLng", String(input.serviceAreaCenterLng));
  params.set(
    "radiusMiles",
    String(input.serviceAreaRadiusMiles ?? DEFAULT_SERVICE_AREA_RADIUS_MILES),
  );
}
