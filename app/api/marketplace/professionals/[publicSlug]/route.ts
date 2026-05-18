import { NextResponse } from "next/server";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
import { resolvePublicProfessionalProfile } from "@/lib/marketplace/public-profile-queries";

type RouteContext = {
  params: Promise<{ publicSlug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { publicSlug } = await context.params;
  const customerLocation = await getMarketplaceCustomerLocation();
  const profile = await resolvePublicProfessionalProfile(publicSlug, customerLocation);

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
