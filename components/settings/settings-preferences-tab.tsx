"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsReadOnlyBanner } from "@/components/settings/settings-read-only-banner";
import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
} from "@/components/settings/settings-field";
import { updateAgencyPreferencesAction } from "@/actions/settings/update-agency-preferences";
import {
  agencyPreferencesSchema,
  type AgencyPreferences,
} from "@/lib/validations/agency-preferences";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
] as const;

export function SettingsPreferencesTab({
  preferences,
  canManage,
  onSaved,
  onDirtyChange,
}: {
  preferences: AgencyPreferences;
  canManage: boolean;
  onSaved: (message: string) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AgencyPreferences>({
    resolver: zodResolver(agencyPreferencesSchema),
    defaultValues: preferences,
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(data: AgencyPreferences) {
    setServerError(null);
    const result = await updateAgencyPreferencesAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset(data);
    onSaved("Settings saved");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!canManage ? <SettingsReadOnlyBanner /> : null}
      {serverError ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {serverError}
        </p>
      ) : null}

      <SettingsField label="Timezone" error={errors.timezone?.message}>
        <SettingsInput {...register("timezone")} disabled={!canManage} list="tz-list" />
        <datalist id="tz-list">
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz} />
          ))}
        </datalist>
      </SettingsField>

      <SettingsField label="Week starts on" error={errors.weekStartsOn?.message}>
        <SettingsSelect {...register("weekStartsOn", { valueAsNumber: true })} disabled={!canManage}>
          <option value={0}>Sunday</option>
          <option value={1}>Monday</option>
        </SettingsSelect>
      </SettingsField>

      <SettingsField
        label="Default notification priority floor"
        error={errors.defaultNotificationPriorityFloor?.message}
      >
        <SettingsSelect
          {...register("defaultNotificationPriorityFloor")}
          disabled={!canManage}
        >
          <option value="info">Info</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </SettingsSelect>
      </SettingsField>

      <SettingsField label="Date format" error={errors.dateFormat?.message}>
        <SettingsSelect {...register("dateFormat")} disabled={!canManage}>
          <option value="mdy">MM/DD/YYYY</option>
          <option value="dmy">DD/MM/YYYY</option>
        </SettingsSelect>
      </SettingsField>

      <label className="flex items-center gap-3 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          {...register("showCriticalBannerOnDashboard")}
          disabled={!canManage}
          className="w-4 h-4 rounded border-ink-300"
        />
        <span className="text-[13px] text-ink-800">Show critical alerts banner on dashboard</span>
      </label>

      {canManage ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-11 h-11 px-5 rounded-lg bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      ) : null}
    </form>
  );
}
