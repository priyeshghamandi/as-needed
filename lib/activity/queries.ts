import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ActivityLogTable, UserTable } from "@/drizzle/schema";
import { activityEntityTypeLabel } from "@/lib/activity/entity-route";
import { resolveActivityEntityHrefAsync } from "@/lib/activity/entity-route-server";
import { formatActivityAction } from "@/lib/activity/format-action";
import {
  ACTIVITY_DEFAULT_LIMIT,
  ACTIVITY_ENTITY_PAGE_SIZE,
  buildActivityWhereConditions,
  encodeActivityCursor,
  type ActivityListParams,
} from "@/lib/activity/list-filters";
import type { ActivityLogItem } from "@/lib/activity/types";

async function mapRows(
  rows: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorName: string | null;
    createdAt: Date;
    metadata: Record<string, unknown> | null;
  }[],
): Promise<ActivityLogItem[]> {
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      actorName: row.actorName,
      createdAt: row.createdAt.toISOString(),
      metadata: row.metadata,
      actionLabel: formatActivityAction(row.action),
      entityLabel: activityEntityTypeLabel(row.entityType),
      href: await resolveActivityEntityHrefAsync(row.entityType, row.entityId),
    })),
  );
}

export async function listActivityLogs(agencyId: string, params: ActivityListParams = {}) {
  const limit = params.limit ?? ACTIVITY_DEFAULT_LIMIT;
  const conditions = buildActivityWhereConditions(agencyId, params);
  const where = and(...conditions);

  const rows = await db
    .select({
      id: ActivityLogTable.id,
      action: ActivityLogTable.action,
      entityType: ActivityLogTable.entityType,
      entityId: ActivityLogTable.entityId,
      actorName: UserTable.name,
      createdAt: ActivityLogTable.createdAt,
      metadata: ActivityLogTable.metadata,
    })
    .from(ActivityLogTable)
    .leftJoin(UserTable, eq(ActivityLogTable.actorUserId, UserTable.id))
    .where(where)
    .orderBy(desc(ActivityLogTable.createdAt), desc(ActivityLogTable.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const items = await mapRows(pageRows);

  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last ? encodeActivityCursor(last.createdAt, last.id) : null;

  return { items, nextCursor, hasMore };
}

export async function listEntityActivityLogs(
  agencyId: string,
  entityType: string,
  entityId: string,
  cursor?: string,
) {
  return listActivityLogs(agencyId, {
    limit: ACTIVITY_ENTITY_PAGE_SIZE,
    entityType,
    entityId,
    cursor,
  });
}

export async function getRecentActivityForDashboard(agencyId: string, limit = ACTIVITY_DEFAULT_LIMIT) {
  return listActivityLogs(agencyId, { limit });
}

export async function countActivityLogs(agencyId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(ActivityLogTable)
    .where(eq(ActivityLogTable.agencyId, agencyId));

  return Number(row?.total ?? 0);
}
