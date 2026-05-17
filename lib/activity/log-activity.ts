import { db } from "@/drizzle/db";
import { ActivityLogTable } from "@/drizzle/schema";
import type { ActivityPayload } from "@/lib/activity/types";
import {
  activityLogInputSchema,
  validateMetadataSize,
} from "@/lib/validations/activity";

export async function logActivity(input: ActivityPayload): Promise<{ id: string }> {
  const parsed = activityLogInputSchema.parse({
    ...input,
    actorUserId: input.actorUserId ?? null,
  });

  validateMetadataSize(parsed.metadata);

  const [row] = await db
    .insert(ActivityLogTable)
    .values({
      agencyId: parsed.agencyId,
      actorUserId: parsed.actorUserId ?? null,
      action: parsed.action,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      metadata: parsed.metadata ?? null,
    })
    .returning({ id: ActivityLogTable.id });

  return { id: row.id };
}
