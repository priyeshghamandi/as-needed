import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { createSuggestedAlternative } from "@/lib/alternatives/create-alternative";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageStaffingRequests(authCtx.userId, agencyId);

    const { id } = await context.params;
    const body = await request.json();
    const result = await createSuggestedAlternative({
      agencyId,
      userId: authCtx.userId,
      staffingRequestId: id,
      body,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, code: result.code },
        { status: result.status },
      );
    }

    return NextResponse.json({ alternativeId: result.alternativeId });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/staffing-requests/[id]/alternatives failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
