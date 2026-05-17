/** Geographic place from Google Places (or mock) — cities, metros, states, ZIPs. */
export type GeographicLocation = {
  displayName: string;
  placeId: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type GeographicLocationSuggestion = {
  placeId: string;
  label: string;
  secondary?: string;
};
