"use server";

import { eq } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { onboardingProfileSchema, type OnboardingProfileInput } from "@/lib/validations/onboarding-profile";
import { markStepComplete } from "@/lib/onboarding/progress";

export type SaveProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function saveOnboardingProfileAction(
  input: OnboardingProfileInput,
): Promise<SaveProfileState> {
  const parsed = onboardingProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid profile data.",
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
      "profile",
    );

    await db
      .update(AgencyTable)
      .set({
        phone: parsed.data.phone,
        website: parsed.data.website || null,
        logoUrl: parsed.data.logoUrl || null,
        description: parsed.data.description || null,
        operationalContactName: parsed.data.operationalContactName,
        operationalContactEmail: parsed.data.operationalContactEmail,
        staffingSpecialties: parsed.data.staffingSpecialties,
        onboardingProgress: progress,
        onboardingCurrentStep: "service-area",
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    return { status: "success" };
  } catch (error) {
    console.error("saveOnboardingProfileAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save profile.",
    };
  }
}
