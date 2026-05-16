import type { ServiceArea, ServiceAreaSuggestion } from "@/lib/service-area";

/** Mock suggestions when Google Places API key is not configured. */
const MOCK_SUGGESTIONS: ServiceAreaSuggestion[] = [
  { placeId: "mock-sf-bay", label: "San Francisco Bay Area, CA", secondary: "California, United States" },
  { placeId: "mock-sf", label: "San Francisco, CA", secondary: "California, United States" },
  { placeId: "mock-oakland", label: "Oakland, CA", secondary: "California, United States" },
  { placeId: "mock-la", label: "Los Angeles, CA", secondary: "California, United States" },
  { placeId: "mock-sd", label: "San Diego, CA", secondary: "California, United States" },
  { placeId: "mock-nyc", label: "New York, NY", secondary: "New York, United States" },
  { placeId: "mock-chi", label: "Chicago, IL", secondary: "Illinois, United States" },
  { placeId: "mock-dfw", label: "Dallas–Fort Worth, TX", secondary: "Texas, United States" },
  { placeId: "mock-houston", label: "Houston, TX", secondary: "Texas, United States" },
  { placeId: "mock-phoenix", label: "Phoenix, AZ", secondary: "Arizona, United States" },
  { placeId: "mock-seattle", label: "Seattle, WA", secondary: "Washington, United States" },
  { placeId: "mock-denver", label: "Denver, CO", secondary: "Colorado, United States" },
  { placeId: "mock-miami", label: "Miami, FL", secondary: "Florida, United States" },
  { placeId: "mock-atlanta", label: "Atlanta, GA", secondary: "Georgia, United States" },
  { placeId: "mock-boston", label: "Boston, MA", secondary: "Massachusetts, United States" },
  { placeId: "mock-94110", label: "94110", secondary: "San Francisco, CA" },
  { placeId: "mock-ca", label: "California", secondary: "United States" },
  { placeId: "mock-tx", label: "Texas", secondary: "United States" },
];

const MOCK_DETAILS: Record<string, ServiceArea> = {
  "mock-sf-bay": {
    displayName: "San Francisco Bay Area, CA",
    placeId: "mock-sf-bay",
    city: "San Francisco",
    state: "CA",
    country: "US",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  "mock-sf": {
    displayName: "San Francisco, CA",
    placeId: "mock-sf",
    city: "San Francisco",
    state: "CA",
    country: "US",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  "mock-oakland": {
    displayName: "Oakland, CA",
    placeId: "mock-oakland",
    city: "Oakland",
    state: "CA",
    country: "US",
    latitude: 37.8044,
    longitude: -122.2712,
  },
  "mock-la": {
    displayName: "Los Angeles, CA",
    placeId: "mock-la",
    city: "Los Angeles",
    state: "CA",
    country: "US",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  "mock-sd": {
    displayName: "San Diego, CA",
    placeId: "mock-sd",
    city: "San Diego",
    state: "CA",
    country: "US",
    latitude: 32.7157,
    longitude: -117.1611,
  },
  "mock-nyc": {
    displayName: "New York, NY",
    placeId: "mock-nyc",
    city: "New York",
    state: "NY",
    country: "US",
    latitude: 40.7128,
    longitude: -74.006,
  },
  "mock-chi": {
    displayName: "Chicago, IL",
    placeId: "mock-chi",
    city: "Chicago",
    state: "IL",
    country: "US",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  "mock-dfw": {
    displayName: "Dallas–Fort Worth, TX",
    placeId: "mock-dfw",
    city: "Dallas",
    state: "TX",
    country: "US",
    latitude: 32.7767,
    longitude: -96.797,
  },
  "mock-houston": {
    displayName: "Houston, TX",
    placeId: "mock-houston",
    city: "Houston",
    state: "TX",
    country: "US",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  "mock-phoenix": {
    displayName: "Phoenix, AZ",
    placeId: "mock-phoenix",
    city: "Phoenix",
    state: "AZ",
    country: "US",
    latitude: 33.4484,
    longitude: -112.074,
  },
  "mock-seattle": {
    displayName: "Seattle, WA",
    placeId: "mock-seattle",
    city: "Seattle",
    state: "WA",
    country: "US",
    latitude: 47.6062,
    longitude: -122.3321,
  },
  "mock-denver": {
    displayName: "Denver, CO",
    placeId: "mock-denver",
    city: "Denver",
    state: "CO",
    country: "US",
    latitude: 39.7392,
    longitude: -104.9903,
  },
  "mock-miami": {
    displayName: "Miami, FL",
    placeId: "mock-miami",
    city: "Miami",
    state: "FL",
    country: "US",
    latitude: 25.7617,
    longitude: -80.1918,
  },
  "mock-atlanta": {
    displayName: "Atlanta, GA",
    placeId: "mock-atlanta",
    city: "Atlanta",
    state: "GA",
    country: "US",
    latitude: 33.749,
    longitude: -84.388,
  },
  "mock-boston": {
    displayName: "Boston, MA",
    placeId: "mock-boston",
    city: "Boston",
    state: "MA",
    country: "US",
    latitude: 42.3601,
    longitude: -71.0589,
  },
  "mock-94110": {
    displayName: "94110",
    placeId: "mock-94110",
    city: "San Francisco",
    state: "CA",
    country: "US",
    latitude: 37.7485,
    longitude: -122.4156,
  },
  "mock-ca": {
    displayName: "California",
    placeId: "mock-ca",
    city: "",
    state: "CA",
    country: "US",
    latitude: 36.7783,
    longitude: -119.4179,
  },
  "mock-tx": {
    displayName: "Texas",
    placeId: "mock-tx",
    city: "",
    state: "TX",
    country: "US",
    latitude: 31.9686,
    longitude: -99.9018,
  },
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ");
}

export function searchMockSuggestions(query: string): ServiceAreaSuggestion[] {
  const q = normalize(query.trim());
  if (!q) return MOCK_SUGGESTIONS.slice(0, 8);
  return MOCK_SUGGESTIONS.filter(
    (s) =>
      normalize(s.label).includes(q) ||
      (s.secondary && normalize(s.secondary).includes(q)) ||
      q.split(" ").every((part) => part.length > 0 && (normalize(s.label).includes(part) || normalize(s.secondary ?? "").includes(part))),
  ).slice(0, 8);
}

export function getMockServiceArea(placeId: string): ServiceArea | null {
  return MOCK_DETAILS[placeId] ?? null;
}

export function isMockPlaceId(placeId: string): boolean {
  return placeId.startsWith("mock-");
}
