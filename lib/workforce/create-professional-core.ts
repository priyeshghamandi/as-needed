import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, HealthcareProfessionalTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";
import {
  workforceProfessionalSchema,
  type WorkforceProfessionalInput,
} from "@/lib/validations/workforce-professional";
import {
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
} from "@/lib/places/service-area-bounds";
import { ACTIVITY_ACTIONS } from "@/lib/activity/actions";
import { logActivity } from "@/lib/activity/log-activity";

export type CreateProfessionalResult =
  | { ok: true; professionalId: string; inviteUrl?: string }
  | { ok: false; status: number; field?: string; message: string };

export async function createProfessionalCore(
  agencyId: string,
  userId: string,
  input: WorkforceProfessionalInput,
): Promise<CreateProfessionalResult> {
  const parsed = workforceProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      status: 400,
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  const [agency] = await db
    .select({
      primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
      primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
      serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  if (!agency) {
    return { ok: false, status: 404, message: "Agency not found." };
  }

  if (agency.primaryServiceAreaLat && agency.primaryServiceAreaLng) {
    const center = {
      latitude: Number(agency.primaryServiceAreaLat),
      longitude: Number(agency.primaryServiceAreaLng),
    };
    const radius = agency.serviceAreaRadiusMiles ?? DEFAULT_SERVICE_AREA_RADIUS_MILES;
    if (!isWithinServiceArea(parsed.data.location, center, radius)) {
      return {
        ok: false,
        status: 400,
        field: "location",
        message: OUT_OF_SERVICE_AREA_MESSAGE,
      };
    }
  }

  if (parsed.data.email) {
    const [existing] = await db
      .select({ id: HealthcareProfessionalTable.id })
      .from(HealthcareProfessionalTable)
      .where(
        and(
          eq(HealthcareProfessionalTable.agencyId, agencyId),
          ilike(HealthcareProfessionalTable.email, parsed.data.email),
        ),
      )
      .limit(1);

    if (existing) {
      return {
        ok: false,
        status: 409,
        field: "email",
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
        specialty: parsed.data.specialty || null,
        yearsExperience: parsed.data.yearsExperience ?? null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        city: parsed.data.location.city || null,
        state: parsed.data.location.state || null,
        country: parsed.data.location.country || null,
        placeId: parsed.data.location.placeId || null,
        latitude: String(parsed.data.location.latitude),
        longitude: String(parsed.data.location.longitude),
        availabilityStatus: "unavailable",
        isActive: true,
        reliabilityScore: 100,
      })
      .returning({ id: HealthcareProfessionalTable.id });

    let inviteUrl: string | undefined;

    if (parsed.data.sendInvite && parsed.data.email) {
      const invite = await createUserInvite(
        { email: parsed.data.email, role: "provider", inviteType: "provider" },
        userId,
        agencyId,
      );
      const base =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
      inviteUrl = `${base}/invite/${invite.token}`;
    }

    await logActivity({
      agencyId,
      actorUserId: userId,
      action: ACTIVITY_ACTIONS.HEALTHCARE_PROFESSIONAL_CREATED,
      entityType: "healthcare_professional",
      entityId: professional.id,
      metadata: {
        summary: `${parsed.data.firstName} ${parsed.data.lastName} added to workforce`,
      },
    });

    return { ok: true, professionalId: professional.id, inviteUrl };
  });
}
