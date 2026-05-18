import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryPagination } from "@/components/marketplace/category-pagination";
import { LocationRequiredBanner } from "@/components/marketplace/location-context";
import { MarketplaceProfessionalCard } from "@/components/marketplace/marketplace-professional-card";
import { getCategoryListings } from "@/lib/marketplace/category-listings";
import { getMarketplaceCategoryBySlug } from "@/lib/marketplace/categories";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getMarketplaceCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  const customerLocation = await getMarketplaceCustomerLocation();
  const hasLocation = isCustomerLocationValid(customerLocation);

  return {
    title: category.seoTitle ?? `${category.name} — Marketplace`,
    description:
      category.seoDescription ??
      `Browse ${category.name} professionals available in your facility area.`,
    robots: hasLocation ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical: `/marketplace/categories/${slug}`,
    },
  };
}

export default async function MarketplaceCategorySlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const customerLocation = await getMarketplaceCustomerLocation();
  const payload = await getCategoryListings({
    categorySlug: slug,
    customerLocation,
    page,
  });

  if (!payload.ok) notFound();

  const { category, results, total, locationRequired, totalPages } = payload;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-12">
      <nav className="text-[13px] text-ink-600" aria-label="Breadcrumb">
        <Link href="/marketplace" className="hover:underline">
          Marketplace
        </Link>
        <span className="mx-2">/</span>
        <Link href="/marketplace/categories" className="hover:underline">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{category.name}</span>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-[28px] font-medium tracking-tight">{category.name}</h1>
        {category.description ? (
          <p className="mt-3 text-[15px] text-ink-600 leading-relaxed">{category.description}</p>
        ) : null}
        <p className="mt-3 text-[13px] text-ink-500 border-l-2 border-teal-600 pl-3">
          Requests are fulfilled by licensed staffing agencies — submit a staffing request, not a
          direct hire.
        </p>
      </header>

      {locationRequired ? <LocationRequiredBanner /> : null}

      {!locationRequired ? (
        <section className="mt-8 space-y-4" aria-labelledby="category-results-heading">
          <h2 id="category-results-heading" className="text-[18px] font-medium tracking-tight">
            {total === 0
              ? `No ${category.name} professionals available in your area`
              : `${total} professional${total === 1 ? "" : "s"} available in your area`}
          </h2>

          {total === 0 ? (
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-6 text-[14px] text-ink-700">
              Try another role, adjust your facility location, or use{" "}
              <Link
                href={`/marketplace/search?role=${category.roleFilter}&urgency=flexible`}
                className="text-teal-800 hover:underline"
              >
                marketplace search
              </Link>{" "}
              with broader criteria.
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {results.map((result) => (
                  <li key={result.id}>
                    <MarketplaceProfessionalCard result={result} />
                  </li>
                ))}
              </ul>
              <CategoryPagination slug={slug} page={page} totalPages={totalPages} />
            </>
          )}
        </section>
      ) : null}

      <p className="mt-8 text-[14px] text-ink-600">
        Need more filters?{" "}
        <Link
          href={`/marketplace/search?role=${category.roleFilter}`}
          className="text-teal-800 hover:underline"
        >
          Search {category.name}
        </Link>
        .
      </p>
    </div>
  );
}
