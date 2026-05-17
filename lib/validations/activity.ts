import { z } from "zod";

const namespacedKey = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_.]{2,119}$/, "Invalid action or entity type format");

export const activityLogInputSchema = z.object({
  agencyId: z.string().uuid(),
  actorUserId: z.string().uuid().nullable().optional(),
  action: namespacedKey,
  entityType: namespacedKey,
  entityId: z.string().uuid(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ActivityLogInput = z.infer<typeof activityLogInputSchema>;

const MAX_METADATA_BYTES = 4096;

export function validateMetadataSize(metadata: Record<string, unknown> | undefined): void {
  if (!metadata) return;
  const size = Buffer.byteLength(JSON.stringify(metadata), "utf8");
  if (size > MAX_METADATA_BYTES) {
    throw new Error("Activity metadata exceeds 4KB limit.");
  }
}
