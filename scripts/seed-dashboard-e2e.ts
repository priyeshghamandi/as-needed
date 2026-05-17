/**
 * Seeds Agencies A/B and dashboard E2E users. Idempotent by email.
 * Run: npx tsx scripts/seed-dashboard-e2e.ts
 */
import { inArray, like, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  ActivityLogTable,
  AgencyTable,
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserRoleTable,
  UserTable,
} from "../drizzle/schema";
import { hashPassword } from "../lib/auth/password";

const PASSWORD = "E2eTestPassword1!";

const SEED_EMAILS = [
  "e2e-dash-owner-a@example.com",
  "e2e-dash-owner-b@example.com",
  "e2e-dash-owner-incomplete@example.com",
  "e2e-dash-coordinator@example.com",
  "e2e-dash-recruiter@example.com",
  "e2e-dash-compliance@example.com",
  "e2e-dash-provider@example.com",
  "e2e-dash-facility@example.com",
];

const AGENCY_NAMES = [
  "E2E Dashboard Agency A",
  "E2E Dashboard Agency B",
  "E2E Dashboard Agency Incomplete",
];

async function main() {
  await db.execute(
    sql`ALTER TABLE "healthcare_professionals" ADD COLUMN IF NOT EXISTS "place_id" varchar(255)`,
  );

  const passwordHash = await hashPassword(PASSWORD);

  const existingUsers = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(inArray(UserTable.email, SEED_EMAILS));
  if (existingUsers.length > 0) {
    await db
      .delete(UserTable)
      .where(inArray(UserTable.id, existingUsers.map((u) => u.id)));
    console.log(`Removed ${existingUsers.length} existing seed users`);
  }

  const oldAgencies = await db
    .select({ id: AgencyTable.id })
    .from(AgencyTable)
    .where(like(AgencyTable.name, "E2E Dashboard Agency%"));
  if (oldAgencies.length > 0) {
    await db
      .delete(AgencyTable)
      .where(inArray(AgencyTable.id, oldAgencies.map((a) => a.id)));
    console.log(`Removed ${oldAgencies.length} old seed agencies`);
  }

  const [agencyA] = await db
    .insert(AgencyTable)
    .values({
      name: AGENCY_NAMES[0],
      onboardingCompletedAt: new Date(),
      onboardingProgress: {
        completedSteps: ["welcome", "profile", "service-area", "complete"],
        skippedSteps: [],
      },
    })
    .returning({ id: AgencyTable.id });

  const [agencyB] = await db
    .insert(AgencyTable)
    .values({
      name: AGENCY_NAMES[1],
      onboardingCompletedAt: new Date(),
    })
    .returning({ id: AgencyTable.id });

  const [agencyIncomplete] = await db
    .insert(AgencyTable)
    .values({
      name: AGENCY_NAMES[2],
      onboardingCompletedAt: null,
      onboardingProgress: { completedSteps: ["welcome"], skippedSteps: [] },
    })
    .returning({ id: AgencyTable.id });

  const agencyAId = agencyA.id;
  const agencyBId = agencyB.id;

  async function createUser(
    email: string,
    name: string,
    role: (typeof UserRoleTable.$inferInsert)["role"],
    agencyId: string | null,
  ) {
    const [user] = await db
      .insert(UserTable)
      .values({ email, name, passwordHash, status: "active" })
      .returning({ id: UserTable.id });
    await db.insert(UserRoleTable).values({
      userId: user.id,
      role,
      agencyId,
    });
    return user.id;
  }

  const ownerAId = await createUser(
    "e2e-dash-owner-a@example.com",
    "E2E Owner A",
    "agency_owner",
    agencyAId,
  );
  await createUser("e2e-dash-owner-b@example.com", "E2E Owner B", "agency_owner", agencyBId);
  await createUser(
    "e2e-dash-owner-incomplete@example.com",
    "E2E Owner Incomplete",
    "agency_owner",
    agencyIncomplete.id,
  );
  await createUser(
    "e2e-dash-coordinator@example.com",
    "E2E Coordinator",
    "staffing_coordinator",
    agencyAId,
  );
  await createUser(
    "e2e-dash-recruiter@example.com",
    "E2E Recruiter",
    "recruiter",
    agencyAId,
  );
  await createUser(
    "e2e-dash-compliance@example.com",
    "E2E Compliance",
    "compliance_manager",
    agencyAId,
  );
  await createUser("e2e-dash-provider@example.com", "E2E Provider", "provider", null);
  await createUser(
    "e2e-dash-facility@example.com",
    "E2E Facility User",
    "facility_user",
    agencyAId,
  );

  const [facility] = await db
    .insert(FacilityTable)
    .values({
      agencyId: agencyAId,
      name: "E2E Memorial Hospital",
      type: "hospital",
      city: "Austin",
      state: "TX",
    })
    .returning({ id: FacilityTable.id });

  const requestDefs = [
    { title: "ICU RN — Night", status: "open" as const, priority: "high", required: 5 },
    { title: "Med-Surg CNA", status: "matching" as const, priority: "normal", required: 1 },
    { title: "ER RN — Weekend", status: "partially_filled" as const, priority: "urgent", required: 1 },
  ];

  const requestIds: string[] = [];
  for (const def of requestDefs) {
    const [req] = await db
      .insert(StaffingRequestTable)
      .values({
        agencyId: agencyAId,
        facilityId: facility.id,
        createdByUserId: ownerAId,
        title: def.title,
        roleNeeded: "rn",
        professionalsRequired: def.required,
        priority: def.priority,
        status: def.status,
      })
      .returning({ id: StaffingRequestTable.id });
    requestIds.push(req.id);
  }

  const fillRequestId = requestIds[0];
  const in12h = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const in12hEnd = new Date(in12h.getTime() + 8 * 60 * 60 * 1000);

  await db.insert(ShiftTable).values({
    agencyId: agencyAId,
    staffingRequestId: requestIds[2],
    facilityId: facility.id,
    startAt: in12h,
    endAt: in12hEnd,
    status: "open",
  });

  const pros: string[] = [];
  for (let i = 0; i < 3; i++) {
    const [p] = await db
      .insert(HealthcareProfessionalTable)
      .values({
        agencyId: agencyAId,
        firstName: `Pro${i + 1}`,
        lastName: "E2E",
        role: "rn",
        availabilityStatus: i < 2 ? "available" : "unavailable",
        isActive: true,
        city: "Austin",
        state: "TX",
      })
      .returning({ id: HealthcareProfessionalTable.id });
    pros.push(p.id);
  }

  for (let i = 0; i < 4; i++) {
    const [shift] = await db
      .insert(ShiftTable)
      .values({
        agencyId: agencyAId,
        staffingRequestId: fillRequestId,
        facilityId: facility.id,
        startAt: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        status: "open",
      })
      .returning({ id: ShiftTable.id });
    await db.insert(ShiftAssignmentTable).values({
      shiftId: shift.id,
      professionalId: pros[i % pros.length],
      status: "accepted",
    });
  }

  await db.insert(CredentialTable).values([
    {
      agencyId: agencyAId,
      professionalId: pros[0],
      type: "license",
      name: "RN License",
      status: "expiring_soon",
    },
    {
      agencyId: agencyAId,
      professionalId: pros[1],
      type: "cert",
      name: "BLS",
      status: "pending_review",
    },
  ]);

  for (let i = 0; i < 5; i++) {
    await db.insert(ActivityLogTable).values({
      agencyId: agencyAId,
      actorUserId: ownerAId,
      action: "staffing_request.created",
      entityType: "staffing_request",
      entityId: requestIds[i % requestIds.length],
    });
  }

  console.log("Dashboard E2E seed complete.");
  console.log(`Agency A: ${agencyAId}, Agency B: ${agencyBId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
