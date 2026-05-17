import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { NotificationTable } from "@/drizzle/schema";
import { buildNotificationWhereConditions } from "@/lib/notifications/list-filters";

describe("mark all read scoping", () => {
  it("NOTIF-UT-040: scoped to user", () => {
    const conditions = buildNotificationWhereConditions("user-a", "agency-a", {
      filter: "unread",
    });
    expect(conditions[0]).toEqual(eq(NotificationTable.userId, "user-a"));
  });

  it("NOTIF-UT-041: scoped only to requested user", () => {
    const conditions = buildNotificationWhereConditions("user-a", null, {});
    expect(conditions[0]).toEqual(eq(NotificationTable.userId, "user-a"));
    expect(conditions[0]).not.toEqual(eq(NotificationTable.userId, "user-b"));
  });
});
