import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageFacilities } from "@/lib/auth/facilities-access";
import { db } from "@/drizzle/db";
import { FacilityTable } from "@/drizzle/schema";
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

    await assertCanManageFacilities(auth.userId, agencyId);

    const [facility] = await db
      .select({ contactEmail: FacilityTable.contactEmail })
      .from(FacilityTable)
      .where(and(eq(FacilityTable.id, id), eq(FacilityTable.agencyId, agencyId)))
      .limit(1);

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }
    if (!facility.contactEmail) {
      return NextResponse.json({ error: "Contact email is required to send an invite" }, { status: 400 });
    }

    const invite = await createUserInvite(
      {
        email: facility.contactEmail,
        role: "facility_user",
        inviteType: "facility_user",
        facilityId: id,
      },
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
    console.error("POST /api/facilities/[id]/invite failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
