import { asc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { MarketplaceCategoryTable } from "@/drizzle/schema";
export type MarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  roleFilter: string;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export const CATEGORY_PAGE_SIZE = 24;

function mapRow(row: typeof MarketplaceCategoryTable.$inferSelect): MarketplaceCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    roleFilter: row.roleFilter,
    sortOrder: row.sortOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}

export const POPULAR_CATEGORY_LIMIT = 6;

export async function listMarketplaceCategories(): Promise<MarketplaceCategory[]> {
  const rows = await db
    .select()
    .from(MarketplaceCategoryTable)
    .where(eq(MarketplaceCategoryTable.isActive, true))
    .orderBy(asc(MarketplaceCategoryTable.sortOrder));

  return rows.map(mapRow);
}

export async function listPopularMarketplaceCategories(): Promise<MarketplaceCategory[]> {
  const categories = await listMarketplaceCategories();
  return categories.slice(0, POPULAR_CATEGORY_LIMIT);
}

export async function getMarketplaceCategoryBySlug(
  slug: string,
): Promise<MarketplaceCategory | null> {
  const [row] = await db
    .select()
    .from(MarketplaceCategoryTable)
    .where(eq(MarketplaceCategoryTable.slug, slug))
    .limit(1);

  if (!row || !row.isActive) return null;
  return mapRow(row);
}

export { sortCategoryProfessionals } from "@/lib/marketplace/category-sort";
