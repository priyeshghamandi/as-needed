import { describe, expect, it } from "vitest";
import {
  canManageWorkforce,
  canViewWorkforce,
  WORKFORCE_WRITE_ROLES,
  WORKFORCE_VIEW_ROLES,
} from "./workforce-access-rules";

describe("workforce access", () => {
  it("WORK-UT-030 / WORK-AUTH-01: coordinator cannot manage workforce", () => {
    expect(canManageWorkforce("staffing_coordinator")).toBe(false);
  });

  it("WORK-UT-031 / WORK-AUTH-02: recruiter can manage workforce", () => {
    expect(canManageWorkforce("recruiter")).toBe(true);
  });

  it("WORK-AUTH-04: compliance manager cannot manage workforce", () => {
    expect(canManageWorkforce("compliance_manager")).toBe(false);
  });

  it("coordinator can view workforce", () => {
    expect(canViewWorkforce("staffing_coordinator")).toBe(true);
  });

  it("write roles are subset of view roles", () => {
    for (const role of WORKFORCE_WRITE_ROLES) {
      expect(WORKFORCE_VIEW_ROLES).toContain(role);
    }
  });
});
