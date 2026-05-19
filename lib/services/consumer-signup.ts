import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { FacilityTable, UserCareSiteTable, UserRoleTable, UserTable } from "@/drizzle/schema";
import { hashPassword } from "@/lib/auth/password";
import type { ConsumerCareSignupInput } from "@/lib/validations/consumer-care-signup";

export class DuplicateEmailError extends Error {
  readonly code = "EMAIL_EXISTS" as const;
  constructor() {
    super("An account with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

export type ConsumerSignupResult = {
  userId: string;
  careSiteId: string;
};

export async function createConsumerSignup(
  input: ConsumerCareSignupInput,
): Promise<ConsumerSignupResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await hashPassword(input.password);
  const siteName =
    input.careSiteName?.trim() ||
    input.location.displayName?.trim() ||
    "Home care";

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(UserTable)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
        status: "active",
      })
      .returning({ id: UserTable.id });

    await tx.insert(UserRoleTable).values({
      userId: user.id,
      role: "consumer",
      agencyId: null,
    });

    const [facility] = await tx
      .insert(FacilityTable)
      .values({
        agencyId: null,
        siteKind: "consumer_home",
        createdByUserId: user.id,
        name: siteName,
        type: "home_healthcare",
        contactName: input.name.trim(),
        contactEmail: email,
        contactPhone: input.phone?.trim() || null,
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
      userId: user.id,
      careSiteId: facility.id,
    });

    return { userId: user.id, careSiteId: facility.id };
  });
}
