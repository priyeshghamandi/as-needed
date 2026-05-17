import { z } from "zod";

export const geographicLocationSchema = z.object({
  displayName: z.string().min(1),
  placeId: z.string().min(1),
  city: z.string(),
  state: z.string(),
  country: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

export type GeographicLocationInput = z.infer<typeof geographicLocationSchema>;
