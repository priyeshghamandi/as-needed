import { describe, expect, it } from "vitest";
import { ROUTING_SLA_HOURS } from "@/lib/request-routing/constants";

describe("routeStaffingRequest", () => {
  it("RTR-UNIT-002: SLA default is 4 hours", () => {
    expect(ROUTING_SLA_HOURS).toBe(4);
  });
});
