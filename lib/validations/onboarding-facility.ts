import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";

export const FACILITY_TYPES = [
  "hospital",
  "nursing_home",
  "clinic",
  "assisted_living",
  "home_healthcare",
  "other",
] as const;

export const FACILITY_TYPE_LABELS: Record<(typeof FACILITY_TYPES)[number], string> = {
  hospital: "Hospital",
  nursing_home: "Nursing Home",
  clinic: "Clinic",
  assisted_living: "Assisted Living",
  home_healthcare: "Home Healthcare",
  other: "Other",
};

export const onboardingFacilitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  type: z.enum(FACILITY_TYPES),
  location: geographicLocationSchema,
  contactName: z.string().min(2, "Contact name must be at least 2 characters").max(120),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email")),
  contactPhone: z.string().min(7, "Phone must be at least 7 digits").max(50),
  inviteContact: z.boolean().default(true),
});

export type OnboardingFacilityInput = z.infer<typeof onboardingFacilitySchema>;
