import { describe, expect, it } from "vitest";
import { eq, ilike, or } from "drizzle-orm";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import { buildProfessionalWhereConditions, parseWorkforceListParams } from "./list-filters";

describe("parseWorkforceListParams", () => {
  it("parses compliance=blocked filter", () => {
    const sp = new URLSearchParams("compliance=blocked&active=false");
    const params = parseWorkforceListParams(sp);
    expect(params.compliance).toBe("blocked");
    expect(params.active).toBe(false);
  });
});

describe("buildProfessionalWhereConditions", () => {
  it("WORK-UT-020: build where clause for role filter", () => {
    const conditions = buildProfessionalWhereConditions("agency-1", {
      role: "rn",
      active: true,
    });
    expect(conditions).toHaveLength(3);
    expect(conditions[0]).toEqual(eq(HealthcareProfessionalTable.agencyId, "agency-1"));
    expect(conditions[1]).toEqual(eq(HealthcareProfessionalTable.isActive, true));
    expect(conditions[2]).toEqual(eq(HealthcareProfessionalTable.role, "rn"));
  });

  it("WORK-UT-021: search q adds ilike or clause", () => {
    const conditions = buildProfessionalWhereConditions("agency-1", {
      q: "jane",
      active: true,
    });
    const search = conditions[2];
    expect(search).toEqual(
      or(
        ilike(HealthcareProfessionalTable.firstName, "%jane%"),
        ilike(HealthcareProfessionalTable.lastName, "%jane%"),
        ilike(HealthcareProfessionalTable.email, "%jane%"),
      ),
    );
  });
});
