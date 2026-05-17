import { describe, expect, it } from "vitest";
import { aggregateComplianceStatus } from "./compliance-summary";

describe("aggregateComplianceStatus", () => {
  it("OPS-UT-010: all verified credentials → clear", () => {
    expect(
      aggregateComplianceStatus([{ status: "verified" }, { status: "verified" }]),
    ).toBe("clear");
  });

  it("OPS-UT-011: one expired → blocked", () => {
    expect(
      aggregateComplianceStatus([{ status: "verified" }, { status: "expired" }]),
    ).toBe("blocked");
  });

  it("OPS-UT-012: expiring_soon without expired → attention", () => {
    expect(
      aggregateComplianceStatus([
        { status: "verified" },
        { status: "expiring_soon" },
      ]),
    ).toBe("attention");
  });

  it("OPS-UT-013: no credentials → clear", () => {
    expect(aggregateComplianceStatus([])).toBe("clear");
  });
});
