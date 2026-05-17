import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { AgencyTable } from "@/drizzle/schema";
import { canManageAgencySettings } from "@/lib/settings/assert-can-manage-settings";
import { canViewAgencySettings } from "@/lib/settings/assert-can-view-settings";

describe("settings API rules", () => {
  it("SET-UT-040: agency role can view settings", () => {
    expect(canViewAgencySettings("staffing_coordinator", "agency-a")).toBe(true);
    expect(canViewAgencySettings("provider", "agency-a")).toBe(false);
  });

  it("SET-UT-041: coordinator cannot manage settings (PATCH would 403)", () => {
    expect(canManageAgencySettings("staffing_coordinator", "agency-a")).toBe(false);
    const agencyScope = eq(AgencyTable.id, "agency-a");
    expect(agencyScope).toBeDefined();
  });
});
