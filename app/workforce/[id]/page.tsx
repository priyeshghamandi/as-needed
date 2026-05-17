import { notFound } from "next/navigation";
import { WorkforceProfileClient } from "@/components/workforce/workforce-profile-client";
import { loadWorkforcePageContext } from "@/lib/workforce/load-page-context";
import { getProfessionalProfile } from "@/lib/workforce/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkforceProfilePage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await loadWorkforcePageContext();
  const profile = await getProfessionalProfile(ctx.agencyId, id);

  if (!profile) notFound();

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

  return (
    <WorkforceProfileClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      profile={serialized}
    />
  );
}
