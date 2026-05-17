import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ShiftAssignmentTable } from "@/drizzle/schema";
import { resolveActivityEntityHref } from "@/lib/activity/entity-route";

export async function resolveActivityEntityHrefAsync(
  entityType: string,
  entityId: string,
): Promise<string | null> {
  if (entityType === "shift_assignment") {
    const [row] = await db
      .select({ shiftId: ShiftAssignmentTable.shiftId })
      .from(ShiftAssignmentTable)
      .where(eq(ShiftAssignmentTable.id, entityId))
      .limit(1);

    if (row?.shiftId) return `/shifts/${row.shiftId}`;
    return null;
  }

  return resolveActivityEntityHref(entityType, entityId);
}
