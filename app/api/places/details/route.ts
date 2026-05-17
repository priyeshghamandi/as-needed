import { NextResponse } from "next/server";
import { fetchPlaceDetails, hasGooglePlacesApiKey } from "@/lib/places/google-places";
import {
  getMockGeographicLocation,
  isMockPlaceId,
} from "@/lib/places/mock-suggestions";
import {
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
  parseServiceAreaSearchParams,
} from "@/lib/places/service-area-bounds";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();
  const bounds = parseServiceAreaSearchParams(searchParams);

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  let area = null;
  let source: "google" | "mock" = "google";

  if (isMockPlaceId(placeId) || !hasGooglePlacesApiKey()) {
    area = getMockGeographicLocation(placeId);
    source = "mock";
  } else {
    area = await fetchPlaceDetails(placeId);
    if (!area) {
      const fallback = getMockGeographicLocation(placeId);
      if (fallback) {
        area = fallback;
        source = "mock";
      }
    }
  }

  if (!area) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  if (bounds && !isWithinServiceArea(area, bounds, bounds.radiusMiles)) {
    return NextResponse.json(
      {
        error: OUT_OF_SERVICE_AREA_MESSAGE,
        code: "OUT_OF_SERVICE_AREA",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ area, source });
}
