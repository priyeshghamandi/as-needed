import { describe, expect, it } from "vitest";
import { createSecondaryShiftSchema, updateShiftSchema } from "@/lib/validations/shift";

describe("shift validation", () => {
  it("SHIFT-UT-001: end before start fails", () => {
    const result = updateShiftSchema.safeParse({
      startAt: new Date("2030-06-01T15:00:00Z"),
      endAt: new Date("2030-06-01T07:00:00Z"),
    });
    expect(result.success).toBe(false);
  });

  it("SHIFT-UT-002: breakMinutes negative fails", () => {
    const result = updateShiftSchema.safeParse({
      startAt: new Date("2030-06-01T07:00:00Z"),
      endAt: new Date("2030-06-01T15:00:00Z"),
      breakMinutes: -1,
    });
    expect(result.success).toBe(false);
  });

  it("SHIFT-UT-003: required_count < 1 fails", () => {
    const result = createSecondaryShiftSchema.safeParse({
      staffingRequestId: "00000000-0000-4000-8000-000000000001",
      facilityId: "00000000-0000-4000-8000-000000000002",
      shiftDate: "2030-06-01",
      startTime: "07:00",
      endTime: "15:00",
      requiredCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("SHIFT-UT-004: valid payload passes", () => {
    const result = updateShiftSchema.safeParse({
      startAt: new Date("2030-06-01T07:00:00Z"),
      endAt: new Date("2030-06-01T15:00:00Z"),
      breakMinutes: 30,
    });
    expect(result.success).toBe(true);
  });
});
