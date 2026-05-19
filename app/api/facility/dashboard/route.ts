import { NextResponse } from "next/server";
import {
  FacilityNotLinkedError,
  requireFacilityContext,
} from "@/lib/facility/require-facility-context";
import { getFacilityDashboard } from "@/lib/facility/queries";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";

export async function GET() {
  try {
    const ctx = await requireFacilityContext();
    const data = await getFacilityDashboard(ctx.facility);
    return NextResponse.json({
      ...data,
      activeRequests: data.activeRequests.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
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
    console.error("GET /api/facility/dashboard failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
