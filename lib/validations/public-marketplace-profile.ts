import { z } from "zod";

export const publicMarketplaceProfilePatchSchema = z.object({
  headline: z.string().trim().min(1, "Headline is required").max(80, "Max 80 characters"),
  bio: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  specialties: z
    .array(z.string().trim().min(1).max(80))
    .max(12, "Max 12 specialties")
    .optional()
    .default([]),
  photoUrl: z
    .string()
    .url("Enter a valid image URL")
    .max(2048)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  credentialsSummary: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
});

export type PublicMarketplaceProfilePatchInput = z.infer<
  typeof publicMarketplaceProfilePatchSchema
>;
