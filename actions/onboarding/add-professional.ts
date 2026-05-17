"use server";

import { and, eq, ilike } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable, HealthcareProfessionalTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";
import {
  onboardingProfessionalSchema,
  type OnboardingProfessionalInput,
} from "@/lib/validations/onboarding-professional";
import { isWithinServiceArea } from "@/lib/places/service-area-bounds";
import { OUT_OF_SERVICE_AREA_MESSAGE } from "@/lib/places/service-area-bounds";
import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";

export type AddProfessionalState =
  | { status: "idle" }
  | { status: "success"; professionalId: string; inviteUrl?: string }
  | { status: "error"; message: string };

export async function addOnboardingProfessionalAction(
  input: OnboardingProfessionalInput,
): Promise<AddProfessionalState> {
  const parsed = onboardingProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid professional data.",
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

    // Check for duplicate email within agency
    if (parsed.data.email) {
      const existing = await db
        .select({ id: HealthcareProfessionalTable.id })
        .from(HealthcareProfessionalTable)
        .where(
          and(
            eq(HealthcareProfessionalTable.agencyId, agencyId),
            ilike(HealthcareProfessionalTable.email, parsed.data.email),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          status: "error",
          message: "A professional with this email already exists in your agency.",
        };
      }
    }

    return await db.transaction(async (tx) => {
      const [professional] = await tx
        .insert(HealthcareProfessionalTable)
        .values({
          agencyId,
          firstName: parsed.data.firstName.trim(),
          lastName: parsed.data.lastName.trim(),
          role: parsed.data.role,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
          city: parsed.data.location.city || null,
          state: parsed.data.location.state || null,
          country: parsed.data.location.country || null,
          latitude: String(parsed.data.location.latitude),
          longitude: String(parsed.data.location.longitude),
          availabilityStatus: "unavailable",
          isActive: true,
        })
        .returning({ id: HealthcareProfessionalTable.id });

      let inviteUrl: string | undefined;

      if (parsed.data.sendInvite && parsed.data.email) {
        const invite = await createUserInvite(
          { email: parsed.data.email, role: "provider", inviteType: "provider" },
          context.userId,
          agencyId,
        );
        const base =
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
        inviteUrl = `${base}/invite/${invite.token}`;
      }

      return { status: "success", professionalId: professional.id, inviteUrl };
    });
  } catch (error) {
    console.error("addOnboardingProfessionalAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add professional.",
    };
  }
}
