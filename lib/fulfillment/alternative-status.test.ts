import { describe, expect, it } from "vitest";
import {
  assertAlternativeFulfillmentTransition,
  canProposeAlternative,
  fulfillmentStatusAfterWithdrawAlternative,
  hasPendingAlternativeConstraint,
} from "@/lib/fulfillment/alternative-status";

describe("alternative-status", () => {
  it("ALT-UNIT-001: blocks duplicate pending per original", () => {
    const existing = [
      { originalProfessionalId: "orig-1", status: "pending_customer" as const },
      { originalProfessionalId: "orig-2", status: "withdrawn" as const },
    ];
    expect(hasPendingAlternativeConstraint(existing, "orig-1")).toBe(true);
    expect(hasPendingAlternativeConstraint(existing, "orig-2")).toBe(false);
  });

  it("ALT-UNIT-002: transition matrix for alternative flows", () => {
    expect(canProposeAlternative("agency_declined")).toBe(true);
    expect(canProposeAlternative("alternative_proposed")).toBe(false);

    expect(assertAlternativeFulfillmentTransition("agency_declined", "alternative_proposed").ok).toBe(
      true,
    );
    expect(
      assertAlternativeFulfillmentTransition("alternative_proposed", "customer_approved").ok,
    ).toBe(true);
    expect(
      assertAlternativeFulfillmentTransition("alternative_proposed", "customer_rejected").ok,
    ).toBe(true);
    expect(assertAlternativeFulfillmentTransition("customer_approved", "alternative_proposed").ok).toBe(
      false,
    );
    expect(
      assertAlternativeFulfillmentTransition("alternative_proposed", "agency_declined").ok,
    ).toBe(true);
  });

  it("withdraw returns agency_declined when all declined", () => {
    expect(
      fulfillmentStatusAfterWithdrawAlternative({
        hasAnyConfirmedReview: false,
        allSelectionsReviewed: true,
        allDeclined: true,
      }),
    ).toBe("agency_declined");
  });
});
