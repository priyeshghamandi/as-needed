export const MARKETPLACE_CUSTOMER_SOURCES = [
  "marketplace_customer",
  "marketplace_consumer",
] as const;

export type MarketplaceCustomerSource =
  (typeof MARKETPLACE_CUSTOMER_SOURCES)[number];

export function isMarketplaceCustomerSource(
  source: string,
): source is MarketplaceCustomerSource {
  return (MARKETPLACE_CUSTOMER_SOURCES as readonly string[]).includes(source);
}
