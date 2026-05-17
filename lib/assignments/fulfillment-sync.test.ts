import { describe, expect, it } from "vitest";
import { shouldMarkRequestAtRisk } from "@/lib/assignments/at-risk";
import { computeFulfillment } from "@/lib/staffing-requests/fulfillment";

describe("fulfillment sync helpers", () => {
  it("MATCH-UT-030: 1 accept of 2 required suggests partially_filled", () => {
    const f = computeFulfillment(2, 1);
    expect(f.suggestedStatus).toBe("partially_filled");
  });

  it("MATCH-UT-031: 2 confirm of 2 suggests confirmed", () => {
    const f = computeFulfillment(2, 2);
    expect(f.suggestedStatus).toBe("confirmed");
  });

  it("MATCH-UT-032: unfilled shift <24h marks at_risk", () => {
    const in12h = new Date(Date.now() + 12 * 60 * 60 * 1000);
    expect(shouldMarkRequestAtRisk(0, 2, in12h)).toBe(true);
    expect(shouldMarkRequestAtRisk(2, 2, in12h)).toBe(false);
  });
});
