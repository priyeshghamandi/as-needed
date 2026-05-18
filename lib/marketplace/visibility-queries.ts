import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  CredentialTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceVisibilityTable,
  UserTable,
} from "@/drizzle/schema";
import { syncMarketplaceComplianceBlock } from "@/lib/marketplace/compliance-visibility";
import { generatePublicSlug } from "@/lib/marketplace/public-slug";
import { buildVisibilityChecklist } from "@/lib/marketplace/visibility-checklist";
import { logActivity } from "@/lib/activity/log-activity";

export type MarketplaceVisibilityState = {
  isMarketplaceVisible: boolean;
  visibilityBlockedReason: string | null;
  marketplaceVisibleAt: Date | null;
  marketplaceHiddenAt: Date | null;
  enabledByUserId: string | null;
  enabledByName: string | null;
  publicSlug: string | null;
  checklist: ReturnType<typeof buildVisibilityChecklist>;
};

export async function ensureMarketplaceVisibilityRow(
  agencyId: string,
  professionalId: string,
): Promise<void> {
  const existing = await db
    .select({ id: ProfessionalMarketplaceVisibilityTable.id })
    .from(ProfessionalMarketplaceVisibilityTable)
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, professionalId),
    )
    .limit(1);

  if (existing[0]) return;

  await db.insert(ProfessionalMarketplaceVisibilityTable).values({
    healthcareProfessionalId: professionalId,
    agencyId,
    isMarketplaceVisible: false,
  });
}

export async function getMarketplaceVisibilityState(
  agencyId: string,
  professionalId: string,
): Promise<MarketplaceVisibilityState | null> {
  const proRows = await db
    .select()
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.id, professionalId),
        eq(HealthcareProfessionalTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  const pro = proRows[0];
  if (!pro) return null;

  await ensureMarketplaceVisibilityRow(agencyId, professionalId);
  await syncMarketplaceComplianceBlock(agencyId, professionalId);

  const [agency] = await db
    .select({
      primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
      primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
      serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  const [visibility] = await db
    .select()
    .from(ProfessionalMarketplaceVisibilityTable)
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, professionalId),
    )
    .limit(1);

  const credentials = await db
    .select({ status: CredentialTable.status })
    .from(CredentialTable)
    .where(eq(CredentialTable.professionalId, professionalId));

  let publicSlug = pro.publicSlug;
  if (!publicSlug && pro.firstName && pro.lastName) {
    publicSlug = generatePublicSlug(pro.firstName, pro.lastName, pro.id);
    await db
      .update(HealthcareProfessionalTable)
      .set({ publicSlug, updatedAt: new Date() })
      .where(eq(HealthcareProfessionalTable.id, pro.id));
  }

  const checklist = buildVisibilityChecklist({
    professional: {
      firstName: pro.firstName,
      lastName: pro.lastName,
      role: pro.role,
      placeId: pro.placeId,
      latitude: pro.latitude,
      longitude: pro.longitude,
      isActive: pro.isActive,
      publicSlug,
    },
    agency: {
      primaryServiceAreaLat: agency?.primaryServiceAreaLat ?? null,
      primaryServiceAreaLng: agency?.primaryServiceAreaLng ?? null,
      serviceAreaRadiusMiles: agency?.serviceAreaRadiusMiles ?? 75,
    },
    visibility: {
      isMarketplaceVisible: visibility?.isMarketplaceVisible ?? false,
      visibilityBlockedReason: visibility?.visibilityBlockedReason ?? null,
    },
    credentials,
  });

  let enabledByName: string | null = null;
  if (visibility?.enabledByUserId) {
    const [user] = await db
      .select({ name: UserTable.name })
      .from(UserTable)
      .where(eq(UserTable.id, visibility.enabledByUserId))
      .limit(1);
    enabledByName = user?.name ?? null;
  }

  return {
    isMarketplaceVisible: visibility?.isMarketplaceVisible ?? false,
    visibilityBlockedReason: visibility?.visibilityBlockedReason ?? null,
    marketplaceVisibleAt: visibility?.marketplaceVisibleAt ?? null,
    marketplaceHiddenAt: visibility?.marketplaceHiddenAt ?? null,
    enabledByUserId: visibility?.enabledByUserId ?? null,
    enabledByName,
    publicSlug,
    checklist,
  };
}

