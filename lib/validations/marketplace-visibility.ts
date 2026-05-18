import { z } from "zod";

export const marketplaceVisibilityPatchSchema = z.object({
  isMarketplaceVisible: z.boolean(),
});

export type MarketplaceVisibilityPatchInput = z.infer<
  typeof marketplaceVisibilityPatchSchema
>;

export const marketplaceVisibilityBulkSchema = z.object({
  professionalIds: z.array(z.string().uuid()).min(1).max(50),
  isMarketplaceVisible: z.boolean(),
});

export type MarketplaceVisibilityBulkInput = z.infer<
  typeof marketplaceVisibilityBulkSchema
>;
