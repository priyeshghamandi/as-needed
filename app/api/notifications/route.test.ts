import { describe, expect, it } from "vitest";
import { eq, isNull } from "drizzle-orm";
import { NotificationTable } from "@/drizzle/schema";
import { buildNotificationWhereConditions } from "@/lib/notifications/list-filters";

describe("notifications API rules", () => {
  it("NOTIF-UT-031: unread filter", () => {
    const conditions = buildNotificationWhereConditions("user-a", null, {
      filter: "unread",
    });
    expect(conditions).toContainEqual(isNull(NotificationTable.readAt));
  });

  it("NOTIF-UT-032: priority filter", () => {
    const conditions = buildNotificationWhereConditions("user-a", null, {
      priority: "urgent",
    });
    expect(conditions).toContainEqual(eq(NotificationTable.priority, "urgent"));
  });
});
