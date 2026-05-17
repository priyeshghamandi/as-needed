import { describe, expect, it } from "vitest";
import { resolveActivityEntityHref } from "@/lib/activity/entity-route";

describe("activity entity-route", () => {
  it("ACT-UT-020: facility entity", () => {
    expect(
      resolveActivityEntityHref("facility", "11111111-1111-4111-8111-111111111111"),
    ).toBe("/facilities/11111111-1111-4111-8111-111111111111");
  });

  it("ACT-UT-021: unknown type", () => {
    expect(resolveActivityEntityHref("unknown", "11111111-1111-4111-8111-111111111111")).toBe(
      null,
    );
  });
});
