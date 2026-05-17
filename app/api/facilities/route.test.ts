/**
 * FAC-UT-020–024: API rules via shared helpers.
 */
import { describe, expect, it } from "vitest";
import { canManageFacilities } from "@/lib/auth/facilities-access-rules";
import { buildFacilityWhereConditions } from "@/lib/facilities/list-filters";
import { facilitySchema } from "@/lib/validations/facility";
import { isWithinServiceArea } from "@/lib/places/service-area-bounds";
import { eq } from "drizzle-orm";
import { FacilityTable } from "@/drizzle/schema";

const sfLocation = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

describe("POST /api/facilities rules", () => {
  it("FAC-UT-022: location outside service area fails bounds check", () => {
    const center = { latitude: 37.7749, longitude: -122.4194 };
    const nyc = { ...sfLocation, latitude: 40.7128, longitude: -74.006, placeId: "mock-nyc" };
    expect(isWithinServiceArea(nyc, center, 50)).toBe(false);
  });

  it("FAC-UT-023: list queries scoped by agency_id", () => {
    const conditions = buildFacilityWhereConditions("agency-a", {});
    expect(conditions[0]).toEqual(eq(FacilityTable.agencyId, "agency-a"));
  });

  it("valid coordinator POST body passes schema", () => {
    const result = facilitySchema.safeParse({
      name: "Test Hospital",
      type: "hospital",
      location: sfLocation,
      contactName: "Pat Rivera",
      contactEmail: "new@example.com",
      contactPhone: "5551234567",
      inviteContact: true,
    });
    expect(result.success).toBe(true);
  });

  it("recruiter blocked from manage", () => {
    expect(canManageFacilities("recruiter")).toBe(false);
  });
});
