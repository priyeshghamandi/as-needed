import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/email/send-email", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("@/drizzle/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { sendEmail } from "@/lib/email/send-email";
import { db } from "@/drizzle/db";
import { dispatchNotificationEmails } from "@/lib/email/dispatch-notification-email";

describe("dispatchNotificationEmails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips info-priority notifications", async () => {
    await dispatchNotificationEmails([
      {
        userId: "user-1",
        title: "FYI",
        message: "Low priority update",
        priority: "info",
      },
    ]);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(db.select).not.toHaveBeenCalled();
  });

  it("sends email for urgent notifications when user email exists", async () => {
    const where = vi.fn().mockResolvedValue([
      { id: "user-1", email: "coordinator@example.com", name: "Sam" },
    ]);
    const from = vi.fn().mockReturnValue({ where });
    vi.mocked(db.select).mockReturnValue({ from } as never);

    await dispatchNotificationEmails([
      {
        userId: "user-1",
        title: "Urgent shift",
        message: "Coverage needed tonight.",
        priority: "urgent",
        relatedEntityType: "staffing_request",
        relatedEntityId: "req-1",
      },
    ]);

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "coordinator@example.com",
        subject: "[AsNeeded] Urgent shift",
      }),
    );
  });
});
