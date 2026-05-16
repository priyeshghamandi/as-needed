/** Geographic service area selected from Places (or mock) autocomplete. */
export type ServiceArea = {
  displayName: string;
  placeId: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type ServiceAreaSuggestion = {
  placeId: string;
  label: string;
  secondary?: string;
};
