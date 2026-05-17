"use client";

import { LocationAutocomplete } from "@/components/location-autocomplete";
import type { GeographicLocation } from "@/lib/geographic-location";

type ServiceAreaAutocompleteProps = {
  value: GeographicLocation | null;
  onChange: (area: GeographicLocation | null) => void;
  disabled?: boolean;
};

/** Agency primary service area — geographic Places autocomplete. */
export function ServiceAreaAutocomplete(props: ServiceAreaAutocompleteProps) {
  return (
    <LocationAutocomplete
      {...props}
      placeholder="Search city, metro, state, or ZIP"
    />
  );
}
