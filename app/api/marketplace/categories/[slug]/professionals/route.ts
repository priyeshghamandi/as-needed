import { NextResponse } from "next/server";
import { getCategoryListings } from "@/lib/marketplace/category-listings";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const cookieLocation = await getMarketplaceCustomerLocation();

  const customerLocation =
    lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { latitude: Number(lat), longitude: Number(lng) }
      : cookieLocation;

  if (!customerLocation) {
    return NextResponse.json(
      { error: "Facility location is required", professionals: [] },
      { status: 400 },
    );
  }

  const payload = await getCategoryListings({
    categorySlug: slug,
    customerLocation,
    page,
  });

  if (!payload.ok) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({
    category: {
      slug: payload.category.slug,
      name: payload.category.name,
      roleFilter: payload.category.roleFilter,
    },
    professionals: payload.results,
    total: payload.total,
    page: payload.page,
    pageSize: payload.pageSize,
    totalPages: payload.totalPages,
    locationRequired: payload.locationRequired,
  });
}
