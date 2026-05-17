import { describe, expect, it } from "vitest";
import { availabilityBlockSchema } from "@/lib/validations/availability-block";

describe("availabilityBlockSchema", () => {
  const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  it("HPP-UT-001: valid block passes", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: start,
      endAt: end,
      status: "available",
    });
    expect(result.success).toBe(true);
  });

  it("HPP-UT-002: endAt before startAt fails", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: end,
      endAt: start,
      status: "available",
    });
    expect(result.success).toBe(false);
  });

  it("HPP-UT-003: duration under 30 minutes fails", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: start,
      endAt: new Date(start.getTime() + 15 * 60 * 1000),
      status: "available",
    });
    expect(result.success).toBe(false);
  });

  it("HPP-UT-004: duration over 14 days fails", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: start,
      endAt: new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: "available",
    });
    expect(result.success).toBe(false);
  });

  it("HPP-UT-005: notes over 500 chars fails", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: start,
      endAt: end,
      status: "available",
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("HPP-UT-006: on_shift status fails", () => {
    const result = availabilityBlockSchema.safeParse({
      startAt: start,
      endAt: end,
      status: "on_shift",
    });
    expect(result.success).toBe(false);
  });
});
