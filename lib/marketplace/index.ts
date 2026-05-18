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
