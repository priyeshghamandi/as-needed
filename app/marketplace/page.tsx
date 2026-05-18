import { MarketplaceHome } from "@/components/marketplace/marketplace-home";
import { listPopularMarketplaceCategories } from "@/lib/marketplace/categories";

export const metadata = {
  title: "Healthcare Staffing Marketplace",
  description:
    "Discover and request healthcare professionals. Staffing fulfilled by agency coordinators.",
};

export default async function MarketplacePage() {
  const categories = await listPopularMarketplaceCategories();
  return <MarketplaceHome categories={categories} />;
}
