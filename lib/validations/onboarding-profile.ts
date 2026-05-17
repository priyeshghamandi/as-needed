import { z } from "zod";

const STAFFING_SPECIALTIES = [
  "RN Staffing",
  "CNA Staffing",
  "LPN Staffing",
  "Allied Health",
  "Per Diem",
  "Travel Nursing",
  "Hospital Staffing",
  "Hospice Staffing",
  "Home Health",
  "Long-Term Care",
] as const;

export const STAFFING_SPECIALTY_OPTIONS = STAFFING_SPECIALTIES;

export const onboardingProfileSchema = z.object({
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
    .array(z.string())
    .min(1, "Select at least one staffing specialty")
    .max(8, "Maximum 8 specialties"),
});

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
