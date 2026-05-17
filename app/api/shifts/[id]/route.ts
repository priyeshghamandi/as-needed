import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageShifts, assertCanViewShifts } from "@/lib/auth/shifts-access";
import { getShiftDetail } from "@/lib/shifts/queries";
import { cancelShiftCore, updateShiftCore } from "@/lib/shifts/shift-operations";
import { recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewShifts(authCtx.userId, agencyId);

    const { id } = await context.params;
    const detail = await getShiftDetail(agencyId, id);
    if (!detail) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...detail,
      startAt: detail.startAt.toISOString(),
      endAt: detail.endAt.toISOString(),
      updatedAt: detail.updatedAt.toISOString(),
      assignments: detail.assignments.map((a) => ({
        ...a,
        invitedAt: a.invitedAt?.toISOString() ?? null,
        respondedAt: a.respondedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/shifts/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageShifts(authCtx.userId, agencyId);

    const { id } = await context.params;
    const body = await request.json();

    if (body.action === "cancel") {
      const result = await cancelShiftCore(agencyId, id);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json({ id: result.shiftId, status: "cancelled" });
    }

    if (body.action === "recompute") {
      await recomputeShiftStatus(id);
      return NextResponse.json({ id });
    }

    const result = await updateShiftCore(agencyId, id, body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json({ id: result.shiftId });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/shifts/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
