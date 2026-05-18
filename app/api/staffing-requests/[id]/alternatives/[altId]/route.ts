import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { withdrawSuggestedAlternative } from "@/lib/alternatives/withdraw-alternative";

type RouteContext = { params: Promise<{ id: string; altId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageStaffingRequests(authCtx.userId, agencyId);

    const { id, altId } = await context.params;
    const result = await withdrawSuggestedAlternative({
      agencyId,
      staffingRequestId: id,
      alternativeId: altId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("DELETE .../alternatives/[altId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
