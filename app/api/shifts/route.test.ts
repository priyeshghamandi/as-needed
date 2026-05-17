import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { canManageShifts } from "@/lib/auth/shifts-access-rules";
import { buildShiftWhereConditions } from "@/lib/shifts/list-filters";
import { ShiftTable } from "@/drizzle/schema";

describe("shifts API rules", () => {
  it("SHIFT-UT-030: list scoped by agency_id", () => {
    const conditions = buildShiftWhereConditions("agency-a", {});
    expect(conditions[0]).toEqual(eq(ShiftTable.agencyId, "agency-a"));
  });

  it("SHIFT-UT-031: recruiter blocked from manage", () => {
    expect(canManageShifts("recruiter")).toBe(false);
  });

  it("SHIFT-UT-032: coordinator can manage", () => {
    expect(canManageShifts("staffing_coordinator")).toBe(true);
  });
});
