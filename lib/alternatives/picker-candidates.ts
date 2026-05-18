import { and, eq, ne } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceProfileTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { getCustomerLocationForStaffingRequest } from "@/lib/alternatives/facility-location";
import { computeApproximateAvailability } from "@/lib/marketplace/approximate-availability";
import { APPROXIMATE_AVAILABILITY_LABELS } from "@/lib/marketplace/approximate-availability-labels";
import { isGeoEligible } from "@/lib/marketplace/geo-eligibility";
import { parseCoordinate } from "@/lib/matching/distance";

export type AlternativePickerCandidate = {
  id: string;
  displayName: string;
  role: string;
  approximateAvailabilityLabel: string | null;
  geoEligible: boolean;
};

export async function listAlternativePickerCandidates(params: {
  agencyId: string;
  staffingRequestId: string;
  originalProfessionalId: string;
  search?: string;
}): Promise<AlternativePickerCandidate[]> {
  const [request] = await db
    .select({
      roleNeeded: StaffingRequestTable.roleNeeded,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  if (!request) return [];

  const customerLocation = await getCustomerLocationForStaffingRequest(params.staffingRequestId);

  const [agency] = await db
    .select({
      lat: AgencyTable.primaryServiceAreaLat,
      lng: AgencyTable.primaryServiceAreaLng,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, params.agencyId))
    .limit(1);

  const agencyCenter = {
    latitude: parseCoordinate(agency?.lat) ?? 0,
    longitude: parseCoordinate(agency?.lng) ?? 0,
  };
  const agencyRadius = 50;

  const existingSelections = await db
    .select({ professionalId: StaffingRequestSelectionTable.healthcareProfessionalId })
    .from(StaffingRequestSelectionTable)
    .where(eq(StaffingRequestSelectionTable.staffingRequestId, params.staffingRequestId));

  const excludedIds = new Set([
    params.originalProfessionalId,
    ...existingSelections.map((s) => s.professionalId),
  ]);

  const professionals = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      isActive: HealthcareProfessionalTable.isActive,
      latitude: HealthcareProfessionalTable.latitude,
      longitude: HealthcareProfessionalTable.longitude,
      updatedAt: HealthcareProfessionalTable.updatedAt,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, params.agencyId),
        eq(HealthcareProfessionalTable.role, request.roleNeeded),
        eq(HealthcareProfessionalTable.isActive, true),
        ne(HealthcareProfessionalTable.id, params.originalProfessionalId),
      ),
    );

  const searchLower = params.search?.trim().toLowerCase() ?? "";
  const results: AlternativePickerCandidate[] = [];

  for (const pro of professionals) {
    if (excludedIds.has(pro.id)) continue;

    const displayName = `${pro.firstName} ${pro.lastName}`.trim();
    if (searchLower && !displayName.toLowerCase().includes(searchLower)) continue;

    const geoEligible =
      customerLocation != null &&
      isGeoEligible({
        professional: {
          latitude: parseCoordinate(pro.latitude),
          longitude: parseCoordinate(pro.longitude),
        },
        agencyCenter,
        agencyRadiusMiles: agencyRadius,
        customerLocation,
      });

    const approximateAvailability = await computeApproximateAvailability(
      pro.id,
      pro.updatedAt,
    );

    results.push({
      id: pro.id,
      displayName,
      role: pro.role,
      approximateAvailabilityLabel: approximateAvailability
        ? APPROXIMATE_AVAILABILITY_LABELS[approximateAvailability]
        : null,
      geoEligible,
    });
  }

  return results.sort((a, b) => {
    if (a.geoEligible !== b.geoEligible) return a.geoEligible ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

export async function getProfessionalPublicSummary(professionalId: string) {
  const [row] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      updatedAt: HealthcareProfessionalTable.updatedAt,
      headline: ProfessionalMarketplaceProfileTable.headline,
    })
    .from(HealthcareProfessionalTable)
    .leftJoin(
      ProfessionalMarketplaceProfileTable,
      eq(
        ProfessionalMarketplaceProfileTable.healthcareProfessionalId,
        HealthcareProfessionalTable.id,
      ),
    )
    .where(eq(HealthcareProfessionalTable.id, professionalId))
    .limit(1);

  if (!row) return null;

  const approximateAvailability = await computeApproximateAvailability(
    row.id,
    row.updatedAt,
  );

  return {
    id: row.id,
    displayName: `${row.firstName} ${row.lastName}`.trim(),
    role: row.role,
    headline: row.headline,
    approximateAvailabilityLabel: approximateAvailability
      ? APPROXIMATE_AVAILABILITY_LABELS[approximateAvailability]
      : null,
  };
}
