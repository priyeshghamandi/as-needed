import { inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { sendEmail } from "@/lib/email/send-email";
import {
  buildNotificationEmail,
  shouldEmailNotificationPriority,
} from "@/lib/email/notification-email";
import { resolveNotificationEntityHref } from "@/lib/notifications/entity-route";
import type { NotificationPriority } from "@/lib/notifications/types";

export type NotificationEmailItem = {
  userId: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

export async function dispatchNotificationEmails(
  items: NotificationEmailItem[],
): Promise<void> {
  const eligible = items.filter((item) =>
    shouldEmailNotificationPriority(item.priority),
  );
  if (eligible.length === 0) return;

  const userIds = [...new Set(eligible.map((item) => item.userId))];
  const users = await db
    .select({
      id: UserTable.id,
      email: UserTable.email,
      name: UserTable.name,
    })
    .from(UserTable)
    .where(inArray(UserTable.id, userIds));

  const usersById = new Map(users.map((user) => [user.id, user]));

  await Promise.all(
    eligible.map(async (item) => {
      const user = usersById.get(item.userId);
      if (!user?.email) return;

      const actionHref = resolveNotificationEntityHref(
        item.relatedEntityType,
        item.relatedEntityId,
      );
      const content = buildNotificationEmail({
        title: item.title,
        message: item.message,
        priority: item.priority,
        actionHref,
        recipientName: user.name,
      });

      await sendEmail({
        to: user.email,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    }),
  );
}
