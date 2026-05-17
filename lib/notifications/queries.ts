import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { NotificationTable } from "@/drizzle/schema";
import {
  buildNotificationWhereConditions,
  encodeNotificationCursor,
  NOTIFICATION_PAGE_SIZE,
  type NotificationListParams,
} from "@/lib/notifications/list-filters";
import {
  relatedEntityLabel,
  resolveNotificationEntityHrefAsync,
} from "@/lib/notifications/entity-route";
import type { NotificationPriority } from "@/lib/notifications/types";

export type NotificationListItem = {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  readAt: string | null;
  createdAt: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  relatedEntityLabel: string | null;
  href: string;
};

export async function listNotifications(
  userId: string,
  agencyId: string | null | undefined,
  params: NotificationListParams,
) {
  const conditions = buildNotificationWhereConditions(userId, agencyId, params);
  const where = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(NotificationTable)
    .where(where);

  const total = Number(totalRow?.total ?? 0);

  const rows = await db
    .select({
      id: NotificationTable.id,
      title: NotificationTable.title,
      message: NotificationTable.message,
      priority: NotificationTable.priority,
      readAt: NotificationTable.readAt,
      createdAt: NotificationTable.createdAt,
      relatedEntityType: NotificationTable.relatedEntityType,
      relatedEntityId: NotificationTable.relatedEntityId,
    })
    .from(NotificationTable)
    .where(where)
    .orderBy(desc(NotificationTable.createdAt), desc(NotificationTable.id))
    .limit(NOTIFICATION_PAGE_SIZE + 1);

  const hasMore = rows.length > NOTIFICATION_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, NOTIFICATION_PAGE_SIZE) : rows;

  const items: NotificationListItem[] = await Promise.all(
    pageRows.map(async (row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      priority: row.priority,
      readAt: row.readAt ? row.readAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      relatedEntityType: row.relatedEntityType,
      relatedEntityId: row.relatedEntityId,
      relatedEntityLabel: relatedEntityLabel(row.relatedEntityType),
      href: await resolveNotificationEntityHrefAsync(
        row.relatedEntityType,
        row.relatedEntityId,
      ),
    })),
  );

  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeNotificationCursor(last.createdAt, last.id)
      : null;

  return { items, total, nextCursor, hasMore };
}
