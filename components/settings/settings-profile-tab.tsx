"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/primitives";
import { SettingsReadOnlyBanner } from "@/components/settings/settings-read-only-banner";
import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from "@/components/settings/settings-field";
import { updateAgencyProfileAction } from "@/actions/settings/update-agency-profile";
import {
  agencyTypeValues,
  workforceSizeValues,
} from "@/lib/validations/agency-signup";
import {
  agencyProfileSettingsSchema,
  type AgencyProfileSettingsInput,
} from "@/lib/validations/agency-profile-settings";
import { STAFFING_SPECIALTY_OPTIONS } from "@/lib/validations/onboarding-profile";
import type { AgencySettingsDto } from "@/lib/settings/queries";

export function SettingsProfileTab({
  profile,
  canManage,
  onSaved,
  onDirtyChange,
}: {
  profile: AgencySettingsDto["profile"];
  canManage: boolean;
  onSaved: (message: string) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(agencyProfileSettingsSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      logoUrl: profile.logoUrl ?? "",
      agencyType: (profile.agencyType as AgencyProfileSettingsInput["agencyType"]) ?? undefined,
      workforceSize:
        (profile.workforceSize as AgencyProfileSettingsInput["workforceSize"]) ?? undefined,
      operationalContactName: profile.operationalContactName ?? "",
      operationalContactEmail: profile.operationalContactEmail ?? "",
      description: profile.description ?? "",
      staffingSpecialties: profile.staffingSpecialties,
    },
  });

  const specialties = watch("staffingSpecialties") ?? [];

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  function toggleSpecialty(s: string) {
    if (!canManage) return;
    if (specialties.includes(s)) {
      setValue(
        "staffingSpecialties",
        specialties.filter((x) => x !== s),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue("staffingSpecialties", [...specialties, s], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }

  async function onSubmit(data: unknown) {
    setServerError(null);
    const parsed = agencyProfileSettingsSchema.safeParse(data);
    if (!parsed.success) return;
    const result = await updateAgencyProfileAction(parsed.data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset(parsed.data);
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

      <SettingsField label="Agency name" error={errors.name?.message}>
        <SettingsInput {...register("name")} disabled={!canManage} />
      </SettingsField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsField label="Agency phone" error={errors.phone?.message}>
          <SettingsInput {...register("phone")} type="tel" disabled={!canManage} />
        </SettingsField>
        <SettingsField label="Website" sub="optional" error={errors.website?.message}>
          <SettingsInput {...register("website")} disabled={!canManage} />
        </SettingsField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsField label="Agency type" sub="optional" error={errors.agencyType?.message}>
          <SettingsSelect {...register("agencyType")} disabled={!canManage} defaultValue="">
            <option value="">—</option>
            {agencyTypeValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>
        <SettingsField label="Workforce size" sub="optional" error={errors.workforceSize?.message}>
          <SettingsSelect {...register("workforceSize")} disabled={!canManage}>
            <option value="">—</option>
            {workforceSizeValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsField
          label="Operational contact name"
          error={errors.operationalContactName?.message}
        >
          <SettingsInput {...register("operationalContactName")} disabled={!canManage} />
        </SettingsField>
        <SettingsField
          label="Operational contact email"
          error={errors.operationalContactEmail?.message}
        >
          <SettingsInput {...register("operationalContactEmail")} type="email" disabled={!canManage} />
        </SettingsField>
      </div>

      <SettingsField label="Logo URL" sub="optional" error={errors.logoUrl?.message}>
        <SettingsInput {...register("logoUrl")} disabled={!canManage} />
      </SettingsField>

      <SettingsField label="Agency description" sub="optional" error={errors.description?.message}>
        <SettingsTextarea {...register("description")} rows={3} disabled={!canManage} />
      </SettingsField>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[12px] font-medium tracking-tight text-ink-800">
            Staffing specialties
          </div>
          <div className="text-[10px] font-mono text-ink-500">Select at least 1</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAFFING_SPECIALTY_OPTIONS.map((s) => {
            const on = specialties.includes(s);
            return (
              <button
                key={s}
                type="button"
                disabled={!canManage}
                onClick={() => toggleSpecialty(s)}
                className={`inline-flex items-center gap-1.5 px-3 min-h-11 h-11 rounded-full text-[12px] font-medium border transition disabled:opacity-50 ${
                  on
                    ? "bg-teal-700 border-teal-700 text-white"
                    : "bg-white border-ink-200 text-ink-700 hover:border-teal-400"
                }`}
              >
                {on ? <Icon name="check" className="w-3 h-3" strokeWidth={2.5} /> : null}
                {s}
              </button>
            );
          })}
        </div>
        {errors.staffingSpecialties ? (
          <p className="mt-1.5 text-[11px] font-mono text-rose-600">
            {errors.staffingSpecialties.message}
          </p>
        ) : null}
      </div>

      {canManage ? (
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-11 h-11 px-5 rounded-lg bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
