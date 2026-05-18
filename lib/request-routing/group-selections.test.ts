import { describe, expect, it } from "vitest";
import { groupSelectionAgencyIds } from "@/lib/request-routing/group-selections";

describe("groupSelectionAgencyIds", () => {
  it("RTR-UNIT-001: groups selections by agency", () => {
    const ids = groupSelectionAgencyIds([
      { agencyId: "agency-a" },
      { agencyId: "agency-b" },
      { agencyId: "agency-a" },
    ]);
    expect(ids.sort()).toEqual(["agency-a", "agency-b"]);
  });

  it("ignores empty agency ids", () => {
    expect(groupSelectionAgencyIds([{ agencyId: "" }, { agencyId: "agency-a" }])).toEqual([
      "agency-a",
    ]);
  });
});
