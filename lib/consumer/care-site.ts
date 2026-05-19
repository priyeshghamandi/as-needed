import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { FacilityTable, UserCareSiteTable } from "@/drizzle/schema";
import type { GeographicLocation } from "@/lib/geographic-location";

export type ConsumerCareSiteInput = {
  userId: string;
  siteName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  location: GeographicLocation;
};

export async function createConsumerCareSite(
  input: ConsumerCareSiteInput,
): Promise<{ careSiteId: string }> {
  return db.transaction(async (tx) => {
    const [facility] = await tx
      .insert(FacilityTable)
      .values({
        agencyId: null,
        siteKind: "consumer_home",
        createdByUserId: input.userId,
        name: input.siteName.trim(),
        type: "home_healthcare",
        contactName: input.contactName.trim(),
        contactEmail: input.contactEmail.trim().toLowerCase(),
        contactPhone: input.contactPhone?.trim() || null,
        addressLine1: input.location.displayName || null,
        city: input.location.city || null,
        state: input.location.state || null,
        country: input.location.country || null,
        placeId: input.location.placeId,
        latitude: String(input.location.latitude),
        longitude: String(input.location.longitude),
      })
      .returning({ id: FacilityTable.id });

    await tx.insert(UserCareSiteTable).values({
      userId: input.userId,
      careSiteId: facility.id,
    });

    return { careSiteId: facility.id };
  });
}

export async function getConsumerCareSite(userId: string) {
  const [row] = await db
    .select({
      careSiteId: UserCareSiteTable.careSiteId,
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      placeId: FacilityTable.placeId,
      latitude: FacilityTable.latitude,
      longitude: FacilityTable.longitude,
      city: FacilityTable.city,
      state: FacilityTable.state,
      addressLine1: FacilityTable.addressLine1,
    })
    .from(UserCareSiteTable)
    .innerJoin(FacilityTable, eq(UserCareSiteTable.careSiteId, FacilityTable.id))
    .where(eq(UserCareSiteTable.userId, userId))
    .limit(1);

  return row ?? null;
}
