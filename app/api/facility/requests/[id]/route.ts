import { NextResponse } from "next/server";
import {
  FacilityNotLinkedError,
  requireFacilityContext,
} from "@/lib/facility/require-facility-context";
import { getFacilityRequestDetail } from "@/lib/facility/queries";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const ctx = await requireFacilityContext();
    const { id } = await context.params;
    const detail = await getFacilityRequestDetail(ctx.facility, id);

    if (!detail) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...detail,
      createdAt: detail.createdAt.toISOString(),
      updatedAt: detail.updatedAt.toISOString(),
      shifts: detail.shifts.map((s) => ({
        ...s,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
      })),
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
    console.error("GET /api/facility/requests/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
