import { describe, expect, it } from "vitest";
import { assertSameProfessionalRole } from "@/lib/validations/customer-request";

describe("createCustomerStaffingRequest helpers", () => {
  it("rejects mixed roles before API call", () => {
    expect(assertSameProfessionalRole(["rn", "cna"])).toBe(false);
  });
});
