import { NextResponse } from "next/server";
import { fetchPlaceDetails, hasGooglePlacesApiKey } from "@/lib/places/google-places";
import { getMockServiceArea, isMockPlaceId } from "@/lib/places/mock-suggestions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  if (isMockPlaceId(placeId) || !hasGooglePlacesApiKey()) {
    const area = getMockServiceArea(placeId);
    if (!area) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    return NextResponse.json({ area, source: "mock" });
  }

  const area = await fetchPlaceDetails(placeId);
  if (!area) {
    const fallback = getMockServiceArea(placeId);
    if (fallback) {
      return NextResponse.json({ area: fallback, source: "mock" });
    }
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ area, source: "google" });
}
