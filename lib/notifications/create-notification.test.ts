import { describe, expect, it } from "vitest";
import { createNotificationSchema } from "@/lib/validations/notification";

describe("createNotification schema", () => {
  const base = {
    userId: "11111111-1111-4111-8111-111111111111",
    title: "Test",
    message: "Hello",
  };

  it("NOTIF-UT-002: title > 120 chars", () => {
    const result = createNotificationSchema.safeParse({
      ...base,
      title: "x".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("NOTIF-UT-003: message > 2000 chars", () => {
    const result = createNotificationSchema.safeParse({
      ...base,
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("NOTIF-UT-004: default priority info", () => {
    const result = createNotificationSchema.parse(base);
    expect(result.priority).toBeUndefined();
  });

  it("NOTIF-UT-005: invalid priority", () => {
    const result = createNotificationSchema.safeParse({
      ...base,
      priority: "high",
    });
    expect(result.success).toBe(false);
  });

  it("NOTIF-UT-006: trims title/message", () => {
    const result = createNotificationSchema.parse({
      ...base,
      title: "  Trimmed  ",
      message: "  Body  ",
    });
    expect(result.title).toBe("Trimmed");
    expect(result.message).toBe("Body");
  });

  it("NOTIF-VAL-01: empty title", () => {
    expect(createNotificationSchema.safeParse({ ...base, title: "" }).success).toBe(false);
  });

  it("NOTIF-VAL-02: empty message", () => {
    expect(createNotificationSchema.safeParse({ ...base, message: "" }).success).toBe(false);
  });
});
