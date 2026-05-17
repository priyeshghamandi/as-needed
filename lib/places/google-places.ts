import type {
  GeographicLocation,
  GeographicLocationSuggestion,
} from "@/lib/geographic-location";
import {
  GOOGLE_PLACES_MAX_RADIUS_METERS,
  milesToMeters,
  type ServiceAreaSearchBounds,
} from "@/lib/places/service-area-bounds";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACES_BASE_URL = "https://places.googleapis.com/v1/places";

/** Geographic types only — no businesses or points of interest. */
const INCLUDED_PRIMARY_TYPES = [
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "postal_code",
  "country",
] as const;

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
}

export function hasGooglePlacesApiKey(): boolean {
  return Boolean(getApiKey());
}

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
  long_name?: string;
  short_name?: string;
};

function componentText(c: AddressComponent, preferShort = false): string {
  if (preferShort && c.shortText) return c.shortText;
  if (c.longText) return c.longText;
  if (preferShort && c.short_name) return c.short_name;
  return c.long_name ?? "";
}

function parseAddressComponents(
  components: AddressComponent[],
): Pick<GeographicLocation, "city" | "state" | "country"> {
  let city = "";
  let state = "";
  let country = "";

  for (const c of components) {
    const types = c.types ?? [];
    if (types.includes("locality")) {
      city = componentText(c) || city;
    } else if (types.includes("postal_town") && !city) {
      city = componentText(c);
    } else if (types.includes("administrative_area_level_1")) {
      state = componentText(c, true) || componentText(c);
    } else if (types.includes("country")) {
      country = componentText(c, true) || componentText(c);
    }
  }

  return { city, state, country };
}

export async function autocompletePlaces(
  input: string,
  bounds?: ServiceAreaSearchBounds,
): Promise<GeographicLocationSuggestion[]> {
  const apiKey = getApiKey();
  if (!apiKey || !input.trim()) return [];

  const body: Record<string, unknown> = {
    input: input.trim(),
    includedPrimaryTypes: [...INCLUDED_PRIMARY_TYPES],
    languageCode: "en",
  };

  if (bounds) {
    const radiusMeters = Math.min(
      milesToMeters(bounds.radiusMiles),
      GOOGLE_PLACES_MAX_RADIUS_METERS,
    );
    body.locationRestriction = {
      circle: {
        center: {
          latitude: bounds.latitude,
          longitude: bounds.longitude,
        },
        radius: radiusMeters,
      },
    };
  }

  const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Places autocomplete error", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  const out: GeographicLocationSuggestion[] = [];
  for (const s of data.suggestions ?? []) {
    const p = s.placePrediction;
    if (!p?.placeId) continue;
    const label =
      p.structuredFormat?.mainText?.text ?? p.text?.text ?? "";
    if (!label) continue;
    out.push({
      placeId: p.placeId,
      label,
      secondary: p.structuredFormat?.secondaryText?.text,
    });
  }
  return out;
}

export async function fetchPlaceDetails(
  placeId: string,
): Promise<GeographicLocation | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const res = await fetch(`${PLACES_BASE_URL}/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,addressComponents,location",
    },
  });

  if (!res.ok) {
    console.error("Places details error", res.status, await res.text());
    return null;
  }

  const place = (await res.json()) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    addressComponents?: AddressComponent[];
    location?: { latitude?: number; longitude?: number };
  };

  const displayName = place.displayName?.text ?? place.formattedAddress ?? "";
  const { city, state, country } = parseAddressComponents(place.addressComponents ?? []);
  const latitude = place.location?.latitude ?? 0;
  const longitude = place.location?.longitude ?? 0;

  return {
    displayName,
    placeId: place.id ?? placeId,
    city,
    state,
    country,
    latitude,
    longitude,
  };
}
