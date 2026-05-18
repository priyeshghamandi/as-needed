import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireFacilityCustomerContext } from "@/lib/auth/customer-requests-access";
import { createCustomerStaffingRequest } from "@/lib/customer-requests/create-customer-request";
import { resolveCustomerFacilityScope } from "@/lib/customer-requests/facility-scope";
import { listCustomerRequests } from "@/lib/customer-requests/queries";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";

export async function GET() {
  try {
    const { session, context } = await requireAuthContext();
    const { email } = await requireFacilityCustomerContext(context, session.user?.email);
    const scopeResult = await resolveCustomerFacilityScope(context.userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const items = await listCustomerRequests(scopeResult.scope.facilityId);
    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        shiftStartAt: item.shiftStartAt?.toISOString() ?? null,
        shiftEndAt: item.shiftEndAt?.toISOString() ?? null,
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
    console.error("GET /api/customer/requests failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, context } = await requireAuthContext();
    const { email, userId } = await requireFacilityCustomerContext(context, session.user?.email);
    const scopeResult = await resolveCustomerFacilityScope(userId, email);
    if (!scopeResult.ok) {
      return NextResponse.json({ error: "No facility linked to your account." }, { status: 403 });
    }

    const body = await request.json();
    const customerLocation = await getMarketplaceCustomerLocation();
    const result = await createCustomerStaffingRequest({
      userId,
      scope: scopeResult.scope,
      input: body,
      customerLocation,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.message,
          code: result.code,
          field: result.field,
          existingRequestId: result.existingRequestId,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({ id: result.requestId }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/customer/requests failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
