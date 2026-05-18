"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import type { GeographicLocation } from "@/lib/geographic-location";
import type { ServiceAreaRestrictionInput } from "@/lib/places/query-params";

export function MarketplaceLocationFix({
  professionalId,
  serviceArea,
  reason,
}: {
  professionalId: string;
  serviceArea: ServiceAreaRestrictionInput;
  reason: "missing_place" | "out_of_area";
}) {
  const router = useRouter();
  const [location, setLocation] = useState<GeographicLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!location?.placeId) {
      setError("Select a location from the suggestions.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/workforce/${professionalId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save location.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
      <p className="text-[13px] text-amber-900 font-medium">
        {reason === "missing_place"
          ? "This professional needs a validated location (Google Places)."
          : "This professional’s location is outside your agency service area."}
      </p>
      <p className="text-[12px] text-amber-800">
        Search and select a city or address within your agency service area, then save.
      </p>
      <LocationAutocomplete
        value={location}
        onChange={(loc) => {
          setLocation(loc);
          setError(null);
        }}
        placeholder="Search city, metro, or ZIP"
        {...serviceArea}
      />
      {error ? (
        <p className="text-[12px] text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending || !location?.placeId}
        onClick={() => void save()}
        className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save validated location"}
      </button>
    </div>
  );
}
