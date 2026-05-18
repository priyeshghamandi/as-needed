import type { Metadata } from "next";
import { auth } from "@/auth";
import { FulfillmentBanner } from "@/components/marketplace/fulfillment-banner";
import { MarketplaceFooter } from "@/components/marketplace/marketplace-footer";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";

export const metadata: Metadata = {
  title: "Healthcare Staffing Marketplace",
  description:
    "Discover and request healthcare professionals. Staffing fulfilled by agency coordinators.",
  robots: { index: true, follow: true },
};

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isFacilityUser = session?.user?.primaryRole === "facility_user";

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <FulfillmentBanner />
      <MarketplaceHeader
        showFacilityRequestsLink={isFacilityUser}
        facilityUserName={isFacilityUser ? session?.user?.name : null}
      />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
