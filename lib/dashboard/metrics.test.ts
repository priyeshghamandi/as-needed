import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_ALERT_STATUSES,
  countAvailableProfessionals,
  countComplianceAlerts,
  countOpenRequests,
  countUrgentShifts,
  computeFillRate,
} from "./metrics";

describe("countOpenRequests", () => {
  it("OPS-UT-001: counts only active statuses", () => {
    const requests = [
      { status: "open" },
      { status: "matching" },
      { status: "partially_filled" },
      { status: "at_risk" },
      { status: "confirmed" },
      { status: "draft" },
      { status: "cancelled" },
    ];
    expect(countOpenRequests(requests)).toBe(4);
  });

  it("OPS-UT-002: empty list returns 0", () => {
    expect(countOpenRequests([])).toBe(0);
  });
});

describe("computeFillRate", () => {
  it("OPS-UT-003: 4 filled of 5 required yields 80", () => {
    expect(
      computeFillRate([{ professionalsRequired: 5, filledCount: 4 }]),
    ).toBe(80);
  });

  it("OPS-UT-004: no requests yields 0", () => {
    expect(computeFillRate([])).toBe(0);
  });

  it("OPS-UT-005: caps filled per request at professionals_required", () => {
    expect(
      computeFillRate([
        { professionalsRequired: 2, filledCount: 5 },
        { professionalsRequired: 3, filledCount: 1 },
      ]),
    ).toBe(60);
  });

  it("OPS-EDGE-05: zero professionals_required excluded from denominator", () => {
    expect(
      computeFillRate([
        { professionalsRequired: 0, filledCount: 10 },
        { professionalsRequired: 4, filledCount: 2 },
      ]),
    ).toBe(50);
  });
});

describe("countAvailableProfessionals", () => {
  it("OPS-UT-006: excludes inactive professionals", () => {
    const pros = [
      { isActive: true, availabilityStatus: "available" },
      { isActive: false, availabilityStatus: "available" },
      { isActive: true, availabilityStatus: "unavailable" },
      { isActive: true, availabilityStatus: "available" },
    ];
    expect(countAvailableProfessionals(pros)).toBe(2);
  });
});

describe("countUrgentShifts", () => {
  it("OPS-UT-007: counts shifts within 24h window", () => {
    const now = new Date("2026-05-17T12:00:00Z");
    const in12h = new Date("2026-05-17T24:00:00Z");
    const in25h = new Date("2026-05-18T13:00:00Z");
    const past = new Date("2026-05-17T10:00:00Z");

    expect(
      countUrgentShifts(
        [
          { status: "open", startAt: in12h },
          { status: "open", startAt: in25h },
          { status: "open", startAt: past },
          { status: "completed", startAt: in12h },
        ],
        now,
      ),
    ).toBe(1);
  });
});

describe("countComplianceAlerts", () => {
  it("OPS-UT-008: counts alert statuses only", () => {
    const credentials = [
      { status: "verified" },
      { status: "expiring_soon" },
      { status: "expired" },
      { status: "pending_review" },
      { status: "rejected" },
    ];
    expect(countComplianceAlerts(credentials)).toBe(3);
    expect(COMPLIANCE_ALERT_STATUSES).toHaveLength(3);
  });
});
