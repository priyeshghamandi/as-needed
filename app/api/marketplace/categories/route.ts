import { NextResponse } from "next/server";
import { listMarketplaceCategories } from "@/lib/marketplace/categories";

export async function GET() {
  const categories = await listMarketplaceCategories();
  return NextResponse.json({ categories });
}
