import { notFound } from "next/navigation";
import { WorkforceProfileClient } from "@/components/workforce/workforce-profile-client";
import { getAgencyPublicProfileEditState } from "@/lib/marketplace/public-profile";
import { getMarketplaceVisibilityState } from "@/lib/marketplace/visibility-queries";
import { loadWorkforcePageContext } from "@/lib/workforce/load-page-context";
import { getProfessionalProfile } from "@/lib/workforce/queries";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function WorkforceProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const ctx = await loadWorkforcePageContext();
  const profile = await getProfessionalProfile(ctx.agencyId, id);

  if (!profile) notFound();

  const marketplaceVisibility = await getMarketplaceVisibilityState(ctx.agencyId, id);
  const publicProfileEdit = await getAgencyPublicProfileEditState(ctx.agencyId, id);
  if (!marketplaceVisibility || !publicProfileEdit) notFound();

  const serialized = {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    specialty: profile.specialty,
    yearsExperience: profile.yearsExperience,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    state: profile.state,
    availabilityStatus: profile.availabilityStatus,
    reliabilityScore: profile.reliabilityScore,
    isActive: profile.isActive,
    userId: profile.userId,
    complianceStatus: profile.complianceStatus,
    shiftReadiness: profile.shiftReadiness,
    pendingInviteEmail: profile.pendingInviteEmail,
    pendingInviteUrl: profile.pendingInviteUrl,
    credentials: profile.credentials,
    recentShifts: profile.recentShifts.map((s) => ({
      ...s,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
    })),
    currentAssignments: profile.currentAssignments.map((a) => ({
      ...a,
      startAt: a.startAt.toISOString(),
      endAt: a.endAt.toISOString(),
    })),
  };

  const serializedMarketplace = {
    isMarketplaceVisible: marketplaceVisibility.isMarketplaceVisible,
    visibilityBlockedReason: marketplaceVisibility.visibilityBlockedReason,
    marketplaceVisibleAt: marketplaceVisibility.marketplaceVisibleAt?.toISOString() ?? null,
    marketplaceHiddenAt: marketplaceVisibility.marketplaceHiddenAt?.toISOString() ?? null,
    enabledByName: marketplaceVisibility.enabledByName,
    publicSlug: marketplaceVisibility.publicSlug,
    checklist: marketplaceVisibility.checklist,
  };

  const serializedPublicProfile = {
    ...publicProfileEdit,
    approximateAvailability: publicProfileEdit.approximateAvailability,
  };

  const activeTab =
    tab === "marketplace"
      ? "marketplace"
      : tab === "public-profile"
        ? "public-profile"
        : "overview";

  return (
    <WorkforceProfileClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      activeTab={activeTab}
      profile={serialized}
      marketplaceVisibility={serializedMarketplace}
      publicProfileEdit={serializedPublicProfile}
      serviceArea={ctx.serviceArea}
    />
  );
}
