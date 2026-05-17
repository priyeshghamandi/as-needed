import { describe, expect, it } from "vitest";
import { computeShiftReadiness } from "./shift-readiness";

describe("computeShiftReadiness", () => {
  it("WORK-UT-010: available + compliance clear + not on_shift → ready", () => {
    expect(computeShiftReadiness("available", "clear")).toBe("ready");
  });

  it("WORK-UT-011: on_shift → not ready", () => {
    expect(computeShiftReadiness("on_shift", "clear")).toBe("not_ready");
  });

  it("WORK-UT-012: compliance blocked → not ready", () => {
    expect(computeShiftReadiness("available", "blocked")).toBe("not_ready");
  });
});
