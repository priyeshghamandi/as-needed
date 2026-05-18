import { and, eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceVisibilityTable,
} from "@/drizzle/schema";
import { parseCoordinate } from "@/lib/matching/distance";
import {
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
  type ServiceAreaCenter,
} from "@/lib/places/service-area-bounds";
import { isGeoEligible, isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";
import { syncMarketplaceComplianceBlock } from "@/lib/marketplace/compliance-visibility";
import {
  CATEGORY_SLUG_ROLE_MAP,
  type CustomerLocationContext,
  type EligibleProfessional,
  type GetEligibleProfessionalsFilters,
} from "@/lib/marketplace/types";

export class CustomerLocationRequiredError extends Error {
  constructor() {
    super("Customer location is required for marketplace eligibility.");
    this.name = "CustomerLocationRequiredError";
  }
}

export function assertCustomerLocationPresent(
  location: CustomerLocationContext | null | undefined,
): asserts location is CustomerLocationContext {
  if (!isCustomerLocationValid(location)) {
    throw new CustomerLocationRequiredError();
  }
}

export async function getVisibilityBlockReason(
  professionalId: string,
): Promise<string | null> {
  const [row] = await db
    .select({
      visibilityBlockedReason: ProfessionalMarketplaceVisibilityTable.visibilityBlockedReason,
      isMarketplaceVisible: ProfessionalMarketplaceVisibilityTable.isMarketplaceVisible,
    })
    .from(ProfessionalMarketplaceVisibilityTable)
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, professionalId),
    )
    .limit(1);

  if (!row?.isMarketplaceVisible) return "not_visible";
  return row.visibilityBlockedReason;
}

export async function isProfessionalPublicEligible(
  professionalId: string,
  customerContext: CustomerLocationContext | null | undefined,
): Promise<boolean> {
  if (!isCustomerLocationValid(customerContext)) return false;

  const eligible = await getEligibleProfessionals({
    customerLocation: customerContext,
    limit: 500,
  });

  return eligible.some((p) => p.id === professionalId);
}

export async function getEligibleProfessionals(
  filters: GetEligibleProfessionalsFilters,
): Promise<EligibleProfessional[]> {
  if (!isCustomerLocationValid(filters.customerLocation)) {
    return [];
  }

  const roleFilter =
    filters.role ??
    (filters.categorySlug ? CATEGORY_SLUG_ROLE_MAP[filters.categorySlug] : undefined);

  const conditions = [
    eq(HealthcareProfessionalTable.isActive, true),
    eq(ProfessionalMarketplaceVisibilityTable.isMarketplaceVisible, true),
    sql`${ProfessionalMarketplaceVisibilityTable.visibilityBlockedReason} IS NULL`,
    sql`${HealthcareProfessionalTable.publicSlug} IS NOT NULL`,
  ];

  if (filters.agencyId) {
    conditions.push(eq(HealthcareProfessionalTable.agencyId, filters.agencyId));
  }

  if (roleFilter) {
    conditions.push(
      eq(HealthcareProfessionalTable.role, roleFilter as "rn" | "cna" | "emt" | "lpn" | "cnm" | "cns" | "other"),
    );
  }

  const rows = await db
    .select({
      id: HealthcareProfessionalTable.id,
      publicSlug: HealthcareProfessionalTable.publicSlug,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      specialty: HealthcareProfessionalTable.specialty,
      city: HealthcareProfessionalTable.city,
      state: HealthcareProfessionalTable.state,
      latitude: HealthcareProfessionalTable.latitude,
      longitude: HealthcareProfessionalTable.longitude,
      agencyId: HealthcareProfessionalTable.agencyId,
      agencyLat: AgencyTable.primaryServiceAreaLat,
      agencyLng: AgencyTable.primaryServiceAreaLng,
      agencyRadius: AgencyTable.serviceAreaRadiusMiles,
    })
    .from(HealthcareProfessionalTable)
    .innerJoin(
      ProfessionalMarketplaceVisibilityTable,
      eq(
        ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId,
        HealthcareProfessionalTable.id,
      ),
    )
    .innerJoin(AgencyTable, eq(AgencyTable.id, HealthcareProfessionalTable.agencyId))
    .where(and(...conditions));

  const customerLocation = filters.customerLocation;
  const results: EligibleProfessional[] = [];

  for (const row of rows) {
    await syncMarketplaceComplianceBlock(row.agencyId, row.id);

    const [freshVisibility] = await db
      .select({
        isMarketplaceVisible: ProfessionalMarketplaceVisibilityTable.isMarketplaceVisible,
        visibilityBlockedReason: ProfessionalMarketplaceVisibilityTable.visibilityBlockedReason,
      })
      .from(ProfessionalMarketplaceVisibilityTable)
      .where(
        eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, row.id),
      )
      .limit(1);

    if (
      !freshVisibility?.isMarketplaceVisible ||
      freshVisibility.visibilityBlockedReason
    ) {
      continue;
    }

    const agencyLat = parseCoordinate(row.agencyLat);
    const agencyLng = parseCoordinate(row.agencyLng);
    const proLat = parseCoordinate(row.latitude);
    const proLng = parseCoordinate(row.longitude);

    if (agencyLat == null || agencyLng == null || proLat == null || proLng == null) {
      continue;
    }

    const agencyCenter: ServiceAreaCenter = { latitude: agencyLat, longitude: agencyLng };

    if (
      !isGeoEligible({
        professional: { latitude: proLat, longitude: proLng },
        agencyCenter,
        agencyRadiusMiles: row.agencyRadius ?? DEFAULT_SERVICE_AREA_RADIUS_MILES,
        customerLocation,
      })
    ) {
      continue;
    }

    if (!row.publicSlug) continue;

    results.push({
      id: row.id,
      publicSlug: row.publicSlug,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      specialty: row.specialty,
      city: row.city,
      state: row.state,
    });
  }

  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 100;
  return results.slice(offset, offset + limit);
}
