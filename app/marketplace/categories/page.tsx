import Link from "next/link";
import { LocationRequiredBanner } from "@/components/marketplace/location-context";
import { listMarketplaceCategories } from "@/lib/marketplace/categories";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";

export const metadata = {
  title: "Browse categories",
  description:
    "Browse healthcare professional roles on the marketplace. Set your facility location to see who is available in your area.",
};

export default async function MarketplaceCategoriesPage() {
  const categories = await listMarketplaceCategories();
  const customerLocation = await getMarketplaceCustomerLocation();
  const hasLocation = isCustomerLocationValid(customerLocation);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-12">
      <nav className="text-[13px] text-ink-600">
        <Link href="/marketplace" className="hover:underline">
          Marketplace
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">Categories</span>
      </nav>

      <h1 className="mt-4 text-[28px] font-medium tracking-tight">Browse by role</h1>
      <p className="mt-3 text-[15px] text-ink-600 max-w-xl">
        Explore healthcare roles and view agency-vetted professionals available near your
        facility. Requests are fulfilled by licensed staffing agencies — not direct hires.
      </p>

      {!hasLocation ? <LocationRequiredBanner context="categories" /> : null}

      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/marketplace/categories/${cat.slug}`}
              className="block rounded-xl border border-ink-200 bg-white p-5 hover:border-teal-300 hover:shadow-sm transition h-full"
            >
              <span className="text-[16px] font-medium tracking-tight">{cat.name}</span>
              {cat.description ? (
                <p className="mt-2 text-[13px] text-ink-600 leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              ) : null}
              <span className="mt-3 block text-[12px] text-teal-800">View professionals →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
