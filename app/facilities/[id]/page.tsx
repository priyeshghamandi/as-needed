import { notFound } from "next/navigation";
import { FacilityDetailClient } from "@/components/facilities/facility-detail-client";
import { loadFacilitiesPageContext } from "@/lib/facilities/load-page-context";
import { getFacilityDetail } from "@/lib/facilities/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FacilityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await loadFacilitiesPageContext(`/facilities/${id}`);
  const detail = await getFacilityDetail(ctx.agencyId, id);

  if (!detail) notFound();

  const serialized = {
    id: detail.id,
    name: detail.name,
    type: detail.type,
    contactName: detail.contactName,
    contactEmail: detail.contactEmail,
    contactPhone: detail.contactPhone,
    addressLine1: detail.addressLine1,
    addressLine2: detail.addressLine2,
    city: detail.city,
    state: detail.state,
    country: detail.country,
    postalCode: detail.postalCode,
    notes: detail.notes,
    openRequestsCount: detail.openRequestsCount,
    confirmedShiftsCount: detail.confirmedShiftsCount,
    portalAccess: detail.portalAccess,
    pendingInviteEmail: detail.pendingInviteEmail,
    pendingInviteUrl: detail.pendingInviteUrl,
    recentRequests: detail.recentRequests.map((r) => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
    })),
    activityFeed: detail.activityFeed.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return (
    <FacilityDetailClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      facility={serialized}
    />
  );
}
