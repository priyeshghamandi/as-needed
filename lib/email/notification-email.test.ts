import { describe, expect, it } from "vitest";
import {
  buildNotificationEmail,
  shouldEmailNotificationPriority,
} from "@/lib/email/notification-email";

describe("notification email", () => {
  it("emails important, urgent, and critical priorities only", () => {
    expect(shouldEmailNotificationPriority("info")).toBe(false);
    expect(shouldEmailNotificationPriority(undefined)).toBe(false);
    expect(shouldEmailNotificationPriority("important")).toBe(true);
    expect(shouldEmailNotificationPriority("urgent")).toBe(true);
    expect(shouldEmailNotificationPriority("critical")).toBe(true);
  });

  it("builds subject, text, and html with action link", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";

    const result = buildNotificationEmail({
      title: "Shift at risk",
      message: "REQ-123 still needs coverage.",
      priority: "urgent",
      actionHref: "/staffing-requests/abc",
      recipientName: "Alex Owner",
    });

    expect(result.subject).toBe("[AsNeeded] Shift at risk");
    expect(result.text).toContain("Hi Alex Owner,");
    expect(result.text).toContain("https://app.example.com/staffing-requests/abc");
    expect(result.html).toContain("Shift at risk");
    expect(result.html).toContain("https://app.example.com/staffing-requests/abc");
  });
});
