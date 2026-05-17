import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import {
  assertCanManageStaffingRequests,
  assertCanViewStaffingRequests,
} from "@/lib/auth/staffing-requests-access";
import { createStaffingRequestCore } from "@/lib/staffing-requests/create-request";
import { parseStaffingRequestsListParams } from "@/lib/staffing-requests/list-filters";
import { getStaffingRequestsList } from "@/lib/staffing-requests/queries";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewStaffingRequests(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseStaffingRequestsListParams(searchParams);
    const result = await getStaffingRequestsList(agencyId, params);

    return NextResponse.json({
      ...result,
      items: result.items.map((item) => ({
        ...item,
        shiftStartAt: item.shiftStartAt?.toISOString() ?? null,
        shiftEndAt: item.shiftEndAt?.toISOString() ?? null,
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
    console.error("GET /api/staffing-requests failed", error);
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

    await assertCanManageStaffingRequests(context.userId, agencyId);

    const body = await request.json();
    const result = await createStaffingRequestCore(agencyId, context.userId, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json({ id: result.requestId }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/staffing-requests failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
