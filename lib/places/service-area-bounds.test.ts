import { describe, expect, it } from "vitest";
import {
  distanceMiles,
  isWithinServiceArea,
} from "./service-area-bounds";

const center = { latitude: 37.7749, longitude: -122.4194 };

describe("isWithinServiceArea", () => {
  it("ONB-UT-040: point at center is inside", () => {
    expect(isWithinServiceArea(center, center, 50)).toBe(true);
  });

  it("ONB-UT-041: point just inside radius is true", () => {
    const nearby = { latitude: 37.8, longitude: -122.45 };
    expect(isWithinServiceArea(nearby, center, 50)).toBe(true);
  });

  it("ONB-UT-042: point outside radius is false", () => {
    const nyc = { latitude: 40.7128, longitude: -74.006 };
    expect(isWithinServiceArea(nyc, center, 10)).toBe(false);
  });
});

describe("distanceMiles", () => {
  it("ONB-UT-043: known pair matches expected within tolerance", () => {
    const miles = distanceMiles(37.7749, -122.4194, 34.0522, -118.2437);
    expect(miles).toBeGreaterThan(340);
    expect(miles).toBeLessThan(360);
  });
});
