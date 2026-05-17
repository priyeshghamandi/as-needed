import { describe, expect, it } from "vitest";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { buildStaffingRequestWhereConditions } from "@/lib/staffing-requests/list-filters";
import { staffingRequestCreateSchema } from "@/lib/validations/staffing-request";
import { StaffingRequestTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);

describe("staffing requests API rules", () => {
  it("REQ-UT-050: list scoped by agency_id", () => {
    const conditions = buildStaffingRequestWhereConditions("agency-a", {});
    expect(conditions[0]).toEqual(eq(StaffingRequestTable.agencyId, "agency-a"));
  });

  it("REQ-UT-051: recruiter blocked from manage", () => {
    expect(canManageStaffingRequests("recruiter")).toBe(false);
  });

  it("REQ-UT-052: valid coordinator body passes schema", () => {
    const result = staffingRequestCreateSchema.safeParse({
      facilityId: "00000000-0000-4000-8000-000000000001",
      title: "Test Request",
      roleNeeded: "rn",
      professionalsRequired: 1,
      shiftDate: tomorrow.toISOString().slice(0, 10),
      startTime: "07:00",
      endTime: "15:00",
      priority: "normal",
    });
    expect(result.success).toBe(true);
  });

  it("coordinator can manage", () => {
    expect(canManageStaffingRequests("staffing_coordinator")).toBe(true);
  });
});
