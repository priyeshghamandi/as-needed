import { describe, expect, it } from "vitest";
import { buildVisibilityChecklist } from "@/lib/marketplace/visibility-checklist";

const baseAgency = {
  primaryServiceAreaLat: "39.7392",
  primaryServiceAreaLng: "-104.9903",
  serviceAreaRadiusMiles: 75,
};

const basePro = {
  firstName: "Jane",
  lastName: "Doe",
  role: "rn",
  placeId: "place-1",
  latitude: "39.75",
  longitude: "-104.99",
  isActive: true,
  publicSlug: "jane-doe-abc12345",
};

describe("visibility-checklist", () => {
  it("MEL-CHK-001: all rules pass", () => {
    const result = buildVisibilityChecklist({
      professional: basePro,
      agency: baseAgency,
      visibility: { isMarketplaceVisible: false, visibilityBlockedReason: null },
      credentials: [{ status: "verified" }],
    });
    expect(result.canEnable).toBe(true);
  });

  it("MEL-CHK-002: out of service area", () => {
    const result = buildVisibilityChecklist({
      professional: {
        ...basePro,
        latitude: "40.7128",
        longitude: "-74.0060",
      },
      agency: baseAgency,
      visibility: { isMarketplaceVisible: false, visibilityBlockedReason: null },
      credentials: [{ status: "verified" }],
    });
    expect(result.canEnable).toBe(false);
    const location = result.items.find((i) => i.id === "location");
    expect(location?.passed).toBe(false);
  });
});
