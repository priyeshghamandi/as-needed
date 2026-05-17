import { describe, expect, it } from "vitest";
import {
  calculateOnboardingPercent,
  canCompleteOnboarding,
  getResumeStep,
} from "./progress";

describe("calculateOnboardingPercent", () => {
  it("ONB-UT-050: profile + service-area yields 80% until complete", () => {
    expect(
      calculateOnboardingPercent({
        completedSteps: ["profile", "service-area"],
        skippedSteps: [],
      }),
    ).toBe(80);
  });

  it("ONB-UT-051: complete step yields 100% with skipped optional steps", () => {
    expect(
      calculateOnboardingPercent({
        completedSteps: ["profile", "service-area", "complete"],
        skippedSteps: ["team", "professionals", "facilities"],
      }),
    ).toBe(100);
  });
});

describe("getResumeStep", () => {
  it("ONB-UT-052: returns first incomplete required step from welcome", () => {
    expect(
      getResumeStep("welcome", { completedSteps: [], skippedSteps: [] }),
    ).toBe("profile");
  });

  it("returns saved step when in progress", () => {
    expect(
      getResumeStep("facilities", {
        completedSteps: ["profile", "service-area"],
        skippedSteps: ["team"],
      }),
    ).toBe("facilities");
  });
});

describe("canCompleteOnboarding", () => {
  it("requires profile and service-area", () => {
    expect(
      canCompleteOnboarding({ completedSteps: ["profile"], skippedSteps: [] }),
    ).toBe(false);
    expect(
      canCompleteOnboarding({
        completedSteps: ["profile", "service-area"],
        skippedSteps: [],
      }),
    ).toBe(true);
  });
});
