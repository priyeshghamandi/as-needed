import { describe, expect, it } from "vitest";
import { activityLogInputSchema, validateMetadataSize } from "@/lib/validations/activity";

describe("activity log validation", () => {
  const base = {
    agencyId: "11111111-1111-4111-8111-111111111111",
    action: "shift.created",
    entityType: "shift",
    entityId: "22222222-2222-4222-8222-222222222222",
  };

  it("ACT-UT-002: invalid action format", () => {
    expect(activityLogInputSchema.safeParse({ ...base, action: "Bad Action" }).success).toBe(
      false,
    );
  });

  it("ACT-UT-003: metadata > 4KB rejected", () => {
    expect(() =>
      validateMetadataSize({ blob: "x".repeat(5000) }),
    ).toThrow();
  });

  it("ACT-UT-004: missing agencyId", () => {
    expect(activityLogInputSchema.safeParse({ ...base, agencyId: undefined }).success).toBe(
      false,
    );
  });

  it("ACT-UT-005: null actor allowed", () => {
    const parsed = activityLogInputSchema.parse({ ...base, actorUserId: null });
    expect(parsed.actorUserId).toBeNull();
  });

  it("ACT-VAL-01: invalid entityId", () => {
    expect(activityLogInputSchema.safeParse({ ...base, entityId: "not-uuid" }).success).toBe(
      false,
    );
  });
});
