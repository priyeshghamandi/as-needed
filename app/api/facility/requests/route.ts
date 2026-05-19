import { NextResponse } from "next/server";
import {
  FacilityNotLinkedError,
  requireFacilityContext,
} from "@/lib/facility/require-facility-context";
import { parseFacilityRequestListParams } from "@/lib/facility/list-filters";
import { listFacilityRequests } from "@/lib/facility/queries";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";

export async function GET(request: Request) {
  try {
    const ctx = await requireFacilityContext();
    const { searchParams } = new URL(request.url);
    const params = parseFacilityRequestListParams(searchParams);
    const { items, total } = await listFacilityRequests(ctx.facility, params);

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page: params.page,
      pageSize: params.pageSize,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof FacilityNotLinkedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/facility/requests failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
