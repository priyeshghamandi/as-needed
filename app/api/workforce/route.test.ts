/**
 * WORK-UT-030–033: API auth and validation via shared helpers (handlers use requireAuthContext).
 */
import { describe, expect, it } from "vitest";
import { canManageWorkforce } from "@/lib/auth/workforce-access-rules";
import { healthcareProfessionalSchema } from "@/lib/validations/healthcare-professional";
import { isWithinServiceArea } from "@/lib/places/service-area-bounds";
import { buildProfessionalWhereConditions } from "@/lib/workforce/list-filters";
import { eq } from "drizzle-orm";
import { HealthcareProfessionalTable } from "@/drizzle/schema";

const sfLocation = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

const nycLocation = {
  ...sfLocation,
  displayName: "New York, NY",
  placeId: "mock-nyc",
  city: "New York",
  state: "NY",
  latitude: 40.7128,
  longitude: -74.006,
};

describe("POST /api/workforce rules", () => {
  it("WORK-UT-030: coordinator role blocked from manage", () => {
    expect(canManageWorkforce("staffing_coordinator")).toBe(false);
  });

  it("WORK-UT-031: recruiter role allowed to manage", () => {
    expect(canManageWorkforce("recruiter")).toBe(true);
  });

  it("WORK-UT-032: list queries scoped by agency_id in buildProfessionalWhereConditions", () => {
    const conditions = buildProfessionalWhereConditions("agency-a", { active: true });
    expect(conditions[0]).toEqual(eq(HealthcareProfessionalTable.agencyId, "agency-a"));
  });

  it("WORK-UT-033: location outside service area fails bounds check", () => {
    const center = { latitude: 37.7749, longitude: -122.4194 };
    expect(isWithinServiceArea(sfLocation, center, 50)).toBe(true);
    expect(isWithinServiceArea(nycLocation, center, 50)).toBe(false);
  });

  it("valid recruiter POST body passes schema", () => {
    const result = healthcareProfessionalSchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      role: "rn",
      email: "jane@example.com",
      phone: "",
      location: sfLocation,
      sendInvite: false,
    });
    expect(result.success).toBe(true);
  });
});
