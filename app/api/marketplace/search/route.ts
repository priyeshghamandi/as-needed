import { NextResponse } from "next/server";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
import {
  marketplaceSearchQueryFromUrl,
  parseMarketplaceSearchInput,
} from "@/lib/marketplace/search-params";
import { runMarketplaceSearch } from "@/lib/marketplace/search-results";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = marketplaceSearchQueryFromUrl(searchParams);
  const cookieLocation = await getMarketplaceCustomerLocation();

  const parsed = parseMarketplaceSearchInput(query, cookieLocation);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = await runMarketplaceSearch(parsed.data);

  return NextResponse.json({
    ...payload,
    role: parsed.data.role,
    needStart: parsed.data.needStart,
    needEnd: parsed.data.needEnd,
    urgency: parsed.data.urgency,
    sort: parsed.data.sort,
  });
}
