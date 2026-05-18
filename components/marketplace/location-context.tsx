export {
  MARKETPLACE_LOCATION_COOKIE,
  MARKETPLACE_LOCATION_MAX_AGE,
  parseMarketplaceLocationCookie,
  serializeMarketplaceLocationCookie,
  type MarketplaceLocationCookie,
} from "@/lib/marketplace/location-cookie";

export { LocationChip } from "@/components/marketplace/location-chip";

export function LocationRequiredBanner({ context = "listings" }: { context?: string }) {
  return (
    <div
      className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
      role="status"
    >
      Set your <span className="font-medium">facility location</span> in the header to see
      {context === "categories" ? " category counts and " : " "}
      professional {context} in your area.
    </div>
  );
}
