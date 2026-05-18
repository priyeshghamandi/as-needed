import { describe, expect, it } from "vitest";
import {
  assertFulfillmentTransition,
  canCustomerApproveFulfillment,
  deriveFulfillmentStatusFromAgencyReviews,
} from "@/lib/fulfillment/fulfillment-status";

describe("fulfillment status transitions", () => {
  it("AFR-UNIT-001: pending → agency_confirmed → customer_approved", () => {
    const aggregates = [
      {
        selectionCount: 1,
        reviewedCount: 1,
        confirmedCount: 1,
        declinedCount: 0,
        pendingCount: 0,
      },
    ];
    expect(deriveFulfillmentStatusFromAgencyReviews(aggregates, "pending_agency_review")).toBe(
      "agency_confirmed",
    );

    expect(canCustomerApproveFulfillment("agency_confirmed")).toBe(true);
    expect(assertFulfillmentTransition("agency_confirmed", "customer_approved").ok).toBe(true);
  });

  it("AFR-UNIT-002: invalid transition rejected", () => {
    expect(assertFulfillmentTransition("customer_approved", "agency_confirmed").ok).toBe(false);
    expect(canCustomerApproveFulfillment("pending_agency_review")).toBe(false);
  });

  it("all declined yields agency_declined", () => {
    const aggregates = [
      {
        selectionCount: 2,
        reviewedCount: 2,
        confirmedCount: 0,
        declinedCount: 2,
        pendingCount: 0,
      },
    ];
    expect(deriveFulfillmentStatusFromAgencyReviews(aggregates, "pending_agency_review")).toBe(
      "agency_declined",
    );
  });
});
