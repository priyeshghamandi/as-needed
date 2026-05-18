import { describe, expect, it } from "vitest";
import {
  hasValidGeoPoint,
  isCustomerLocationValid,
  isGeoEligible,
  isProfessionalInAgencyServiceArea,
} from "@/lib/marketplace/geo-eligibility";

const denverCenter = { latitude: 39.7392, longitude: -104.9903 };
const denverPro = { latitude: 39.75, longitude: -104.99 };
const bostonCustomer = { latitude: 42.3601, longitude: -71.0589 };

describe("geo-eligibility", () => {
  it("MEL-GEO-001: distance within radius", () => {
    expect(
      isGeoEligible({
        professional: denverPro,
        agencyCenter: denverCenter,
        agencyRadiusMiles: 75,
        customerLocation: { latitude: 39.74, longitude: -104.99 },
      }),
    ).toBe(true);
  });

  it("MEL-GEO-002: distance outside radius", () => {
    expect(
      isGeoEligible({
        professional: denverPro,
        agencyCenter: denverCenter,
        agencyRadiusMiles: 75,
        customerLocation: bostonCustomer,
      }),
    ).toBe(false);
  });

  it("MEL-GEO-003: null lat/lng", () => {
    expect(hasValidGeoPoint({ latitude: null, longitude: null })).toBe(false);
    expect(isCustomerLocationValid(null)).toBe(false);
    expect(
      isProfessionalInAgencyServiceArea(
        { latitude: null, longitude: null },
        denverCenter,
        75,
      ),
    ).toBe(false);
  });
});
