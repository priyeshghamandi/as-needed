import { describe, expect, it } from "vitest";
import { APPROXIMATE_AVAILABILITY_LABELS } from "@/lib/marketplace/approximate-availability-labels";

describe("approximate-availability", () => {
  it("PPP-UNIT-003: labels never include schedule times", () => {
    for (const label of Object.values(APPROXIMATE_AVAILABILITY_LABELS)) {
      expect(label).not.toMatch(/\d{1,2}:\d{2}/);
      expect(label.toLowerCase()).not.toContain("am");
      expect(label.toLowerCase()).not.toContain("pm");
    }
  });
});
