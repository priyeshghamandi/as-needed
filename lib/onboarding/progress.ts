export type OnboardingProgress = {
  completedSteps: string[];
  skippedSteps: string[];
};

export const REQUIRED_STEPS = ["profile", "service-area"] as const;
export const OPTIONAL_STEPS = ["team", "professionals", "facilities"] as const;
export const ALL_STEP_IDS = [
  "welcome",
  "profile",
  "service-area",
  "team",
  "professionals",
  "facilities",
  "complete",
] as const;

export type StepId = (typeof ALL_STEP_IDS)[number];

export function calculateOnboardingPercent(progress: OnboardingProgress): number {
  const requiredDone = REQUIRED_STEPS.filter((s) =>
    progress.completedSteps.includes(s),
  ).length;
  const isComplete = progress.completedSteps.includes("complete");
  if (isComplete) return 100;
  return Math.round((requiredDone / REQUIRED_STEPS.length) * 80);
}

export function getResumeStep(
  currentStep: string,
  progress: OnboardingProgress,
): StepId {
  const valid = ALL_STEP_IDS.find((s) => s === currentStep);
  if (!valid || valid === "welcome") {
    const firstIncomplete = ALL_STEP_IDS.find(
      (s) =>
        s !== "welcome" &&
        !progress.completedSteps.includes(s) &&
        !progress.skippedSteps.includes(s),
    );
    return firstIncomplete ?? "complete";
  }
  return valid;
}

export function markStepComplete(
  progress: OnboardingProgress,
  stepId: string,
): OnboardingProgress {
  return {
    completedSteps: progress.completedSteps.includes(stepId)
      ? progress.completedSteps
      : [...progress.completedSteps, stepId],
    skippedSteps: progress.skippedSteps.filter((s) => s !== stepId),
  };
}

export function markStepSkipped(
  progress: OnboardingProgress,
  stepId: string,
): OnboardingProgress {
  return {
    completedSteps: progress.completedSteps.filter((s) => s !== stepId),
    skippedSteps: progress.skippedSteps.includes(stepId)
      ? progress.skippedSteps
      : [...progress.skippedSteps, stepId],
  };
}

export function canCompleteOnboarding(progress: OnboardingProgress): boolean {
  return REQUIRED_STEPS.every((s) => progress.completedSteps.includes(s));
}
