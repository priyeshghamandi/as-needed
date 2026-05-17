import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanViewMatchPageAccess } from "@/lib/auth/assignments-access";
import { getShiftAssignmentsForRequest } from "@/lib/matching/candidate-query";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewMatchPageAccess(authCtx.userId, agencyId);

    const { id } = await context.params;
    const shiftId = new URL(request.url).searchParams.get("shiftId") ?? undefined;

    const assignments = await getShiftAssignmentsForRequest(agencyId, id, shiftId);

    return NextResponse.json({
      assignments: assignments.map((a) => ({
        ...a,
        invitedAt: a.invitedAt?.toISOString() ?? null,
        respondedAt: a.respondedAt?.toISOString() ?? null,
        confirmedAt: a.confirmedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("GET /api/staffing-requests/[id]/assignments failed", error);
    const message = error instanceof Error ? error.message : "Unable to load assignments.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
