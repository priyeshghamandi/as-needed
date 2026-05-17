import { describe, expect, it } from "vitest";
import {
  staffingRequestCreateSchema,
  staffingRequestDraftSchema,
} from "@/lib/validations/staffing-request";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);

const validCreate = {
  facilityId: "00000000-0000-4000-8000-000000000001",
  facilityUnit: "ICU",
  title: "Memorial – RN",
  roleNeeded: "rn" as const,
  specialty: "ICU",
  professionalsRequired: 2,
  shiftDate: tomorrow.toISOString().slice(0, 10),
  startTime: "07:00",
  endTime: "15:00",
  shiftType: "day" as const,
  priority: "normal" as const,
  requiredCredentials: ["BLS"],
  notes: "Internal",
  facilityInstructions: "Check in at desk",
};

describe("staffing-request validation", () => {
  it("REQ-UT-001: missing facilityId fails", () => {
    const { facilityId: _, ...rest } = validCreate;
    expect(staffingRequestCreateSchema.safeParse(rest).success).toBe(false);
  });

  it("REQ-UT-002: professionalsRequired < 1 fails", () => {
    expect(
      staffingRequestCreateSchema.safeParse({ ...validCreate, professionalsRequired: 0 })
        .success,
    ).toBe(false);
  });

  it("REQ-UT-003: professionalsRequired > 50 fails", () => {
    expect(
      staffingRequestCreateSchema.safeParse({ ...validCreate, professionalsRequired: 51 })
        .success,
    ).toBe(false);
  });

  it("REQ-UT-004: invalid role fails", () => {
    expect(
      staffingRequestCreateSchema.safeParse({ ...validCreate, roleNeeded: "invalid" }).success,
    ).toBe(false);
  });

  it("REQ-UT-005: invalid priority fails", () => {
    expect(
      staffingRequestCreateSchema.safeParse({ ...validCreate, priority: "low" }).success,
    ).toBe(false);
  });

  it("REQ-UT-006: short title fails", () => {
    expect(staffingRequestCreateSchema.safeParse({ ...validCreate, title: "ab" }).success).toBe(
      false,
    );
  });

  it("REQ-UT-007: valid minimal payload passes", () => {
    expect(staffingRequestCreateSchema.safeParse(validCreate).success).toBe(true);
  });

  it("REQ-UT-008: too many credentials fails", () => {
    const many = Array.from({ length: 21 }, (_, i) => `Cred ${i}`);
    expect(
      staffingRequestCreateSchema.safeParse({ ...validCreate, requiredCredentials: many })
        .success,
    ).toBe(false);
  });

  it("REQ-UT-009: same-day shift window passes", () => {
    expect(
      staffingRequestCreateSchema.safeParse({
        ...validCreate,
        startTime: "08:00",
        endTime: "16:00",
      }).success,
    ).toBe(true);
  });

  it("REQ-UT-010: overnight shift passes", () => {
    expect(
      staffingRequestCreateSchema.safeParse({
        ...validCreate,
        startTime: "22:00",
        endTime: "06:00",
      }).success,
    ).toBe(true);
  });

  it("draft schema accepts facility and title", () => {
    expect(
      staffingRequestDraftSchema.safeParse({
        facilityId: validCreate.facilityId,
        title: "Draft title",
      }).success,
    ).toBe(true);
  });
});
