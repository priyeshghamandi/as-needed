import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { canCompleteOnboarding } from "@/lib/onboarding/progress";

export async function POST() {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageOnboarding(context.userId, agencyId);

    const agencies = await db
      .select({ onboardingProgress: AgencyTable.onboardingProgress })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = agencies[0];
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const progress = agency.onboardingProgress ?? { completedSteps: [], skippedSteps: [] };

    if (!canCompleteOnboarding(progress)) {
      return NextResponse.json(
        { error: "Complete required steps (Agency Profile and Service Area) before finishing setup." },
        { status: 422 },
      );
    }

    await db
      .update(AgencyTable)
      .set({
        onboardingCompletedAt: new Date(),
        onboardingCurrentStep: "complete",
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Only agency") ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
