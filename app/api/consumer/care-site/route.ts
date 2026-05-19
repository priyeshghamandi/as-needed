import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCustomerRole } from "@/lib/auth/customer-requests-access";
import { getConsumerCareSite } from "@/lib/consumer/care-site";
import { isConsumerRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    const { context } = await requireAuthContext();
    assertCustomerRole(context.primaryRole);
    if (!isConsumerRole(context.primaryRole!)) {
      throw new ForbiddenError("Consumer access required.");
    }

    const site = await getConsumerCareSite(context.userId);
    if (!site) {
      return NextResponse.json({ error: "No care site found." }, { status: 404 });
    }

    return NextResponse.json({
      careSiteId: site.careSiteId,
      facilityName: site.facilityName,
      city: site.city,
      state: site.state,
      latitude: site.latitude ? Number(site.latitude) : null,
      longitude: site.longitude ? Number(site.longitude) : null,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/consumer/care-site failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
