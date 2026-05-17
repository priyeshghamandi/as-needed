import { and, eq, like, lt, or, type SQL } from "drizzle-orm";
import { ActivityLogTable } from "@/drizzle/schema";

export const ACTIVITY_DEFAULT_LIMIT = 15;
export const ACTIVITY_MAX_LIMIT = 50;
export const ACTIVITY_ENTITY_PAGE_SIZE = 20;

export interface ActivityListParams {
  limit?: number;
  cursor?: string;
  entityType?: string;
  entityId?: string;
  actionPrefix?: string;
}

export function parseActivityListParams(searchParams: URLSearchParams): ActivityListParams {
  const limitRaw = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, limitRaw), ACTIVITY_MAX_LIMIT)
    : ACTIVITY_DEFAULT_LIMIT;

  const entityType = searchParams.get("entityType")?.trim() || undefined;
  const entityId = searchParams.get("entityId")?.trim() || undefined;
  const actionPrefix = searchParams.get("actionPrefix")?.trim() || undefined;
  const cursor = searchParams.get("cursor")?.trim() || undefined;

  return { limit, entityType, entityId, actionPrefix, cursor };
}

export function buildActivityWhereConditions(
  agencyId: string,
  params: Pick<ActivityListParams, "cursor" | "entityType" | "entityId" | "actionPrefix">,
): SQL[] {
  const conditions: SQL[] = [eq(ActivityLogTable.agencyId, agencyId)];

  if (params.entityType) {
    conditions.push(eq(ActivityLogTable.entityType, params.entityType));
  }

  if (params.entityId) {
    conditions.push(eq(ActivityLogTable.entityId, params.entityId));
  }

  if (params.actionPrefix) {
    conditions.push(like(ActivityLogTable.action, `${params.actionPrefix}%`));
  }

  if (params.cursor) {
    const [createdAt, id] = params.cursor.split("|");
    if (createdAt && id) {
      conditions.push(
        or(
          lt(ActivityLogTable.createdAt, new Date(createdAt)),
          and(
            eq(ActivityLogTable.createdAt, new Date(createdAt)),
            lt(ActivityLogTable.id, id),
          ),
        )!,
      );
    }
  }

  return conditions;
}

export function encodeActivityCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}
