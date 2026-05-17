import { describe, expect, it } from "vitest";
import { shiftsOverlap } from "@/lib/provider/shift-overlap";

describe("shiftsOverlap", () => {
  const aStart = new Date("2026-06-01T08:00:00Z");
  const aEnd = new Date("2026-06-01T16:00:00Z");

  it("HPP-UT-010: non-overlapping shifts", () => {
    const bStart = new Date("2026-06-01T16:00:00Z");
    const bEnd = new Date("2026-06-01T20:00:00Z");
    expect(shiftsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });

  it("HPP-UT-011: partial overlap", () => {
    const bStart = new Date("2026-06-01T12:00:00Z");
    const bEnd = new Date("2026-06-01T20:00:00Z");
    expect(shiftsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });

  it("HPP-UT-012: adjacent end=start is not overlap", () => {
    const bStart = new Date("2026-06-01T16:00:00Z");
    const bEnd = new Date("2026-06-01T20:00:00Z");
    expect(shiftsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });
});
