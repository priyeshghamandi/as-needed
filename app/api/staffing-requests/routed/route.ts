import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanViewStaffingRequests } from "@/lib/auth/staffing-requests-access";
import {
  countRoutedQueueBadge,
  getRoutedRequestsForAgency,
} from "@/lib/request-routing/queries";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewStaffingRequests(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    if (searchParams.get("summary") === "count") {
      const pendingCount = await countRoutedQueueBadge(agencyId);
      return NextResponse.json({ pendingCount });
    }

    const items = await getRoutedRequestsForAgency(agencyId);

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        routedAt: item.routedAt?.toISOString() ?? null,
        responseDueAt: item.responseDueAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/staffing-requests/routed failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
