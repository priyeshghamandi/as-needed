"use server";

import { eq } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { onboardingServiceAreaSchema, type OnboardingServiceAreaInput } from "@/lib/validations/onboarding-service-area";
import { markStepComplete } from "@/lib/onboarding/progress";

export type SaveServiceAreaState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function saveOnboardingServiceAreaAction(
  input: OnboardingServiceAreaInput,
): Promise<SaveServiceAreaState> {
  const parsed = onboardingServiceAreaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid service area data.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    await assertCanManageOnboarding(context.userId, agencyId);

    const agencies = await db
      .select({ onboardingProgress: AgencyTable.onboardingProgress })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = agencies[0];
    if (!agency) return { status: "error", message: "Agency not found." };

    const progress = markStepComplete(
      agency.onboardingProgress ?? { completedSteps: [], skippedSteps: [] },
      "service-area",
    );

    const { primaryServiceArea, serviceAreaRadiusMiles } = parsed.data;

    await db
      .update(AgencyTable)
      .set({
        primaryServiceAreaName: primaryServiceArea.displayName,
        primaryServiceAreaPlaceId: primaryServiceArea.placeId,
        primaryServiceAreaCity: primaryServiceArea.city || null,
        primaryServiceAreaState: primaryServiceArea.state || null,
        primaryServiceAreaCountry: primaryServiceArea.country,
        primaryServiceAreaLat: String(primaryServiceArea.latitude),
        primaryServiceAreaLng: String(primaryServiceArea.longitude),
        serviceAreaRadiusMiles,
        onboardingProgress: progress,
        onboardingCurrentStep: "team",
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    return { status: "success" };
  } catch (error) {
    console.error("saveOnboardingServiceAreaAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save service area.",
    };
  }
}
