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
  const role = session?.user?.primaryRole;
  const isFacilityUser = role === "facility_user";
  const isConsumer = role === "consumer";
  const showCustomerRequestsLink = isFacilityUser || isConsumer;

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <FulfillmentBanner />
      <MarketplaceHeader
        showCustomerRequestsLink={showCustomerRequestsLink}
        customerRequestsLabel={
          isConsumer ? "My care requests" : "My staffing requests"
        }
        signedInUserName={showCustomerRequestsLink ? session?.user?.name : null}
        showCareSignupLink={!session?.user}
      />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
