import { describe, expect, it } from "vitest";
import { facilityStaffingRequestSchema } from "@/lib/validations/facility-staffing-request";

const base = {
  title: "RN coverage — Memorial",
  roleNeeded: "rn" as const,
  professionalsRequired: 2,
  shiftDate: "2099-06-15",
  startTime: "07:00",
  endTime: "19:00",
  priority: "normal" as const,
};

describe("facilityStaffingRequestSchema", () => {
  it("FPORT-UT-001: valid payload passes", () => {
    expect(facilityStaffingRequestSchema.safeParse(base).success).toBe(true);
  });

  it("FPORT-UT-002: professionals_required = 0 fails", () => {
    expect(
      facilityStaffingRequestSchema.safeParse({ ...base, professionalsRequired: 0 }).success,
    ).toBe(false);
  });

  it("FPORT-UT-003: shift date in the past fails", () => {
    expect(
      facilityStaffingRequestSchema.safeParse({
        ...base,
        shiftDate: "2000-01-01",
      }).success,
    ).toBe(false);
  });

  it("FPORT-UT-004: title too short fails", () => {
    expect(
      facilityStaffingRequestSchema.safeParse({ ...base, title: "ab" }).success,
    ).toBe(false);
  });

  it("FPORT-UT-005: invalid role enum fails", () => {
    expect(
      facilityStaffingRequestSchema.safeParse({ ...base, roleNeeded: "invalid" }).success,
    ).toBe(false);
  });
});
