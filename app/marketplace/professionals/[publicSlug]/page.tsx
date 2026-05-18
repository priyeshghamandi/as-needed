import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfessionalProfileView } from "@/components/marketplace/public-professional-profile";
import { getMarketplaceCustomerLocation } from "@/lib/marketplace/customer-location";
import { resolvePublicProfessionalProfile } from "@/lib/marketplace/public-profile-queries";

type PageProps = {
  params: Promise<{ publicSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicSlug } = await params;
  const customerLocation = await getMarketplaceCustomerLocation();
  const profile = await resolvePublicProfessionalProfile(publicSlug, customerLocation);

  if (!profile) {
    return { title: "Professional not found" };
  }

  return {
    title: `${profile.displayName} — ${profile.roleLabel}`,
    description: profile.headline,
  };
}

export default async function MarketplaceProfessionalPage({ params }: PageProps) {
  const { publicSlug } = await params;
  const customerLocation = await getMarketplaceCustomerLocation();
  const profile = await resolvePublicProfessionalProfile(publicSlug, customerLocation);

  if (!profile) notFound();

  return <PublicProfessionalProfileView profile={profile} />;
}
