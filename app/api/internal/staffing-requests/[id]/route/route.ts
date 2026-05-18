import { NextResponse } from "next/server";
import { assertInternalRequest } from "@/lib/request-routing/assert-internal-request";
import { routeStaffingRequest } from "@/lib/request-routing/route-staffing-request";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!assertInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await routeStaffingRequest(id);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    agencyIds: result.agencyIds,
    routeCount: result.routeCount,
  });
}
