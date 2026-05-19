import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireCustomerContext } from "@/lib/auth/customer-requests-access";
import { approveCustomerFulfillment } from "@/lib/fulfillment/approve-customer-fulfillment";
import { resolveCustomerOrConsumerScope } from "@/lib/customer-requests/customer-scope";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { session, context: authContext } = await requireAuthContext();
    const { email } = await requireCustomerContext(authContext, session.user?.email);
    const scopeResult = await resolveCustomerOrConsumerScope(authContext.userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const { id } = await context.params;
    const result = await approveCustomerFulfillment({
      facilityId: scopeResult.scope.facilityId,
      staffingRequestId: id,
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
    console.error("POST /api/customer/requests/[id]/approve-fulfillment failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
