import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { listAlternativePickerCandidates } from "@/lib/alternatives/picker-candidates";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageStaffingRequests(authCtx.userId, agencyId);

    const { id } = await context.params;
    const allowed = await hasStaffingRequestAgencyAccess(agencyId, id);
    if (!allowed) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const url = new URL(request.url);
    const originalProfessionalId = url.searchParams.get("originalProfessionalId");
    if (!originalProfessionalId) {
      return NextResponse.json(
        { error: "originalProfessionalId is required." },
        { status: 400 },
      );
    }

    const search = url.searchParams.get("search") ?? undefined;
    const candidates = await listAlternativePickerCandidates({
      agencyId,
      staffingRequestId: id,
      originalProfessionalId,
      search,
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET .../alternatives/candidates failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
