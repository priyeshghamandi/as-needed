import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { updateProfessionalLocation } from "@/lib/workforce/update-professional-location";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageWorkforce(auth.userId, agencyId);

    const body = await request.json();
    const result = await updateProfessionalLocation(agencyId, id, body.location);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, field: result.field },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/workforce/[id]/location failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
