import { describe, expect, it } from "vitest";
import {
  relatedEntityLabel,
  resolveNotificationEntityHref,
} from "@/lib/notifications/entity-route";

describe("entity-route", () => {
  it("NOTIF-UT-020: staffing_request + id", () => {
    expect(
      resolveNotificationEntityHref("staffing_request", "11111111-1111-4111-8111-111111111111"),
    ).toBe("/staffing-requests/11111111-1111-4111-8111-111111111111");
  });

  it("NOTIF-UT-021: unknown type", () => {
    expect(resolveNotificationEntityHref("unknown_type", "11111111-1111-4111-8111-111111111111")).toBe(
      "/notifications",
    );
  });

  it("NOTIF-UT-022: null related fields", () => {
    expect(resolveNotificationEntityHref(null, null)).toBe("/notifications");
  });

  it("labels known entity types", () => {
    expect(relatedEntityLabel("shift")).toBe("Shift");
  });
});
