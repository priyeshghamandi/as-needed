import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";
import {
  FACILITY_TYPES,
  FACILITY_TYPE_LABELS,
} from "@/lib/facilities/type-labels";

export { FACILITY_TYPES, FACILITY_TYPE_LABELS };

export const facilitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  type: z.enum(FACILITY_TYPES, { message: "Select a facility type" }),
  location: geographicLocationSchema,
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  postalCode: z.string().max(40).optional().or(z.literal("")),
  contactName: z.string().min(2, "Contact name must be at least 2 characters").max(120),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email")),
  contactPhone: z.string().min(7, "Phone must be at least 7 digits").max(50),
  notes: z.string().max(2000).optional().or(z.literal("")),
  inviteContact: z.boolean().default(true),
});

export type FacilityInput = z.infer<typeof facilitySchema>;

export const facilityAddFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  type: z.enum(FACILITY_TYPES, { message: "Select a facility type" }),
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  postalCode: z.string().max(40).optional().or(z.literal("")),
  contactName: z.string().min(2, "Contact name must be at least 2 characters").max(120),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email")),
  contactPhone: z.string().min(7, "Phone must be at least 7 digits").max(50),
  notes: z.string().max(2000).optional().or(z.literal("")),
  inviteContact: z.boolean().default(true),
});

export type FacilityAddFormValues = z.infer<typeof facilityAddFormSchema>;

export const updateFacilitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  type: z.enum(FACILITY_TYPES, { message: "Select a facility type" }),
  contactName: z.string().min(2, "Required").max(120),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email")),
  contactPhone: z.string().min(7, "At least 7 digits").max(50),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
