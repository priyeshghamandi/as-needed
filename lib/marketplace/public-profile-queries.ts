import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  CredentialTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceProfileTable,
  ProfessionalMarketplaceVisibilityTable,
} from "@/drizzle/schema";
import {
  APPROXIMATE_AVAILABILITY_LABELS,
  computeApproximateAvailability,
  type ApproximateAvailability,
} from "@/lib/marketplace/approximate-availability";
import { isProfessionalPublicEligible } from "@/lib/marketplace/eligibility";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";
import {
  buildCredentialsSummaryLines,
  isStoredApproximateAvailability,
  resolveHeadline,
  roleDisplayLabel,
  yearsExperienceBucket,
  yearsExperienceBucketLabel,
} from "@/lib/marketplace/public-profile-format";
import { isPublicProfileHeadlineConfigured } from "@/lib/marketplace/public-profile-format";
import type { CustomerLocationContext } from "@/lib/marketplace/types";

export type PublicProfessionalProfile = {
  id: string;
  publicSlug: string;
  displayName: string;
  role: string;
  roleLabel: string;
  headline: string;
  bio: string | null;
  specialties: string[];
  photoUrl: string | null;
  approximateAvailability: ApproximateAvailability | null;
  availabilityLabel: string | null;
  yearsExperienceLabel: string | null;
  credentialsSummary: string[];
  city: string | null;
  state: string | null;
  agencyName: string;
  canRequest: boolean;
  locationRequired: boolean;
};

export async function resolvePublicProfessionalProfile(
  publicSlug: string,
  customerLocation: CustomerLocationContext | null,
): Promise<PublicProfessionalProfile | null> {
  const [row] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      publicSlug: HealthcareProfessionalTable.publicSlug,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      specialty: HealthcareProfessionalTable.specialty,
      yearsExperience: HealthcareProfessionalTable.yearsExperience,
      city: HealthcareProfessionalTable.city,
      state: HealthcareProfessionalTable.state,
      updatedAt: HealthcareProfessionalTable.updatedAt,
      isActive: HealthcareProfessionalTable.isActive,
      isMarketplaceVisible: ProfessionalMarketplaceVisibilityTable.isMarketplaceVisible,
      visibilityBlockedReason:
        ProfessionalMarketplaceVisibilityTable.visibilityBlockedReason,
      agencyName: AgencyTable.name,
      profileHeadline: ProfessionalMarketplaceProfileTable.headline,
      profileBio: ProfessionalMarketplaceProfileTable.bio,
      profileSpecialties: ProfessionalMarketplaceProfileTable.specialties,
      profilePhotoUrl: ProfessionalMarketplaceProfileTable.photoUrl,
      profileApproximateAvailability:
        ProfessionalMarketplaceProfileTable.approximateAvailability,
      profileYearsBucket: ProfessionalMarketplaceProfileTable.yearsExperienceBucket,
      profileCredentialsSummary: ProfessionalMarketplaceProfileTable.credentialsSummary,
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
    .leftJoin(
      ProfessionalMarketplaceProfileTable,
      eq(
        ProfessionalMarketplaceProfileTable.healthcareProfessionalId,
        HealthcareProfessionalTable.id,
      ),
    )
    .where(eq(HealthcareProfessionalTable.publicSlug, publicSlug))
    .limit(1);

  if (!row?.publicSlug) return null;

  if (
    !row.isActive ||
    !row.isMarketplaceVisible ||
    row.visibilityBlockedReason
  ) {
    return null;
  }

  const hasLocation = isCustomerLocationValid(customerLocation);

  if (hasLocation) {
    const eligible = await isProfessionalPublicEligible(row.id, customerLocation);
    if (!eligible) return null;
    if (!isPublicProfileHeadlineConfigured(row.profileHeadline)) return null;
  }

  const credentials = await db
    .select({ name: CredentialTable.name, status: CredentialTable.status })
    .from(CredentialTable)
    .where(eq(CredentialTable.professionalId, row.id));

  let approximateAvailability: ApproximateAvailability | null = null;
  if (isStoredApproximateAvailability(row.profileApproximateAvailability)) {
    approximateAvailability = row.profileApproximateAvailability;
  } else {
    approximateAvailability = await computeApproximateAvailability(
      row.id,
      row.updatedAt,
    );
  }

  const experienceBucket =
    row.profileYearsBucket ?? yearsExperienceBucket(row.yearsExperience);

  const specialties =
    row.profileSpecialties?.filter(Boolean) ??
    (row.specialty?.trim() ? [row.specialty.trim()] : []);

  return {
    id: row.id,
    publicSlug: row.publicSlug,
    displayName: `${row.firstName} ${row.lastName}`.trim(),
    role: row.role,
    roleLabel: roleDisplayLabel(row.role),
    headline: resolveHeadline({
      profileHeadline: row.profileHeadline,
      specialty: row.specialty,
      role: row.role,
    }),
    bio: row.profileBio?.trim() || null,
    specialties,
    photoUrl: row.profilePhotoUrl,
    approximateAvailability,
    availabilityLabel: approximateAvailability
      ? APPROXIMATE_AVAILABILITY_LABELS[approximateAvailability]
      : null,
    yearsExperienceLabel: yearsExperienceBucketLabel(experienceBucket),
    credentialsSummary: buildCredentialsSummaryLines(
      credentials,
      row.profileCredentialsSummary,
    ),
    city: row.city,
    state: row.state,
    agencyName: row.agencyName,
    canRequest: hasLocation,
    locationRequired: !hasLocation,
  };
}
