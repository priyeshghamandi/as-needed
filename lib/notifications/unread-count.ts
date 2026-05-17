import { and, count, desc, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { NotificationTable } from "@/drizzle/schema";

function userScopeConditions(userId: string, agencyId?: string | null) {
  const conditions = [eq(NotificationTable.userId, userId)];

  if (agencyId) {
    conditions.push(
      or(
        isNull(NotificationTable.agencyId),
        eq(NotificationTable.agencyId, agencyId),
      )!,
    );
  }

  return conditions;
}

export async function getUnreadNotificationCount(
  userId: string,
  agencyId?: string | null,
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(NotificationTable)
    .where(
      and(...userScopeConditions(userId, agencyId), isNull(NotificationTable.readAt)),
    );

  return Number(row?.total ?? 0);
}

export async function getUnreadUrgentCritical(
  userId: string,
  agencyId?: string | null,
  since?: Date,
) {
  const conditions = [
    ...userScopeConditions(userId, agencyId),
    isNull(NotificationTable.readAt),
    inArray(NotificationTable.priority, ["urgent", "critical"]),
  ];

  if (since) {
    conditions.push(gte(NotificationTable.createdAt, since));
  }

  return db
    .select({
      id: NotificationTable.id,
      title: NotificationTable.title,
      message: NotificationTable.message,
      priority: NotificationTable.priority,
      relatedEntityType: NotificationTable.relatedEntityType,
      relatedEntityId: NotificationTable.relatedEntityId,
      createdAt: NotificationTable.createdAt,
    })
    .from(NotificationTable)
    .where(and(...conditions))
    .orderBy(desc(NotificationTable.createdAt))
    .limit(10);
}

export async function getLatestUnreadCritical(
  userId: string,
  agencyId?: string | null,
  withinDays = 7,
) {
  const since = new Date();
  since.setDate(since.getDate() - withinDays);

  const [row] = await db
    .select({
      id: NotificationTable.id,
      title: NotificationTable.title,
      message: NotificationTable.message,
      createdAt: NotificationTable.createdAt,
    })
    .from(NotificationTable)
    .where(
      and(
        ...userScopeConditions(userId, agencyId),
        isNull(NotificationTable.readAt),
        eq(NotificationTable.priority, "critical"),
        gte(NotificationTable.createdAt, since),
      ),
    )
    .orderBy(desc(NotificationTable.createdAt))
    .limit(1);

  return row ?? null;
}
