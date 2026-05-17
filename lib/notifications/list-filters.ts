import { and, eq, isNull, lt, or, type SQL } from "drizzle-orm";
import { NotificationTable } from "@/drizzle/schema";
import type { NotificationPriority } from "@/lib/notifications/types";

export const NOTIFICATION_PAGE_SIZE = 25;

export type NotificationReadFilter = "all" | "unread";

export interface NotificationListParams {
  filter?: NotificationReadFilter;
  priority?: NotificationPriority;
  cursor?: string;
}

export function parseNotificationListParams(searchParams: URLSearchParams): NotificationListParams {
  const filterRaw = searchParams.get("filter");
  const filter =
    filterRaw === "unread" ? "unread" : "all";

  const priorityRaw = searchParams.get("priority");
  const priority =
    priorityRaw === "info" ||
    priorityRaw === "important" ||
    priorityRaw === "urgent" ||
    priorityRaw === "critical"
      ? priorityRaw
      : undefined;

  const cursor = searchParams.get("cursor")?.trim() || undefined;

  return { filter, priority, cursor };
}

export function buildNotificationWhereConditions(
  userId: string,
  agencyId: string | null | undefined,
  params: Pick<NotificationListParams, "filter" | "priority" | "cursor">,
): SQL[] {
  const conditions: SQL[] = [eq(NotificationTable.userId, userId)];

  if (agencyId) {
    conditions.push(
      or(
        isNull(NotificationTable.agencyId),
        eq(NotificationTable.agencyId, agencyId),
      )!,
    );
  }

  if (params.filter === "unread") {
    conditions.push(isNull(NotificationTable.readAt));
  }

  if (params.priority) {
    conditions.push(eq(NotificationTable.priority, params.priority));
  }

  if (params.cursor) {
    const [createdAt, id] = params.cursor.split("|");
    if (createdAt && id) {
      conditions.push(
        or(
          lt(NotificationTable.createdAt, new Date(createdAt)),
          and(
            eq(NotificationTable.createdAt, new Date(createdAt)),
            lt(NotificationTable.id, id),
          ),
        )!,
      );
    }
  }

  return conditions;
}

export function encodeNotificationCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}

export function buildListQueryString(params: {
  filter?: NotificationReadFilter;
  priority?: NotificationPriority;
  cursor?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.filter === "unread") sp.set("filter", "unread");
  if (params.priority) sp.set("priority", params.priority);
  if (params.cursor) sp.set("cursor", params.cursor);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
