import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce, assertCanViewWorkforce } from "@/lib/auth/workforce-access";
import { createProfessionalCore } from "@/lib/workforce/create-professional-core";
import { parseWorkforceListParams } from "@/lib/workforce/list-filters";
import { getWorkforceList } from "@/lib/workforce/queries";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewWorkforce(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseWorkforceListParams(searchParams);
    const result = await getWorkforceList(agencyId, params);

    return NextResponse.json({
      ...result,
      items: result.items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString(),
        lastShiftAt: item.lastShiftAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/workforce failed", error);
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

    await assertCanManageWorkforce(context.userId, agencyId);

    const body = await request.json();
    const result = await createProfessionalCore(agencyId, context.userId, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { id: result.professionalId, inviteUrl: result.inviteUrl },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/workforce failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
