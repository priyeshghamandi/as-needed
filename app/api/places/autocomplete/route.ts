import { NextResponse } from "next/server";
import { autocompletePlaces, hasGooglePlacesApiKey } from "@/lib/places/google-places";
import { searchMockSuggestions } from "@/lib/places/mock-suggestions";
import { parseServiceAreaSearchParams } from "@/lib/places/service-area-bounds";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const bounds = parseServiceAreaSearchParams(searchParams);

  if (q.length < 2) {
    return NextResponse.json({
      suggestions: [],
      source: hasGooglePlacesApiKey() ? "google" : "mock",
      restricted: Boolean(bounds),
    });
  }

  if (hasGooglePlacesApiKey()) {
    const suggestions = await autocompletePlaces(q, bounds ?? undefined);
    if (suggestions.length > 0) {
      return NextResponse.json({
        suggestions,
        source: "google",
        restricted: Boolean(bounds),
      });
    }
  }

  const suggestions = searchMockSuggestions(q, bounds ?? undefined);
  return NextResponse.json({
    suggestions,
    source: "mock",
    restricted: Boolean(bounds),
  });
}
