import {
  CATEGORY_PAGE_SIZE,
  getMarketplaceCategoryBySlug,
  type MarketplaceCategory,
} from "@/lib/marketplace/categories";
import { sortCategoryProfessionals } from "@/lib/marketplace/category-sort";
import { getEligibleProfessionals } from "@/lib/marketplace/eligibility";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";
import {
  enrichEligibleProfessionals,
  type MarketplaceSearchResult,
} from "@/lib/marketplace/search-results";
import type { CustomerLocationContext } from "@/lib/marketplace/types";

export type CategoryListingsResult =
  | { ok: false; notFound: true }
  | {
      ok: true;
      category: MarketplaceCategory;
      results: MarketplaceSearchResult[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      locationRequired: boolean;
    };

export async function getCategoryListings(params: {
  categorySlug: string;
  customerLocation: CustomerLocationContext | null;
  page?: number;
}): Promise<CategoryListingsResult> {
  const category = await getMarketplaceCategoryBySlug(params.categorySlug);
  if (!category) return { ok: false, notFound: true };

  const page = Math.max(1, params.page ?? 1);

  if (!isCustomerLocationValid(params.customerLocation)) {
    return {
      ok: true,
      category,
      results: [],
      total: 0,
      page,
      pageSize: CATEGORY_PAGE_SIZE,
      totalPages: 0,
      locationRequired: true,
    };
  }

  const eligible = await getEligibleProfessionals({
    role: category.roleFilter,
    customerLocation: params.customerLocation,
    limit: 500,
  });

  const enriched = await enrichEligibleProfessionals(eligible);
  const sorted = sortCategoryProfessionals(enriched);
  const total = sorted.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / CATEGORY_PAGE_SIZE);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const offset = (safePage - 1) * CATEGORY_PAGE_SIZE;
  const results = sorted.slice(offset, offset + CATEGORY_PAGE_SIZE);

  return {
    ok: true,
    category,
    results,
    total,
    page: safePage,
    pageSize: CATEGORY_PAGE_SIZE,
    totalPages: total === 0 ? 0 : totalPages,
    locationRequired: false,
  };
}
