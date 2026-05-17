import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";

export const agencyServiceAreaSettingsSchema = z.object({
  primaryServiceArea: geographicLocationSchema,
  serviceAreaRadiusMiles: z
    .number()
    .int("Radius must be a whole number")
    .min(10, "Minimum radius is 10 miles")
    .max(75, "Maximum radius is 75 miles"),
});

export type AgencyServiceAreaSettingsInput = z.infer<
  typeof agencyServiceAreaSettingsSchema
>;
