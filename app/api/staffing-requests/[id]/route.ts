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
import { getStaffingRequestDetail } from "@/lib/staffing-requests/queries";
import { transitionStaffingRequestCore } from "@/lib/staffing-requests/transition-request";
import { updateStaffingRequestSchema } from "@/lib/validations/staffing-request";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestTable } from "@/drizzle/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewStaffingRequests(authCtx.userId, agencyId);

    const { id } = await context.params;
    const detail = await getStaffingRequestDetail(agencyId, id);
    if (!detail) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...detail,
      createdAt: detail.createdAt.toISOString(),
      updatedAt: detail.updatedAt.toISOString(),
      shifts: detail.shifts.map((s) => ({
        ...s,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/staffing-requests/[id] failed", error);
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

    await assertCanManageStaffingRequests(authCtx.userId, agencyId);

    const { id } = await context.params;
    const body = await request.json();

    if (body.status) {
      const result = await transitionStaffingRequestCore(agencyId, id, body.status);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json({ id: result.requestId, status: result.status });
    }

    const parsed = updateStaffingRequestSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input", field: issue?.path[0] },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(StaffingRequestTable)
      .set({
        ...parsed.data,
        specialty: parsed.data.specialty?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        facilityInstructions: parsed.data.facilityInstructions?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(StaffingRequestTable.id, id), eq(StaffingRequestTable.agencyId, agencyId)))
      .returning({ id: StaffingRequestTable.id });

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/staffing-requests/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
