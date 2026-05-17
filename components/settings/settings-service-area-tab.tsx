"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/primitives";
import { ServiceAreaAutocomplete } from "@/components/service-area-autocomplete";
import { SettingsReadOnlyBanner } from "@/components/settings/settings-read-only-banner";
import { updateAgencyServiceAreaAction } from "@/actions/settings/update-agency-service-area";
import type { GeographicLocation } from "@/lib/geographic-location";
import type { AgencySettingsDto } from "@/lib/settings/queries";

export function SettingsServiceAreaTab({
  serviceArea,
  canManage,
  onSaved,
  onDirtyChange,
}: {
  serviceArea: AgencySettingsDto["serviceArea"];
  canManage: boolean;
  onSaved: (message: string) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [location, setLocation] = useState<GeographicLocation | null>(
    serviceArea.primaryServiceArea,
  );
  const [radius, setRadius] = useState(serviceArea.serviceAreaRadiusMiles);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialRadius = serviceArea.serviceAreaRadiusMiles;
  const initialPlaceId = serviceArea.primaryServiceArea?.placeId ?? null;

  const dirty =
    radius !== initialRadius || (location?.placeId ?? null) !== initialPlaceId;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  async function handleSave() {
    setError(null);
    if (!location?.placeId) {
      setError("Select a location from the suggestions");
      return;
    }

    setSaving(true);
    const result = await updateAgencyServiceAreaAction({
      primaryServiceArea: location,
      serviceAreaRadiusMiles: radius,
    });
    setSaving(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    onSaved("Settings saved");
  }

  return (
    <div className="space-y-6">
      {!canManage ? <SettingsReadOnlyBanner /> : null}
      {error ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-[12px] text-ink-600 leading-relaxed">
        Location changes affect future validation only. Existing workforce and facilities are not
        re-validated automatically.
      </p>

      <div>
        <div className="text-[12px] font-medium tracking-tight text-ink-800 mb-1.5">
          Primary service area
        </div>
        <ServiceAreaAutocomplete
          value={location}
          onChange={setLocation}
          disabled={!canManage}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[12px] font-medium tracking-tight text-ink-800">
            Coverage radius
          </div>
          <div className="text-[13px] font-medium tabular-nums text-ink-900">{radius} miles</div>
        </div>
        <input
          type="range"
          min={10}
          max={75}
          step={5}
          value={radius}
          disabled={!canManage}
          onChange={(e) => setRadius(+e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-700 bg-ink-200 disabled:opacity-50"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 mt-1">
          <span>10 mi</span>
          <span>75 mi</span>
        </div>
      </div>

      {location ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-3 flex items-start gap-2.5">
          <Icon name="map-pin" className="w-4 h-4 text-teal-700 mt-0.5" />
          <div className="text-[12px] text-teal-900 leading-relaxed">
            <span className="font-medium">{location.displayName}</span> · {radius}-mile radius
          </div>
        </div>
      ) : null}

      {canManage ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="w-full sm:w-auto min-h-11 h-11 px-5 rounded-lg bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      ) : null}
    </div>
  );
}
