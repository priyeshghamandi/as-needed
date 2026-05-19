import { describe, expect, it } from "vitest";
import { isFacilityRole, isAgencyRole } from "@/lib/auth/roles";

describe("facility API access roles", () => {
  it("FPORT-UT-030: facility_user is a facility role", () => {
    expect(isFacilityRole("facility_user")).toBe(true);
  });

  it("FPORT-UT-032: agency_owner is not a facility role", () => {
    expect(isFacilityRole("agency_owner")).toBe(false);
    expect(isAgencyRole("agency_owner")).toBe(true);
  });
});
