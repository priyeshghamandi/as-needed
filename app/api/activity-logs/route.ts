import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import {
  assertActivityEntityInAgency,
  assertAgencyActivityAccess,
} from "@/lib/auth/activity-access";
import { parseActivityListParams } from "@/lib/activity/list-filters";
import { listActivityLogs } from "@/lib/activity/queries";
import { isAgencyRole, isFacilityRole, isProviderRole } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    const hasAgencyRole = context.roles.some((r) => isAgencyRole(r.role));
    const hasProvider = context.roles.some((r) => isProviderRole(r.role));
    const hasFacility = context.roles.some((r) => isFacilityRole(r.role));

    if (!hasAgencyRole || hasProvider || hasFacility) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await assertAgencyActivityAccess(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseActivityListParams(searchParams);

    if (params.entityType && !params.entityId) {
      return NextResponse.json(
        { error: "entityId is required when entityType is set" },
        { status: 400 },
      );
    }

    if (params.entityType && params.entityId) {
      await assertActivityEntityInAgency(agencyId, params.entityType, params.entityId);
    }

    const result = await listActivityLogs(agencyId, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/activity-logs failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
