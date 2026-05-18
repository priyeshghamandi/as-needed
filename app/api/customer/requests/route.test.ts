import { describe, expect, it } from "vitest";
import { isFacilityRole } from "@/lib/auth/roles";
import { customerRequestCreateSchema } from "@/lib/validations/customer-request";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);

describe("customer requests API rules", () => {
  it("CRQ-API-002: facility_user role recognized", () => {
    expect(isFacilityRole("facility_user")).toBe(true);
    expect(isFacilityRole("agency_owner")).toBe(false);
  });

  it("CRQ-API-001: valid create body passes schema", () => {
    const start = tomorrow.toISOString();
    const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString();
    const result = customerRequestCreateSchema.safeParse({
      facilityId: "00000000-0000-4000-8000-000000000001",
      professionalIds: [
        "00000000-0000-4000-8000-000000000002",
        "00000000-0000-4000-8000-000000000003",
      ],
      roleNeeded: "rn",
      title: "RN staffing — Memorial",
      availabilityStart: start,
      availabilityEnd: end,
      professionalsRequired: 2,
      notes: "",
    });
    expect(result.success).toBe(true);
  });
});
