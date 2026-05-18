import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireFacilityCustomerContext } from "@/lib/auth/customer-requests-access";
import { approveSuggestedAlternative } from "@/lib/alternatives/approve-alternative";
import { resolveCustomerFacilityScope } from "@/lib/customer-requests/facility-scope";

type RouteContext = { params: Promise<{ id: string; altId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { session, context: authContext } = await requireAuthContext();
    const { email } = await requireFacilityCustomerContext(authContext, session.user?.email);
    const scopeResult = await resolveCustomerFacilityScope(authContext.userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const { id, altId } = await context.params;
    const result = await approveSuggestedAlternative({
      facilityId: scopeResult.scope.facilityId,
      staffingRequestId: id,
      alternativeId: altId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ fulfillmentStatus: "customer_approved" });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST .../alternatives/[altId]/approve failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
