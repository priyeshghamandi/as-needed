import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce, assertCanViewWorkforce } from "@/lib/auth/workforce-access";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import { getProfessionalProfile } from "@/lib/workforce/queries";
import { updateProfessionalSchema } from "@/lib/validations/workforce-professional";

type RouteContext = { params: Promise<{ id: string }> };

function serializeProfile(profile: NonNullable<Awaited<ReturnType<typeof getProfessionalProfile>>>) {
  return {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    recentShifts: profile.recentShifts.map((s) => ({
      ...s,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
    })),
    currentAssignments: profile.currentAssignments.map((a) => ({
      ...a,
      startAt: a.startAt.toISOString(),
      endAt: a.endAt.toISOString(),
    })),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewWorkforce(auth.userId, agencyId);

    const profile = await getProfessionalProfile(agencyId, id);
    if (!profile) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/workforce/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageWorkforce(auth.userId, agencyId);

    const parsed = updateProfessionalSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input.", field: issue?.path[0] },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(HealthcareProfessionalTable)
      .set({
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        role: parsed.data.role,
        specialty: parsed.data.specialty || null,
        yearsExperience: parsed.data.yearsExperience ?? null,
        phone: parsed.data.phone || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(HealthcareProfessionalTable.id, id),
          eq(HealthcareProfessionalTable.agencyId, agencyId),
        ),
      )
      .returning({ id: HealthcareProfessionalTable.id });

    if (!updated) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/workforce/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
