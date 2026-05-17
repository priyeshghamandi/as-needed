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
  "e2e-workforce-empty@example.com",
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
      primaryServiceAreaName: "San Francisco, CA",
      primaryServiceAreaPlaceId: "mock-sf",
      primaryServiceAreaCity: "San Francisco",
      primaryServiceAreaState: "CA",
      primaryServiceAreaCountry: "US",
      primaryServiceAreaLat: "37.7749",
      primaryServiceAreaLng: "-122.4194",
      serviceAreaRadiusMiles: 50,
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

  const [agencyEmpty] = await db
    .insert(AgencyTable)
    .values({
      name: "E2E Workforce Agency Empty",
      onboardingCompletedAt: new Date(),
      primaryServiceAreaLat: "37.7749",
      primaryServiceAreaLng: "-122.4194",
      serviceAreaRadiusMiles: 50,
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
  await createUser(
    "e2e-workforce-empty@example.com",
    "E2E Workforce Empty",
    "agency_owner",
    agencyEmpty.id,
  );

  const [facility] = await db
    .insert(FacilityTable)
    .values({
      agencyId: agencyAId,
      name: "E2E Memorial Hospital",
      type: "hospital",
      contactName: "Pat Rivera",
      contactEmail: "memorial.contact@example.com",
      contactPhone: "5559876543",
      city: "San Francisco",
      state: "CA",
      country: "US",
      placeId: "mock-sf",
      latitude: "37.7749",
      longitude: "-122.4194",
    })
    .returning({ id: FacilityTable.id });

  await db.insert(FacilityTable).values({
    agencyId: agencyAId,
    name: "SF Community Clinic",
    type: "clinic",
    contactName: "Sam Lee",
    contactEmail: "clinic.contact@example.com",
    contactPhone: "5551112222",
    city: "San Francisco",
    state: "CA",
    country: "US",
    placeId: "mock-sf",
    latitude: "37.7749",
    longitude: "-122.4194",
  });

  const AGENCY_B_FACILITY_ID = "e2e00000-0000-4000-8000-0000000000f1";
  await db.insert(FacilityTable).values({
    id: AGENCY_B_FACILITY_ID,
    agencyId: agencyBId,
    name: "Other Agency Facility",
    type: "hospital",
    contactName: "Other Contact",
    contactEmail: "other.facility@example.com",
    contactPhone: "5550001111",
    city: "Austin",
    state: "TX",
  });

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

  const [draftRequest] = await db
    .insert(StaffingRequestTable)
    .values({
      agencyId: agencyAId,
      facilityId: facility.id,
      createdByUserId: ownerAId,
      title: "E2E Draft Request",
      roleNeeded: "rn",
      professionalsRequired: 2,
      priority: "normal",
      status: "draft",
    })
    .returning({ id: StaffingRequestTable.id });

  const AGENCY_B_REQUEST_ID = "e2e00000-0000-4000-8000-000000000011";
  const AGENCY_B_SHIFT_ID = "e2e00000-0000-4000-8000-000000000012";
  await db.insert(StaffingRequestTable).values({
    id: AGENCY_B_REQUEST_ID,
    agencyId: agencyBId,
    facilityId: AGENCY_B_FACILITY_ID,
    createdByUserId: ownerAId,
    title: "Other Agency Request",
    roleNeeded: "rn",
    professionalsRequired: 1,
    priority: "normal",
    status: "open",
  });

  const shiftBase = Date.now() + 48 * 60 * 60 * 1000;

  await db.insert(ShiftTable).values({
    id: AGENCY_B_SHIFT_ID,
    agencyId: agencyBId,
    staffingRequestId: AGENCY_B_REQUEST_ID,
    facilityId: AGENCY_B_FACILITY_ID,
    startAt: new Date(shiftBase),
    endAt: new Date(shiftBase + 8 * 60 * 60 * 1000),
    status: "open",
  });
  for (const reqId of [requestIds[0], requestIds[1]]) {
    await db.insert(ShiftTable).values({
      agencyId: agencyAId,
      staffingRequestId: reqId,
      facilityId: facility.id,
      startAt: new Date(shiftBase),
      endAt: new Date(shiftBase + 8 * 60 * 60 * 1000),
      status: "open",
    });
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
  const proDefs = [
    { firstName: "Jane", lastName: "Smith", availabilityStatus: "available" as const, email: "jane.smith.e2e@example.com" },
    { firstName: "Pro2", lastName: "E2E", availabilityStatus: "available" as const, email: "pro2.e2e@example.com" },
    { firstName: "Pro3", lastName: "E2E", availabilityStatus: "unavailable" as const, email: null },
  ];
  for (const def of proDefs) {
    const [p] = await db
      .insert(HealthcareProfessionalTable)
      .values({
        agencyId: agencyAId,
        firstName: def.firstName,
        lastName: def.lastName,
        role: "rn",
        email: def.email,
        availabilityStatus: def.availabilityStatus,
        isActive: true,
        city: "San Francisco",
        state: "CA",
        latitude: "37.7749",
        longitude: "-122.4194",
        placeId: "mock-sf",
      })
      .returning({ id: HealthcareProfessionalTable.id });
    pros.push(p.id);
  }

  const AGENCY_B_PRO_ID = "e2e00000-0000-4000-8000-0000000000b1";
  await db.insert(HealthcareProfessionalTable).values({
    id: AGENCY_B_PRO_ID,
    agencyId: agencyBId,
    firstName: "Other",
    lastName: "Agency",
    role: "rn",
    isActive: true,
    city: "Austin",
    state: "TX",
  });

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
  console.log(
    `Agency A: ${agencyAId}, Agency B: ${agencyBId}, Agency B pro: ${AGENCY_B_PRO_ID}, Agency B facility: ${AGENCY_B_FACILITY_ID}, Agency B request: e2e00000-0000-4000-8000-000000000011, Agency B shift: e2e00000-0000-4000-8000-000000000012, draft: ${draftRequest.id}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
