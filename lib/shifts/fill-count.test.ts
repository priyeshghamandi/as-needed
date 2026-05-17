import { describe, expect, it } from "vitest";
import {
  computeShiftFill,
  suggestShiftStatusFromFill,
} from "@/lib/shifts/fill-count";

describe("shift fill count", () => {
  it("SHIFT-UT-020: 0 confirmed of 2 suggests partially_filled candidate", () => {
    expect(suggestShiftStatusFromFill(2, 0, "open")).toBe("open");
    expect(suggestShiftStatusFromFill(2, 1, "open")).toBe("partially_filled");
  });

  it("SHIFT-UT-021: 2 confirmed of 2 suggests confirmed", () => {
    expect(suggestShiftStatusFromFill(2, 2, "open")).toBe("confirmed");
  });

  it("SHIFT-UT-022: declined not counted in fill", () => {
    const fill = computeShiftFill(2, [{ status: "declined" }, { status: "confirmed" }], "open");
    expect(fill.filledCount).toBe(1);
  });
});
