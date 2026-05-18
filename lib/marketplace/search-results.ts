import { eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceProfileTable,
} from "@/drizzle/schema";
import {
  APPROXIMATE_AVAILABILITY_LABELS,
  computeApproximateAvailability,
  type ApproximateAvailability,
} from "@/lib/marketplace/approximate-availability";
import { getEligibleProfessionals } from "@/lib/marketplace/eligibility";
import type { EligibleProfessional } from "@/lib/marketplace/types";
import {
  isStoredApproximateAvailability,
  resolveHeadline,
  roleDisplayLabel,
  yearsExperienceBucket,
  yearsExperienceBucketLabel,
} from "@/lib/marketplace/public-profile-format";
import { rankMarketplaceResults } from "@/lib/marketplace/search-ranking";
import type { ParsedMarketplaceSearch } from "@/lib/marketplace/search-params";

export type MarketplaceSearchResult = {
  id: string;
  publicSlug: string;
  displayName: string;
  role: string;
  roleLabel: string;
  headline: string;
  specialty: string | null;
  yearsExperienceLabel: string | null;
  city: string | null;
  state: string | null;
  agencyName: string;
  approximateAvailability: ApproximateAvailability | null;
  availabilityLabel: string | null;
};

const PAGE_SIZE = 20;

export async function enrichEligibleProfessionals(
  eligible: EligibleProfessional[],
): Promise<MarketplaceSearchResult[]> {
  if (eligible.length === 0) return [];

  const ids = eligible.map((p) => p.id);
  const details = await db
    .select({
      id: HealthcareProfessionalTable.id,
      role: HealthcareProfessionalTable.role,
      specialty: HealthcareProfessionalTable.specialty,
      yearsExperience: HealthcareProfessionalTable.yearsExperience,
      updatedAt: HealthcareProfessionalTable.updatedAt,
      profileHeadline: ProfessionalMarketplaceProfileTable.headline,
      profileAvailability: ProfessionalMarketplaceProfileTable.approximateAvailability,
      profileYearsBucket: ProfessionalMarketplaceProfileTable.yearsExperienceBucket,
      agencyName: AgencyTable.name,
    })
    .from(HealthcareProfessionalTable)
    .innerJoin(AgencyTable, eq(AgencyTable.id, HealthcareProfessionalTable.agencyId))
    .leftJoin(
      ProfessionalMarketplaceProfileTable,
      eq(
        ProfessionalMarketplaceProfileTable.healthcareProfessionalId,
        HealthcareProfessionalTable.id,
      ),
    )
    .where(inArray(HealthcareProfessionalTable.id, ids));

  const detailById = new Map(details.map((row) => [row.id, row]));

  return Promise.all(
    eligible.map(async (pro) => {
      const detail = detailById.get(pro.id);
      let approximateAvailability: ApproximateAvailability | null = null;

      if (isStoredApproximateAvailability(detail?.profileAvailability)) {
        approximateAvailability = detail.profileAvailability;
      } else if (detail) {
        approximateAvailability = await computeApproximateAvailability(
          pro.id,
          detail.updatedAt,
        );
      }

      return {
        id: pro.id,
        publicSlug: pro.publicSlug,
        displayName: `${pro.firstName} ${pro.lastName}`.trim(),
        role: pro.role,
        roleLabel: roleDisplayLabel(pro.role),
        headline: resolveHeadline({
          profileHeadline: detail?.profileHeadline ?? null,
          specialty: pro.specialty,
          role: pro.role,
        }),
        specialty: pro.specialty?.trim() || null,
        yearsExperienceLabel: yearsExperienceBucketLabel(
          detail?.profileYearsBucket ?? yearsExperienceBucket(detail?.yearsExperience ?? null),
        ),
        city: pro.city,
        state: pro.state,
        agencyName: detail?.agencyName ?? "Licensed agency",
        approximateAvailability,
        availabilityLabel: approximateAvailability
          ? APPROXIMATE_AVAILABILITY_LABELS[approximateAvailability]
          : null,
      };
    }),
  );
}

export async function runMarketplaceSearch(
  params: ParsedMarketplaceSearch,
): Promise<{ results: MarketplaceSearchResult[]; total: number; page: number; pageSize: number }> {
  const eligible = await getEligibleProfessionals({
    role: params.role,
    customerLocation: params.customerLocation,
    limit: 200,
  });

  if (eligible.length === 0) {
    return { results: [], total: 0, page: params.page, pageSize: PAGE_SIZE };
  }

  const enriched = await enrichEligibleProfessionals(eligible);

  const ranked = rankMarketplaceResults(enriched, {
    urgency: params.urgency,
    sort: params.sort,
  });

  const total = ranked.length;
  const offset = (params.page - 1) * PAGE_SIZE;
  const results = ranked.slice(offset, offset + PAGE_SIZE);

  return { results, total, page: params.page, pageSize: PAGE_SIZE };
}
