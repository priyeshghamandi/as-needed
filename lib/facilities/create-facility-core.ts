import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, FacilityTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";
import { facilitySchema, type FacilityInput } from "@/lib/validations/facility";
import {
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
} from "@/lib/places/service-area-bounds";

export type CreateFacilityResult =
  | { ok: true; facilityId: string; inviteUrl?: string }
  | { ok: false; status: number; field?: string; message: string };

export async function createFacilityCore(
  agencyId: string,
  userId: string,
  input: FacilityInput,
): Promise<CreateFacilityResult> {
  const parsed = facilitySchema.safeParse(input);
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

  const [existing] = await db
    .select({ id: FacilityTable.id })
    .from(FacilityTable)
    .where(
      and(
        eq(FacilityTable.agencyId, agencyId),
        ilike(FacilityTable.contactEmail, parsed.data.contactEmail),
      ),
    )
    .limit(1);

  if (existing) {
    return {
      ok: false,
      status: 409,
      field: "contactEmail",
      message: "A facility with this contact email already exists in your agency.",
    };
  }

  const [facility] = await db
    .insert(FacilityTable)
    .values({
      agencyId,
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      contactName: parsed.data.contactName.trim(),
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone.trim(),
      addressLine1: parsed.data.addressLine1 || null,
      addressLine2: parsed.data.addressLine2 || null,
      postalCode: parsed.data.postalCode || null,
      city: parsed.data.location.city || null,
      state: parsed.data.location.state || null,
      country: parsed.data.location.country || null,
      placeId: parsed.data.location.placeId || null,
      latitude: String(parsed.data.location.latitude),
      longitude: String(parsed.data.location.longitude),
      notes: parsed.data.notes || null,
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
      userId,
      agencyId,
    );
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    inviteUrl = `${base}/invite/${invite.token}`;
  }

  return { ok: true, facilityId: facility.id, inviteUrl };
}
