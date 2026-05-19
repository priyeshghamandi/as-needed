import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireCustomerContext } from "@/lib/auth/customer-requests-access";
import { getCustomerSelectionPreviews } from "@/lib/customer-requests/create-customer-request";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";

export async function GET(request: Request) {
  try {
    const { session, context } = await requireAuthContext();
    await requireCustomerContext(context, session.user?.email);

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids") ?? "";
    const professionalIds = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const customerLocation = await getMarketplaceCustomerLocation();
    const previews = await getCustomerSelectionPreviews(professionalIds, customerLocation);

    return NextResponse.json({ items: previews });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/customer/requests/selections failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
