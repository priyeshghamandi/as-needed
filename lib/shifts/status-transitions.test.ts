import { describe, expect, it } from "vitest";
import { canTransitionShiftStatus } from "@/lib/shifts/status-transitions";

describe("shift status transitions", () => {
  it("SHIFT-UT-010: open → matching allowed", () => {
    expect(canTransitionShiftStatus("open", "matching")).toBe(true);
  });

  it("SHIFT-UT-011: confirmed → open denied", () => {
    expect(canTransitionShiftStatus("confirmed", "open")).toBe(false);
  });

  it("SHIFT-UT-012: cancelled → active denied", () => {
    expect(canTransitionShiftStatus("cancelled", "active")).toBe(false);
  });
});
