import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { ActivityLogTable } from "@/drizzle/schema";
import {
  ACTIVITY_MAX_LIMIT,
  buildActivityWhereConditions,
  parseActivityListParams,
} from "@/lib/activity/list-filters";

describe("activity-logs API rules", () => {
  it("ACT-UT-030: entity filter", () => {
    const conditions = buildActivityWhereConditions("agency-a", {
      entityType: "shift",
      entityId: "11111111-1111-4111-8111-111111111111",
    });
    expect(conditions).toContainEqual(eq(ActivityLogTable.entityType, "shift"));
  });

  it("ACT-UT-032: limit max enforced", () => {
    const params = parseActivityListParams(new URLSearchParams("limit=999"));
    expect(params.limit).toBe(ACTIVITY_MAX_LIMIT);
  });

  it("ACT-UT-031: scoped to agency", () => {
    const conditions = buildActivityWhereConditions("agency-a", {});
    expect(conditions[0]).toEqual(eq(ActivityLogTable.agencyId, "agency-a"));
  });
});
