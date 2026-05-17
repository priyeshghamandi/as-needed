import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageShifts, assertCanViewShifts } from "@/lib/auth/shifts-access";
import { parseShiftsListParams } from "@/lib/shifts/list-filters";
import { getShiftsList } from "@/lib/shifts/queries";
import { createSecondaryShiftCore } from "@/lib/shifts/shift-operations";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewShifts(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseShiftsListParams(searchParams);
    const result = await getShiftsList(agencyId, params);

    return NextResponse.json({
      ...result,
      items: result.items.map((item) => ({
        ...item,
        startAt: item.startAt.toISOString(),
        endAt: item.endAt.toISOString(),
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
    console.error("GET /api/shifts failed", error);
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

    await assertCanManageShifts(context.userId, agencyId);

    const body = await request.json();
    const result = await createSecondaryShiftCore(agencyId, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json({ id: result.shiftId }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/shifts failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
