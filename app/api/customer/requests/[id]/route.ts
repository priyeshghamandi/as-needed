import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireCustomerContext } from "@/lib/auth/customer-requests-access";
import { resolveCustomerOrConsumerScope } from "@/lib/customer-requests/customer-scope";
import { getCustomerRequestDetail } from "@/lib/customer-requests/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { session, context: authContext } = await requireAuthContext();
    const { email } = await requireCustomerContext(authContext, session.user?.email);
    const scopeResult = await resolveCustomerOrConsumerScope(authContext.userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const { id } = await context.params;
    const detail = await getCustomerRequestDetail(scopeResult.scope.facilityId, id);
    if (!detail) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({
      ...detail,
      shiftStartAt: detail.shiftStartAt?.toISOString() ?? null,
      shiftEndAt: detail.shiftEndAt?.toISOString() ?? null,
      customerSubmittedAt: detail.customerSubmittedAt?.toISOString() ?? null,
      updatedAt: detail.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/customer/requests/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
