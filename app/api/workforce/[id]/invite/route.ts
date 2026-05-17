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
import { createUserInvite } from "@/lib/services/invites";

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

    const [pro] = await db
      .select({
        email: HealthcareProfessionalTable.email,
        userId: HealthcareProfessionalTable.userId,
      })
      .from(HealthcareProfessionalTable)
      .where(
        and(
          eq(HealthcareProfessionalTable.id, id),
          eq(HealthcareProfessionalTable.agencyId, agencyId),
        ),
      )
      .limit(1);

    if (!pro) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }
    if (pro.userId) {
      return NextResponse.json({ error: "Professional already has an account" }, { status: 400 });
    }
    if (!pro.email) {
      return NextResponse.json({ error: "Email is required to send an invite" }, { status: 400 });
    }

    const invite = await createUserInvite(
      { email: pro.email, role: "provider", inviteType: "provider" },
      auth.userId,
      agencyId,
    );
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

    return NextResponse.json({ inviteUrl: `${base}/invite/${invite.token}` });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/workforce/[id]/invite failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
