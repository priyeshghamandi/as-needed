import { describe, expect, it } from "vitest";
import { ACTIVITY_ACTIONS } from "@/lib/activity/actions";
import { formatActivityAction } from "@/lib/activity/format-action";

describe("formatActivityAction", () => {
  it("ACT-UT-010: known key shift.created", () => {
    expect(formatActivityAction(ACTIVITY_ACTIONS.SHIFT_CREATED)).toBe("Shift created");
  });

  it("ACT-UT-011: unknown key humanized", () => {
    expect(formatActivityAction("shift.assignment.invited")).toBe(
      "Shift Assignment Invited",
    );
  });
});
