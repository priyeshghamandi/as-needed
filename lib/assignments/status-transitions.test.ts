import { describe, expect, it } from "vitest";
import {
  canCoordinatorTransitionAssignment,
  canProviderTransitionAssignment,
} from "@/lib/assignments/status-transitions";

describe("assignment status transitions", () => {
  it("MATCH-UT-020: invited → accepted allowed for provider", () => {
    expect(canProviderTransitionAssignment("invited", "accepted")).toBe(true);
  });

  it("MATCH-UT-021: invited → declined allowed for provider", () => {
    expect(canProviderTransitionAssignment("invited", "declined")).toBe(true);
  });

  it("MATCH-UT-022: declined → accepted denied", () => {
    expect(canProviderTransitionAssignment("declined", "accepted")).toBe(false);
  });

  it("MATCH-UT-023: invited → cancelled allowed for coordinator", () => {
    expect(canCoordinatorTransitionAssignment("invited", "cancelled")).toBe(true);
  });

  it("MATCH-UT-024: accepted → confirmed allowed for coordinator", () => {
    expect(canCoordinatorTransitionAssignment("accepted", "confirmed")).toBe(true);
  });
});
