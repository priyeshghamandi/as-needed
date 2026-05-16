import { NextResponse } from "next/server";
import { autocompletePlaces, hasGooglePlacesApiKey } from "@/lib/places/google-places";
import { searchMockSuggestions } from "@/lib/places/mock-suggestions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [], source: hasGooglePlacesApiKey() ? "google" : "mock" });
  }

  if (hasGooglePlacesApiKey()) {
    const suggestions = await autocompletePlaces(q);
    if (suggestions.length > 0) {
      return NextResponse.json({ suggestions, source: "google" });
    }
  }

  const suggestions = searchMockSuggestions(q);
  return NextResponse.json({ suggestions, source: "mock" });
}
