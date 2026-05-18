import { describe, expect, it } from "vitest";
import {
  assertSameProfessionalRole,
  CUSTOMER_REQUEST_MAX_SELECTIONS,
  customerRequestCreateSchema,
} from "@/lib/validations/customer-request";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
const start = tomorrow.toISOString();
const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString();

describe("customer-request validation", () => {
  it("CRQ-UNIT-001: max 5 selections", () => {
    const ids = Array.from({ length: 6 }, (_, i) =>
      `00000000-0000-4000-8000-00000000000${i}`,
    );
    const result = customerRequestCreateSchema.safeParse({
      facilityId: "00000000-0000-4000-8000-000000000001",
      professionalIds: ids,
      roleNeeded: "rn",
      title: "Test",
      availabilityStart: start,
      availabilityEnd: end,
      professionalsRequired: 1,
    });
    expect(result.success).toBe(false);
    expect(CUSTOMER_REQUEST_MAX_SELECTIONS).toBe(5);
  });

  it("CRQ-UNIT-002: same role enforcement helper", () => {
    expect(assertSameProfessionalRole(["rn", "rn"])).toBe(true);
    expect(assertSameProfessionalRole(["rn", "cna"])).toBe(false);
  });
});
