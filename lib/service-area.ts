import type {
  GeographicLocation,
  GeographicLocationSuggestion,
} from "@/lib/geographic-location";

export type { GeographicLocation, GeographicLocationSuggestion };

/** @deprecated Use `GeographicLocation`. */
export type ServiceArea = GeographicLocation;

/** @deprecated Use `GeographicLocationSuggestion`. */
export type ServiceAreaSuggestion = GeographicLocationSuggestion;
