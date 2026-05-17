"use server";

import { and, eq, ilike } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable, FacilityTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";
import {
  onboardingFacilitySchema,
  type OnboardingFacilityInput,
} from "@/lib/validations/onboarding-facility";
import {
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
} from "@/lib/places/service-area-bounds";

export type AddFacilityState =
  | { status: "idle" }
  | { status: "success"; facilityId: string; inviteUrl?: string }
  | { status: "error"; message: string };

export async function addOnboardingFacilityAction(
  input: OnboardingFacilityInput,
): Promise<AddFacilityState> {
  const parsed = onboardingFacilitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid facility data.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    await assertCanManageOnboarding(context.userId, agencyId);

    const agencies = await db
      .select({
        primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
        primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
        serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
      })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = agencies[0];
    if (!agency) return { status: "error", message: "Agency not found." };

    // Validate location within service area
    if (agency.primaryServiceAreaLat && agency.primaryServiceAreaLng) {
      const center = {
        latitude: Number(agency.primaryServiceAreaLat),
        longitude: Number(agency.primaryServiceAreaLng),
      };
      const radius = agency.serviceAreaRadiusMiles ?? DEFAULT_SERVICE_AREA_RADIUS_MILES;
      if (!isWithinServiceArea(parsed.data.location, center, radius)) {
        return { status: "error", message: OUT_OF_SERVICE_AREA_MESSAGE };
      }
    }

    // Check for duplicate contact email within agency
    const existing = await db
      .select({ id: FacilityTable.id })
      .from(FacilityTable)
      .where(
        and(
          eq(FacilityTable.agencyId, agencyId),
          ilike(FacilityTable.contactEmail, parsed.data.contactEmail),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        status: "error",
        message: "A facility with this contact email already exists.",
      };
    }

    return await db.transaction(async (tx) => {
      const [facility] = await tx
        .insert(FacilityTable)
        .values({
          agencyId,
          name: parsed.data.name.trim(),
          type: parsed.data.type,
          contactName: parsed.data.contactName.trim(),
          contactEmail: parsed.data.contactEmail,
          contactPhone: parsed.data.contactPhone.trim(),
          city: parsed.data.location.city || null,
          state: parsed.data.location.state || null,
          country: parsed.data.location.country || null,
          placeId: parsed.data.location.placeId || null,
          latitude: String(parsed.data.location.latitude),
          longitude: String(parsed.data.location.longitude),
        })
        .returning({ id: FacilityTable.id });

      let inviteUrl: string | undefined;

      if (parsed.data.inviteContact) {
        const invite = await createUserInvite(
          {
            email: parsed.data.contactEmail,
            role: "facility_user",
            inviteType: "facility_user",
            facilityId: facility.id,
          },
          context.userId,
          agencyId,
        );
        const base =
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
        inviteUrl = `${base}/invite/${invite.token}`;
      }

      return { status: "success", facilityId: facility.id, inviteUrl };
    });
  } catch (error) {
    console.error("addOnboardingFacilityAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add facility.",
    };
  }
}
