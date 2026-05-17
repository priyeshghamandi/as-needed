import { describe, expect, it } from "vitest";
import {
  canManualStatusTransition,
  canReopenReview,
  canRejectCredential,
  canVerifyCredential,
  isDirectVerifiedStatusUpdate,
} from "./credential-transitions";

describe("credential transitions", () => {
  it("COMP-UT-010: pending can verify", () => {
    expect(canVerifyCredential("pending_review")).toBe(true);
  });

  it("COMP-UT-011: pending can reject", () => {
    expect(canRejectCredential("pending_review")).toBe(true);
  });

  it("COMP-UT-012: rejected can reopen to pending", () => {
    expect(canReopenReview("rejected")).toBe(true);
    expect(canManualStatusTransition("pending_review")).toBe(true);
  });

  it("COMP-UT-013: rejected cannot verify directly", () => {
    expect(canVerifyCredential("rejected")).toBe(false);
  });

  it("COMP-UT-014: expired cannot set verified via status action", () => {
    expect(isDirectVerifiedStatusUpdate("verified")).toBe(true);
    expect(canVerifyCredential("expired")).toBe(false);
  });
});
