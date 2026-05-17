import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { NotificationTable } from "@/drizzle/schema";
import { buildNotificationWhereConditions } from "@/lib/notifications/list-filters";

describe("notification scoping", () => {
  it("NOTIF-UT-030 helper: list scoped by user_id", () => {
    const conditions = buildNotificationWhereConditions("user-a", "agency-a", {});
    expect(conditions[0]).toEqual(eq(NotificationTable.userId, "user-a"));
  });

  it("NOTIF-UT-011: unread filter adds extra condition", () => {
    const all = buildNotificationWhereConditions("user-a", null, { filter: "all" });
    const unread = buildNotificationWhereConditions("user-a", null, { filter: "unread" });
    expect(unread.length).toBeGreaterThan(all.length);
  });

  it("NOTIF-UT-012: agency scope when agency present", () => {
    const conditions = buildNotificationWhereConditions("user-a", "agency-a", {});
    expect(conditions.length).toBeGreaterThan(1);
  });
});
