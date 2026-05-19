import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireCustomerContext } from "@/lib/auth/customer-requests-access";
import { rejectSuggestedAlternative } from "@/lib/alternatives/reject-alternative";
import { resolveCustomerOrConsumerScope } from "@/lib/customer-requests/customer-scope";

type RouteContext = { params: Promise<{ id: string; altId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { session, context: authContext } = await requireAuthContext();
    const { email } = await requireCustomerContext(authContext, session.user?.email);
    const scopeResult = await resolveCustomerOrConsumerScope(authContext.userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const { id, altId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await rejectSuggestedAlternative({
      facilityId: scopeResult.scope.facilityId,
      staffingRequestId: id,
      alternativeId: altId,
      body,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ fulfillmentStatus: "customer_rejected" });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST .../alternatives/[altId]/reject failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
