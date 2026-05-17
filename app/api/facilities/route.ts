import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageFacilities, assertCanViewFacilities } from "@/lib/auth/facilities-access";
import { createFacilityCore } from "@/lib/facilities/create-facility-core";
import { parseFacilitiesListParams } from "@/lib/facilities/list-filters";
import { getFacilitiesList } from "@/lib/facilities/queries";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewFacilities(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseFacilitiesListParams(searchParams);
    const result = await getFacilitiesList(agencyId, params);

    return NextResponse.json({
      ...result,
      items: result.items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/facilities failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageFacilities(context.userId, agencyId);

    const body = await request.json();
    const result = await createFacilityCore(agencyId, context.userId, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { id: result.facilityId, inviteUrl: result.inviteUrl },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/facilities failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
