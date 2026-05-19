import { NextResponse } from "next/server";
import {
  FacilityNotLinkedError,
  requireFacilityContext,
} from "@/lib/facility/require-facility-context";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";

export async function GET() {
  try {
    const ctx = await requireFacilityContext();
    return NextResponse.json({
      facility: {
        id: ctx.facility.facilityId,
        name: ctx.facility.facilityName,
      },
      agency: {
        id: ctx.facility.agencyId,
        name: ctx.facility.agencyName,
      },
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
    console.error("GET /api/facility/context failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
