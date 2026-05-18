export {
  assertCustomerLocationPresent,
  CustomerLocationRequiredError,
  getEligibleProfessionals,
  getVisibilityBlockReason,
  isProfessionalPublicEligible,
} from "@/lib/marketplace/eligibility";
export type {
  CustomerLocationContext,
  EligibleProfessional,
  GetEligibleProfessionalsFilters,
  VisibilityBlockedReason,
} from "@/lib/marketplace/types";
export {
  getMarketplaceVisibilityState,
  setMarketplaceVisibility,
  bulkSetMarketplaceVisibility,
  ensureMarketplaceVisibilityRow,
} from "@/lib/marketplace/visibility-queries";
export { buildVisibilityChecklist } from "@/lib/marketplace/visibility-checklist";
export { syncMarketplaceComplianceBlock } from "@/lib/marketplace/compliance-visibility";
export { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
export {
  resolvePublicProfessionalProfile,
  type PublicProfessionalProfile,
} from "@/lib/marketplace/public-profile-queries";
export {
  enrichEligibleProfessionals,
  runMarketplaceSearch,
  type MarketplaceSearchResult,
} from "@/lib/marketplace/search-results";
export {
  CATEGORY_PAGE_SIZE,
  getMarketplaceCategoryBySlug,
  listMarketplaceCategories,
  type MarketplaceCategory,
} from "@/lib/marketplace/categories";
export { sortCategoryProfessionals } from "@/lib/marketplace/category-sort";
export { getCategoryListings, type CategoryListingsResult } from "@/lib/marketplace/category-listings";
export {
  marketplaceSearchQueryFromUrl,
  parseMarketplaceSearchInput,
  normalizeMarketplaceRoleParam,
} from "@/lib/marketplace/search-params";
