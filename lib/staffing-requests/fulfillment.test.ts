import { describe, expect, it } from "vitest";
import {
  computeFulfillment,
  countFilledAssignments,
} from "@/lib/staffing-requests/fulfillment";

describe("fulfillment", () => {
  it("REQ-UT-030: 0 assignments → 0% progress", () => {
    const r = computeFulfillment(2, 0);
    expect(r.progress).toBe(0);
    expect(r.label).toBe("0 / 2");
  });

  it("REQ-UT-031: 1 of 2 → 50% partially_filled hint", () => {
    const r = computeFulfillment(2, 1);
    expect(r.progress).toBe(0.5);
    expect(r.suggestedStatus).toBe("partially_filled");
  });

  it("REQ-UT-032: 2 of 2 → confirmed hint", () => {
    const r = computeFulfillment(2, 2);
    expect(r.progress).toBe(1);
    expect(r.suggestedStatus).toBe("confirmed");
  });

  it("REQ-UT-033: declined assignments excluded", () => {
    const filled = countFilledAssignments([
      { status: "declined" },
      { status: "accepted" },
      { status: "invited" },
    ]);
    expect(filled).toBe(1);
  });
});