export async function setMarketplaceVisibility(params: {
  agencyId: string;
  professionalId: string;
  isMarketplaceVisible: boolean;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; errors: Record<string, string> }> {
  const state = await getMarketplaceVisibilityState(params.agencyId, params.professionalId);
  if (!state) {
    return { ok: false, errors: { professional: "Professional not found" } };
  }

  if (params.isMarketplaceVisible && !state.checklist.canEnable) {
    const failed = state.checklist.items.filter((i) => !i.passed && i.id !== "agency_toggle");
    const errors: Record<string, string> = {};
    for (const item of failed) {
      errors[item.id] = item.detail ?? item.label;
    }
    if (state.checklist.blockReason) {
      errors.blocked = `Blocked: ${state.checklist.blockReason}`;
    }
    return { ok: false, errors };
  }

  const now = new Date();

  if (params.isMarketplaceVisible) {
    const proRows = await db
      .select({
        firstName: HealthcareProfessionalTable.firstName,
        lastName: HealthcareProfessionalTable.lastName,
        publicSlug: HealthcareProfessionalTable.publicSlug,
      })
      .from(HealthcareProfessionalTable)
      .where(eq(HealthcareProfessionalTable.id, params.professionalId))
      .limit(1);

    const pro = proRows[0];
    if (pro && !pro.publicSlug) {
      const publicSlug = generatePublicSlug(pro.firstName, pro.lastName, params.professionalId);
      await db
        .update(HealthcareProfessionalTable)
        .set({ publicSlug, updatedAt: now })
        .where(eq(HealthcareProfessionalTable.id, params.professionalId));
    }
  }

  await db
    .update(ProfessionalMarketplaceVisibilityTable)
    .set(
      params.isMarketplaceVisible
        ? {
            isMarketplaceVisible: true,
            marketplaceVisibleAt: now,
            marketplaceHiddenAt: null,
            enabledByUserId: params.actorUserId,
            updatedAt: now,
          }
        : {
            isMarketplaceVisible: false,
            marketplaceHiddenAt: now,
            enabledByUserId: null,
            updatedAt: now,
          },
    )
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, params.professionalId),
    );

  await logActivity({
    agencyId: params.agencyId,
    actorUserId: params.actorUserId,
    action: "marketplace_visibility_changed",
    entityType: "healthcare_professional",
    entityId: params.professionalId,
    metadata: {
      isMarketplaceVisible: params.isMarketplaceVisible,
    },
  });

  return { ok: true };
}

export async function bulkSetMarketplaceVisibility(params: {
  agencyId: string;
  professionalIds: string[];
  isMarketplaceVisible: boolean;
  actorUserId: string;
}): Promise<{
  succeeded: string[];
  failed: { id: string; errors: Record<string, string> }[];
}> {
  const succeeded: string[] = [];
  const failed: { id: string; errors: Record<string, string> }[] = [];

  const pros = await db
    .select({ id: HealthcareProfessionalTable.id })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, params.agencyId),
        inArray(HealthcareProfessionalTable.id, params.professionalIds),
      ),
    );

  const validIds = new Set(pros.map((p) => p.id));

  for (const id of params.professionalIds) {
    if (!validIds.has(id)) {
      failed.push({ id, errors: { professional: "Not found in agency" } });
      continue;
    }
    const result = await setMarketplaceVisibility({
      agencyId: params.agencyId,
      professionalId: id,
      isMarketplaceVisible: params.isMarketplaceVisible,
      actorUserId: params.actorUserId,
    });
    if (result.ok) succeeded.push(id);
    else failed.push({ id, errors: result.errors });
  }

  return { succeeded, failed };
}
