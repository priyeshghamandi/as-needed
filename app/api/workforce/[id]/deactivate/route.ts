import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageWorkforce(auth.userId, agencyId);

    const [updated] = await db
      .update(HealthcareProfessionalTable)
      .set({ isActive: false, availabilityStatus: "unavailable", updatedAt: new Date() })
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
    console.error("POST /api/workforce/[id]/deactivate failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
