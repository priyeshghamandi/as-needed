import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, HealthcareProfessionalTable } from "@/drizzle/schema";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";
import {
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
} from "@/lib/places/service-area-bounds";

export async function updateProfessionalLocation(
  agencyId: string,
  professionalId: string,
  location: unknown,
): Promise<{ ok: true } | { ok: false; status: number; message: string; field?: string }> {
  const parsed = geographicLocationSchema.safeParse(location);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      field: "location",
      message: parsed.error.issues[0]?.message ?? "Invalid location.",
    };
  }

  const [agency] = await db
    .select({
      lat: AgencyTable.primaryServiceAreaLat,
      lng: AgencyTable.primaryServiceAreaLng,
      radius: AgencyTable.serviceAreaRadiusMiles,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  if (!agency?.lat || !agency?.lng) {
    return {
      ok: false,
      status: 400,
      message: "Agency service area is not configured. Complete onboarding first.",
    };
  }

  const center = {
    latitude: Number(agency.lat),
    longitude: Number(agency.lng),
  };
  const radius = agency.radius ?? DEFAULT_SERVICE_AREA_RADIUS_MILES;

  if (!isWithinServiceArea(parsed.data, center, radius)) {
    return {
      ok: false,
      status: 400,
      field: "location",
      message: OUT_OF_SERVICE_AREA_MESSAGE,
    };
  }

  const [updated] = await db
    .update(HealthcareProfessionalTable)
    .set({
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      country: parsed.data.country || null,
      placeId: parsed.data.placeId,
      latitude: String(parsed.data.latitude),
      longitude: String(parsed.data.longitude),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(HealthcareProfessionalTable.id, professionalId),
        eq(HealthcareProfessionalTable.agencyId, agencyId),
      ),
    )
    .returning({ id: HealthcareProfessionalTable.id });

  if (!updated) {
    return { ok: false, status: 404, message: "Professional not found." };
  }

  return { ok: true };
}
