import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { NotificationTable } from "@/drizzle/schema";

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<{ ok: true } | { ok: false; status: 404 | 403; message: string }> {
  const [existing] = await db
    .select({ id: NotificationTable.id, userId: NotificationTable.userId })
    .from(NotificationTable)
    .where(eq(NotificationTable.id, notificationId))
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Notification not found." };
  }

  if (existing.userId !== userId) {
    return { ok: false, status: 403, message: "You do not have access to this notification." };
  }

  await db
    .update(NotificationTable)
    .set({ readAt: new Date() })
    .where(
      and(eq(NotificationTable.id, notificationId), isNull(NotificationTable.readAt)),
    );

  return { ok: true };
}

export async function markAllNotificationsRead(
  userId: string,
  agencyId?: string | null,
): Promise<{ updated: number }> {
  const conditions = [
    eq(NotificationTable.userId, userId),
    isNull(NotificationTable.readAt),
  ];

  if (agencyId) {
    conditions.push(
      or(
        isNull(NotificationTable.agencyId),
        eq(NotificationTable.agencyId, agencyId),
      )!,
    );
  }

  const updated = await db
    .update(NotificationTable)
    .set({ readAt: new Date() })
    .where(and(...conditions))
    .returning({ id: NotificationTable.id });

  return { updated: updated.length };
}
