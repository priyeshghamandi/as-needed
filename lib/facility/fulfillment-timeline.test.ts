import { describe, expect, it } from "vitest";
import { deriveFulfillmentTimeline } from "@/lib/facility/fulfillment-timeline";

describe("deriveFulfillmentTimeline", () => {
  it("FPORT-UT-020: status open — only submitted complete", () => {
    const steps = deriveFulfillmentTimeline({
      requestStatus: "open",
      hasAssignments: false,
      hasAcceptedAssignment: false,
      hasActiveShift: false,
    });
    expect(steps.find((s) => s.id === "submitted")?.complete).toBe(true);
    expect(steps.find((s) => s.id === "matching")?.complete).toBe(false);
  });

  it("FPORT-UT-021: status matching — submitted and matching complete", () => {
    const steps = deriveFulfillmentTimeline({
      requestStatus: "matching",
      hasAssignments: false,
      hasAcceptedAssignment: false,
      hasActiveShift: false,
    });
    expect(steps.find((s) => s.id === "matching")?.complete).toBe(true);
  });

  it("FPORT-UT-022: with assignment accepted — shift assigned complete", () => {
    const steps = deriveFulfillmentTimeline({
      requestStatus: "partially_filled",
      hasAssignments: true,
      hasAcceptedAssignment: true,
      hasActiveShift: false,
    });
    expect(steps.find((s) => s.id === "assigned")?.complete).toBe(true);
  });

  it("FPORT-UT-023: status confirmed — includes confirmed step", () => {
    const steps = deriveFulfillmentTimeline({
      requestStatus: "confirmed",
      hasAssignments: true,
      hasAcceptedAssignment: true,
      hasActiveShift: false,
    });
    expect(steps.find((s) => s.id === "confirmed")?.complete).toBe(true);
  });
});
