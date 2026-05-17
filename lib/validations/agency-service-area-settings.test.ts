import { describe, expect, it } from "vitest";
import { agencyServiceAreaSettingsSchema } from "./agency-service-area-settings";

const area = {
  displayName: "Chicago, IL",
  placeId: "place-123",
  city: "Chicago",
  state: "IL",
  country: "US",
  latitude: 41.88,
  longitude: -87.63,
};

describe("agencyServiceAreaSettingsSchema", () => {
  it("SET-UT-010: radius 9 fails", () => {
    const result = agencyServiceAreaSettingsSchema.safeParse({
      primaryServiceArea: area,
      serviceAreaRadiusMiles: 9,
    });
    expect(result.success).toBe(false);
  });

  it("SET-UT-011: radius 76 fails", () => {
    const result = agencyServiceAreaSettingsSchema.safeParse({
      primaryServiceArea: area,
      serviceAreaRadiusMiles: 76,
    });
    expect(result.success).toBe(false);
  });

  it("SET-UT-012: missing placeId fails", () => {
    const result = agencyServiceAreaSettingsSchema.safeParse({
      primaryServiceArea: { ...area, placeId: "" },
      serviceAreaRadiusMiles: 25,
    });
    expect(result.success).toBe(false);
  });
});
