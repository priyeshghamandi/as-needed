import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { ALL_STEP_IDS, markStepComplete, markStepSkipped } from "@/lib/onboarding/progress";

const stepPatchSchema = z.object({
  stepId: z.enum(ALL_STEP_IDS),
  action: z.enum(["complete", "skip", "navigate"]),
});

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = stepPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageOnboarding(context.userId, agencyId);

    const agencies = await db
      .select({
        onboardingProgress: AgencyTable.onboardingProgress,
      })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = agencies[0];
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const current = agency.onboardingProgress ?? { completedSteps: [], skippedSteps: [] };

    let updatedProgress = current;
    if (parsed.data.action === "complete") {
      updatedProgress = markStepComplete(current, parsed.data.stepId);
    } else if (parsed.data.action === "skip") {
      updatedProgress = markStepSkipped(current, parsed.data.stepId);
    }

    await db
      .update(AgencyTable)
      .set({
        onboardingProgress: updatedProgress,
        onboardingCurrentStep: parsed.data.stepId,
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    return NextResponse.json({ ok: true, progress: updatedProgress });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Only agency") ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
