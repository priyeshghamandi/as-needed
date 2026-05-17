import { describe, expect, it } from "vitest";
import { agencyPreferencesSchema } from "./agency-preferences";

const valid = {
  timezone: "America/New_York",
  weekStartsOn: 0 as const,
  defaultNotificationPriorityFloor: "important" as const,
  showCriticalBannerOnDashboard: true,
  dateFormat: "mdy" as const,
};

describe("agencyPreferencesSchema", () => {
  it("SET-UT-020: valid preferences", () => {
    expect(agencyPreferencesSchema.safeParse(valid).success).toBe(true);
  });

  it("SET-UT-021: invalid timezone", () => {
    const result = agencyPreferencesSchema.safeParse({ ...valid, timezone: "Not/A/Zone" });
    expect(result.success).toBe(false);
  });

  it("SET-UT-022: invalid weekStartsOn", () => {
    const result = agencyPreferencesSchema.safeParse({ ...valid, weekStartsOn: 2 });
    expect(result.success).toBe(false);
  });
});
