import { db } from "@/drizzle/db";
import { NotificationTable } from "@/drizzle/schema";
import { dispatchNotificationEmails } from "@/lib/email/dispatch-notification-email";
import { createNotificationSchema } from "@/lib/validations/notification";
import type { NotificationPayload } from "@/lib/notifications/types";

async function sendNotificationEmailsSafely(
  items: Parameters<typeof dispatchNotificationEmails>[0],
): Promise<void> {
  try {
    await dispatchNotificationEmails(items);
  } catch (error) {
    console.error("Failed to send notification email", error);
  }
}

export async function createNotification(
  input: NotificationPayload,
): Promise<{ id: string }> {
  const parsed = createNotificationSchema.parse({
    ...input,
    agencyId: input.agencyId ?? null,
    relatedEntityType: input.relatedEntityType || undefined,
    relatedEntityId: input.relatedEntityId || undefined,
  });

  const [row] = await db
    .insert(NotificationTable)
    .values({
      userId: parsed.userId,
      agencyId: parsed.agencyId ?? null,
      title: parsed.title,
      message: parsed.message,
      priority: parsed.priority ?? "info",
      relatedEntityType: parsed.relatedEntityType ?? null,
      relatedEntityId: parsed.relatedEntityId ?? null,
    })
    .returning({ id: NotificationTable.id });

  void sendNotificationEmailsSafely([
    {
      userId: parsed.userId,
      title: parsed.title,
      message: parsed.message,
      priority: parsed.priority ?? "info",
      relatedEntityType: parsed.relatedEntityType ?? null,
      relatedEntityId: parsed.relatedEntityId ?? null,
    },
  ]);

  return { id: row.id };
}

export async function createNotificationsForUsers(
  userIds: string[],
  payload: Omit<NotificationPayload, "userId">,
): Promise<{ ids: string[] }> {
  if (userIds.length === 0) return { ids: [] };

  const base = createNotificationSchema.omit({ userId: true }).parse({
    ...payload,
    agencyId: payload.agencyId ?? null,
    relatedEntityType: payload.relatedEntityType || undefined,
    relatedEntityId: payload.relatedEntityId || undefined,
  });

  const rows = await db
    .insert(NotificationTable)
    .values(
      userIds.map((userId) => ({
        userId,
        agencyId: base.agencyId ?? null,
        title: base.title,
        message: base.message,
        priority: base.priority ?? "info",
        relatedEntityType: base.relatedEntityType ?? null,
        relatedEntityId: base.relatedEntityId ?? null,
      })),
    )
    .returning({ id: NotificationTable.id });

  void sendNotificationEmailsSafely(
    userIds.map((userId) => ({
      userId,
      title: base.title,
      message: base.message,
      priority: base.priority ?? "info",
      relatedEntityType: base.relatedEntityType ?? null,
      relatedEntityId: base.relatedEntityId ?? null,
    })),
  );

  return { ids: rows.map((r) => r.id) };
}
