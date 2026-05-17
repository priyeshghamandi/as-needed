import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageFacilities, assertCanViewFacilities } from "@/lib/auth/facilities-access";
import { db } from "@/drizzle/db";
import { FacilityTable } from "@/drizzle/schema";
import { getFacilityDetail, isContactEmailTaken } from "@/lib/facilities/queries";
import { updateFacilitySchema } from "@/lib/validations/facility";

type RouteContext = { params: Promise<{ id: string }> };

function serializeDetail(detail: NonNullable<Awaited<ReturnType<typeof getFacilityDetail>>>) {
  return {
    ...detail,
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt.toISOString(),
    recentRequests: detail.recentRequests.map((r) => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
    })),
    activityFeed: detail.activityFeed.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
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

    await assertCanViewFacilities(auth.userId, agencyId);

    const detail = await getFacilityDetail(agencyId, id);
    if (!detail) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json(serializeDetail(detail));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/facilities/[id] failed", error);
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

    await assertCanManageFacilities(auth.userId, agencyId);

    const parsed = updateFacilitySchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input.", field: issue?.path[0] },
        { status: 400 },
      );
    }

    const taken = await isContactEmailTaken(agencyId, parsed.data.contactEmail, id);
    if (taken) {
      return NextResponse.json(
        { error: "A facility with this contact email already exists in your agency.", field: "contactEmail" },
        { status: 409 },
      );
    }

    const [updated] = await db
      .update(FacilityTable)
      .set({
        name: parsed.data.name.trim(),
        type: parsed.data.type,
        contactName: parsed.data.contactName.trim(),
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone.trim(),
        notes: parsed.data.notes || null,
        updatedAt: new Date(),
      })
      .where(and(eq(FacilityTable.id, id), eq(FacilityTable.agencyId, agencyId)))
      .returning({ id: FacilityTable.id });

    if (!updated) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/facilities/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
