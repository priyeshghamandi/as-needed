import { describe, expect, it } from "vitest";
import {
  FACILITY_TYPE_LABELS,
  FACILITY_TYPES,
  facilityTypeLabel,
} from "./type-labels";

describe("facility type labels", () => {
  it("FAC-UT-010: each FacilityTypeEnum has label", () => {
    expect(FACILITY_TYPES).toHaveLength(6);
    for (const t of FACILITY_TYPES) {
      expect(FACILITY_TYPE_LABELS[t]).toBeTruthy();
    }
  });

  it("FAC-UT-011: unknown type fallback to Other", () => {
    expect(facilityTypeLabel("unknown_type")).toBe("Other");
  });
});
