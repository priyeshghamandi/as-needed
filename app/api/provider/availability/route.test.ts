import { describe, expect, it } from "vitest";
import { availabilityBlockSchema } from "@/lib/validations/availability-block";
import { isProviderRole } from "@/lib/auth/roles";

describe("provider availability API rules", () => {
  it("HPP-UT-042: valid create body passes schema", () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const result = availabilityBlockSchema.safeParse({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: "available",
    });
    expect(result.success).toBe(true);
  });

  it("HPP-UT-043: facility_user cannot use provider APIs", () => {
    expect(isProviderRole("facility_user")).toBe(false);
  });
});
