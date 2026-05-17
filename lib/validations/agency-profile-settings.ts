import { z } from "zod";
import {
  agencyTypeValues,
  workforceSizeValues,
} from "@/lib/validations/agency-signup";
import { STAFFING_SPECIALTY_OPTIONS } from "@/lib/validations/onboarding-profile";

const specialtyEnum = z.enum(STAFFING_SPECIALTY_OPTIONS as unknown as [string, ...string[]]);

function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.enum(values).optional(),
  );
}

export const agencyProfileSettingsSchema = z.object({
  name: z.string().trim().min(2, "Agency name is required").max(255),
  phone: z.string().min(7, "Phone number is required").max(50),
  website: z
    .string()
    .max(2048)
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Enter a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .max(2048)
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Enter a valid URL (https://...)")
    .optional()
    .or(z.literal("")),
  agencyType: optionalEnum(agencyTypeValues),
  workforceSize: optionalEnum(workforceSizeValues),
  operationalContactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(120),
  operationalContactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email")),
  description: z.string().max(2000).optional().or(z.literal("")),
  staffingSpecialties: z
    .array(specialtyEnum)
    .min(1, "Select at least one staffing specialty")
    .max(8, "Maximum 8 specialties"),
});

export type AgencyProfileSettingsInput = z.infer<typeof agencyProfileSettingsSchema>;
