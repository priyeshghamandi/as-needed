import { MarketplaceHome } from "@/components/marketplace/marketplace-home";
import { listMarketplaceCategories } from "@/lib/marketplace/categories";

export const metadata = {
  title: "Healthcare Staffing Marketplace",
  description:
    "Search and browse healthcare professionals by role and location. Request staffing fulfilled by licensed agencies.",
};

export default async function MarketplacePage() {
  const categories = await listMarketplaceCategories();
  return <MarketplaceHome categories={categories} />;
}
