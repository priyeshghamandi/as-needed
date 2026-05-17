/**
 * Additional onboarding E2E agencies/users. Run after seed-dashboard-e2e.ts
 */
import "./preload-env";
import { inArray } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  AgencyTable,
  HealthcareProfessionalTable,
  UserRoleTable,
  UserTable,
} from "../drizzle/schema";
import { hashPassword } from "../lib/auth/password";

const PASSWORD = "E2eTestPassword1!";

const SEED_EMAILS = [
  "e2e-onboard-flow@example.com",
  "e2e-onboard-persist@example.com",
  "e2e-onboard-exit@example.com",
];

async function createOwnerAgency(
  email: string,
  name: string,
  agencyName: string,
  agencyValues: Partial<typeof AgencyTable.$inferInsert>,
) {
  const passwordHash = await hashPassword(PASSWORD);
  const [agency] = await db
    .insert(AgencyTable)
    .values({
      name: agencyName,
      onboardingCompletedAt: null,
      onboardingProgress: { completedSteps: ["welcome"], skippedSteps: [] },
      ...agencyValues,
    })
    .returning({ id: AgencyTable.id });

  const [user] = await db
    .insert(UserTable)
    .values({ email, name, passwordHash, status: "active" })
    .returning({ id: UserTable.id });

  await db.insert(UserRoleTable).values({
    userId: user.id,
    role: "agency_owner",
    agencyId: agency.id,
  });

  return { agencyId: agency.id, userId: user.id };
}

const SF_SERVICE_AREA = {
  primaryServiceAreaName: "San Francisco, CA",
  primaryServiceAreaPlaceId: "mock-sf",
  primaryServiceAreaCity: "San Francisco",
  primaryServiceAreaState: "CA",
  primaryServiceAreaCountry: "US",
  primaryServiceAreaLat: "37.7749",
  primaryServiceAreaLng: "-122.4194",
  serviceAreaRadiusMiles: 50,
};

async function main() {
  const existing = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(inArray(UserTable.email, SEED_EMAILS));
  if (existing.length > 0) {
    await db.delete(UserTable).where(inArray(UserTable.id, existing.map((u) => u.id)));
  }

  const oldAgencies = await db
    .select({ id: AgencyTable.id })
    .from(AgencyTable)
    .where(inArray(AgencyTable.name, [
      "E2E Onboard Flow Agency",
      "E2E Onboard Persist Agency",
      "E2E Onboard Exit Agency",
    ]));
  if (oldAgencies.length > 0) {
    await db
      .delete(AgencyTable)
      .where(inArray(AgencyTable.id, oldAgencies.map((a) => a.id)));
  }

  await createOwnerAgency(
    "e2e-onboard-flow@example.com",
    "E2E Onboard Flow",
    "E2E Onboard Flow Agency",
    {},
  );

  const { agencyId: persistAgencyId } = await createOwnerAgency(
    "e2e-onboard-persist@example.com",
    "E2E Onboard Persist",
    "E2E Onboard Persist Agency",
    {
      onboardingCurrentStep: "professionals",
      onboardingProgress: {
        completedSteps: ["welcome", "profile", "service-area"],
        skippedSteps: ["team"],
      },
      ...SF_SERVICE_AREA,
    },
  );

  await db.insert(HealthcareProfessionalTable).values({
    agencyId: persistAgencyId,
    firstName: "Persist",
    lastName: "Pro",
    role: "rn",
    email: "hp-persist@e2e.test",
    city: "San Francisco",
    state: "CA",
    placeId: "mock-sf",
    isActive: true,
  });

  await createOwnerAgency(
    "e2e-onboard-exit@example.com",
    "E2E Onboard Exit",
    "E2E Onboard Exit Agency",
    {
      onboardingCurrentStep: "facilities",
      onboardingProgress: {
        completedSteps: ["welcome", "profile", "service-area"],
        skippedSteps: ["team", "professionals"],
      },
      ...SF_SERVICE_AREA,
    },
  );

  console.log("Onboarding E2E seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
