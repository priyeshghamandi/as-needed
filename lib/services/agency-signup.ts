import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  UserRoleTable,
  UserTable,
} from "@/drizzle/schema";
import { hashPassword } from "@/lib/auth/password";
import type { AgencySignupInput } from "@/lib/validations/agency-signup";

export class DuplicateEmailError extends Error {
  readonly code = "EMAIL_EXISTS" as const;
  constructor() {
    super("An account with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

export type AgencySignupResult = {
  userId: string;
  agencyId: string;
};

export async function createAgencySignup(
  input: AgencySignupInput,
): Promise<AgencySignupResult> {
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

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(UserTable)
      .values({
        name: input.ownerName.trim(),
        email,
        passwordHash,
        status: "active",
      })
      .returning({ id: UserTable.id });

    const [agency] = await tx
      .insert(AgencyTable)
      .values({
        name: input.agencyName.trim(),
        status: "active",
        agencyType: input.agencyType,
        workforceSize: input.workforceSize,
        phone: input.phone.trim(),
        primaryServiceAreaName: input.serviceArea.displayName,
        primaryServiceAreaPlaceId: input.serviceArea.placeId,
        primaryServiceAreaCity: input.serviceArea.city || null,
        primaryServiceAreaState: input.serviceArea.state || null,
        primaryServiceAreaCountry: input.serviceArea.country,
        primaryServiceAreaLat: String(input.serviceArea.latitude),
        primaryServiceAreaLng: String(input.serviceArea.longitude),
      })
      .returning({ id: AgencyTable.id });

    await tx.insert(UserRoleTable).values({
      userId: user.id,
      role: "agency_owner",
      agencyId: agency.id,
    });

    return { userId: user.id, agencyId: agency.id };
  });
}
