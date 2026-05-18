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

  const preview =
    profile ?? (await resolvePublicProfessionalProfile(publicSlug, null));

  if (!preview) {
    return { title: "Professional not found", robots: { index: false, follow: false } };
  }

  const title = `${preview.displayName} — ${preview.roleLabel}`;
  const description = preview.headline;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(preview.photoUrl ? { images: [{ url: preview.photoUrl }] } : {}),
    },
    twitter: {
      card: preview.photoUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(preview.photoUrl ? { images: [preview.photoUrl] } : {}),
    },
    alternates: {
      canonical: `/marketplace/professionals/${publicSlug}`,
    },
    robots: profile
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function MarketplaceProfessionalPage({ params }: PageProps) {
  const { publicSlug } = await params;
  const customerLocation = await getMarketplaceCustomerLocation();
  const profile = await resolvePublicProfessionalProfile(publicSlug, customerLocation);

  if (!profile) notFound();

  return <PublicProfessionalProfileView profile={profile} />;
}
