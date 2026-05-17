/**
 * COMP-UT-030–032: API rules via shared helpers.
 */
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { CredentialTable } from "@/drizzle/schema";
import { buildCredentialWhereConditions } from "@/lib/compliance/list-filters";
import { canManageCompliance, canViewCompliance } from "@/lib/auth/compliance-access-rules";

describe("compliance API rules", () => {
  it("COMP-UT-030: list queries scoped by agency_id", () => {
    const conditions = buildCredentialWhereConditions("agency-a", {});
    expect(conditions[0]).toEqual(eq(CredentialTable.agencyId, "agency-a"));
  });

  it("COMP-UT-031: coordinator cannot manage compliance", () => {
    expect(canManageCompliance("staffing_coordinator")).toBe(false);
  });

  it("COMP-AUTH-04: provider cannot view compliance", () => {
    expect(canViewCompliance("provider")).toBe(false);
  });
});
