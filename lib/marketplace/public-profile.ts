import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  HealthcareProfessionalTable,
  ProfessionalMarketplaceProfileTable,
  ProfessionalMarketplaceVisibilityTable,
} from "@/drizzle/schema";
import {
  APPROXIMATE_AVAILABILITY_LABELS,
  computeApproximateAvailability,
  type ApproximateAvailability,
} from "@/lib/marketplace/approximate-availability";
import {
  buildPublicProfileWarnings,
  isPublicProfileHeadlineConfigured,
  yearsExperienceBucket,
  yearsExperienceBucketLabel,
} from "@/lib/marketplace/public-profile-format";
import type { PublicMarketplaceProfilePatchInput } from "@/lib/validations/public-marketplace-profile";
import { logActivity } from "@/lib/activity/log-activity";

export type AgencyPublicProfileEditState = {
  professionalId: string;
  publicSlug: string | null;
  isMarketplaceVisible: boolean;
  headline: string;
  bio: string | null;
  specialties: string[];
  photoUrl: string | null;
  credentialsSummary: string | null;
  approximateAvailability: ApproximateAvailability | null;
  approximateAvailabilityLabel: string | null;
  yearsExperienceLabel: string | null;
  warnings: string[];
  previewPath: string | null;
};

export { buildPublicProfileWarnings, isPublicProfileHeadlineConfigured } from "@/lib/marketplace/public-profile-format";

export async function getAgencyPublicProfileEditState(
  agencyId: string,
  professionalId: string,
): Promise<AgencyPublicProfileEditState | null> {
  const [pro] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      publicSlug: HealthcareProfessionalTable.publicSlug,
      specialty: HealthcareProfessionalTable.specialty,
      yearsExperience: HealthcareProfessionalTable.yearsExperience,
      updatedAt: HealthcareProfessionalTable.updatedAt,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.id, professionalId),
        eq(HealthcareProfessionalTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  if (!pro) return null;

  const [visibility] = await db
    .select({
      isMarketplaceVisible: ProfessionalMarketplaceVisibilityTable.isMarketplaceVisible,
    })
    .from(ProfessionalMarketplaceVisibilityTable)
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, professionalId),
    )
    .limit(1);

  const [profile] = await db
    .select()
    .from(ProfessionalMarketplaceProfileTable)
    .where(eq(ProfessionalMarketplaceProfileTable.healthcareProfessionalId, professionalId))
    .limit(1);

  const approximateAvailability = await computeApproximateAvailability(
    professionalId,
    pro.updatedAt,
  );

  const headline = profile?.headline?.trim() ?? "";
  const isMarketplaceVisible = visibility?.isMarketplaceVisible ?? false;
  const warnings = buildPublicProfileWarnings({
    isMarketplaceVisible,
    profileHeadline: profile?.headline ?? null,
    publicSlug: pro.publicSlug,
  });

  const experienceBucket =
    profile?.yearsExperienceBucket ?? yearsExperienceBucket(pro.yearsExperience);

  return {
    professionalId: pro.id,
    publicSlug: pro.publicSlug,
    isMarketplaceVisible,
    headline,
    bio: profile?.bio ?? null,
    specialties: profile?.specialties?.filter(Boolean) ?? [],
    photoUrl: profile?.photoUrl ?? null,
    credentialsSummary: profile?.credentialsSummary ?? null,
    approximateAvailability,
    approximateAvailabilityLabel: approximateAvailability
      ? APPROXIMATE_AVAILABILITY_LABELS[approximateAvailability]
      : null,
    yearsExperienceLabel: yearsExperienceBucketLabel(experienceBucket),
    warnings,
    previewPath: pro.publicSlug ? `/marketplace/professionals/${pro.publicSlug}` : null,
  };
}

export async function upsertAgencyPublicProfile(params: {
  agencyId: string;
  professionalId: string;
  actorUserId: string;
  data: PublicMarketplaceProfilePatchInput;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const [pro] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      yearsExperience: HealthcareProfessionalTable.yearsExperience,
      updatedAt: HealthcareProfessionalTable.updatedAt,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.id, params.professionalId),
        eq(HealthcareProfessionalTable.agencyId, params.agencyId),
      ),
    )
    .limit(1);

  if (!pro) return { ok: false, error: "Professional not found" };

  const approximateAvailability = await computeApproximateAvailability(
    params.professionalId,
    pro.updatedAt,
  );

  const yearsBucket = yearsExperienceBucket(pro.yearsExperience);
  const now = new Date();

  const values = {
    headline: params.data.headline,
    bio: params.data.bio,
    specialties: params.data.specialties ?? [],
    photoUrl: params.data.photoUrl,
    credentialsSummary: params.data.credentialsSummary,
    approximateAvailability,
    yearsExperienceBucket: yearsBucket,
    updatedAt: now,
  };

  const existing = await db
    .select({ id: ProfessionalMarketplaceProfileTable.healthcareProfessionalId })
    .from(ProfessionalMarketplaceProfileTable)
    .where(
      eq(ProfessionalMarketplaceProfileTable.healthcareProfessionalId, params.professionalId),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(ProfessionalMarketplaceProfileTable)
      .set(values)
      .where(
        eq(ProfessionalMarketplaceProfileTable.healthcareProfessionalId, params.professionalId),
      );
  } else {
    await db.insert(ProfessionalMarketplaceProfileTable).values({
      healthcareProfessionalId: params.professionalId,
      ...values,
    });
  }

  await logActivity({
    agencyId: params.agencyId,
    actorUserId: params.actorUserId,
    action: "public_marketplace_profile_updated",
    entityType: "healthcare_professional",
    entityId: params.professionalId,
    metadata: { headline: params.data.headline },
  });

  return { ok: true };
}
