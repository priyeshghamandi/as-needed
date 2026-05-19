/**
 * Seeds Agencies A/B and dashboard E2E users. Idempotent by email.
 * Run: npm run db:seed:dashboard-e2e
 */
import "./preload-env";
import { eq, inArray, like, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  ActivityLogTable,
  AgencyTable,
  AvailabilityBlockTable,
  CredentialTable,
  NotificationTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ProfessionalMarketplaceProfileTable,
  ProfessionalMarketplaceVisibilityTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
  UserCareSiteTable,
  UserInviteTable,
  UserRoleTable,
  UserTable,
} from "../drizzle/schema";
import { hashPassword } from "../lib/auth/password";
import { syncMarketplaceComplianceBlock } from "../lib/marketplace/compliance-visibility";

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
  "e2e-dash-consumer@example.com",
  "e2e-workforce-empty@example.com",
  "e2e-provider-unlinked@example.com",
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
  await db.execute(
    sql`ALTER TABLE "credentials" ADD COLUMN IF NOT EXISTS "review_notes" text`,
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

  await db.delete(UserInviteTable).where(inArray(UserInviteTable.email, SEED_EMAILS));

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
      primaryServiceAreaName: "San Francisco, CA",
      primaryServiceAreaPlaceId: "mock-sf-b",
      primaryServiceAreaCity: "San Francisco",
      primaryServiceAreaState: "CA",
      primaryServiceAreaCountry: "US",
      primaryServiceAreaLat: "37.7749",
      primaryServiceAreaLng: "-122.4194",
      serviceAreaRadiusMiles: 50,
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
  const ownerBId = await createUser(
    "e2e-dash-owner-b@example.com",
    "E2E Owner B",
    "agency_owner",
    agencyBId,
  );
  await createUser(
    "e2e-dash-owner-incomplete@example.com",
    "E2E Owner Incomplete",
    "agency_owner",
    agencyIncomplete.id,
  );
  const coordinatorUserId = await createUser(
    "e2e-dash-coordinator@example.com",
    "E2E Coordinator",
    "staffing_coordinator",
    agencyAId,
  );
  const recruiterUserId = await createUser(
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
  const providerUserId = await createUser(
    "e2e-dash-provider@example.com",
    "E2E Provider",
    "provider",
    null,
  );
  await createUser(
    "e2e-provider-unlinked@example.com",
    "E2E Provider Unlinked",
    "provider",
    null,
  );
  const facilityUserId = await createUser(
    "e2e-dash-facility@example.com",
    "E2E Facility User",
    "facility_user",
    agencyAId,
  );
  const consumerUserId = await createUser(
    "e2e-dash-consumer@example.com",
    "E2E Consumer",
    "consumer",
    null,
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
      requiredCount: reqId === requestIds[0] ? 5 : 1,
    });
  }

  const fillRequestId = requestIds[0];
  const in12h = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const in12hEnd = new Date(in12h.getTime() + 8 * 60 * 60 * 1000);

  const E2E_AGENCY_A_ER_SHIFT = "e2e00000-0000-4000-8000-000000000020";
  const E2E_DECLINED_ASSIGNMENT = "e2e00000-0000-4000-8000-000000000103";

  await db.insert(ShiftTable).values({
    id: E2E_AGENCY_A_ER_SHIFT,
    agencyId: agencyAId,
    staffingRequestId: requestIds[2],
    facilityId: facility.id,
    startAt: in12h,
    endAt: in12hEnd,
    status: "open",
  });

  const E2E_PROVIDER_PRO_ID = "e2e00000-0000-4000-8000-0000000000a1";
  const E2E_MP_PRO_1 = "e2e00000-0000-4000-8000-000000000401";
  const E2E_MP_PRO_2 = "e2e00000-0000-4000-8000-000000000402";
  const pros: string[] = [];
  const proDefs = [
    { id: E2E_PROVIDER_PRO_ID, firstName: "Jane", lastName: "Smith", availabilityStatus: "available" as const, email: "jane.smith.e2e@example.com", userId: providerUserId },
    { id: E2E_MP_PRO_1, firstName: "Pro2", lastName: "E2E", availabilityStatus: "available" as const, email: "pro2.e2e@example.com" },
    { id: E2E_MP_PRO_2, firstName: "Pro3", lastName: "E2E", availabilityStatus: "available" as const, email: "pro3.e2e@example.com" },
  ];
  for (const def of proDefs) {
    const [p] = await db
      .insert(HealthcareProfessionalTable)
      .values({
        ...( "id" in def && def.id ? { id: def.id } : {}),
        ...( "userId" in def && def.userId ? { userId: def.userId } : {}),
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

  await db.insert(ShiftAssignmentTable).values({
    id: E2E_DECLINED_ASSIGNMENT,
    shiftId: E2E_AGENCY_A_ER_SHIFT,
    professionalId: pros[0],
    invitedByUserId: ownerAId,
    status: "declined",
    declineReason: "Schedule conflict (E2E seed)",
    invitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  });

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

  await db
    .update(HealthcareProfessionalTable)
    .set({
      publicSlug: "e2e-marketplace-rn-agency-b",
      availabilityStatus: "available",
      city: "San Francisco",
      state: "CA",
      latitude: "37.7749",
      longitude: "-122.4194",
      placeId: "mock-sf",
    })
    .where(eq(HealthcareProfessionalTable.id, AGENCY_B_PRO_ID));
  await db.insert(ProfessionalMarketplaceVisibilityTable).values({
    healthcareProfessionalId: AGENCY_B_PRO_ID,
    agencyId: agencyBId,
    isMarketplaceVisible: true,
    marketplaceVisibleAt: new Date(),
    enabledByUserId: ownerBId,
  });
  await db.insert(ProfessionalMarketplaceProfileTable).values({
    healthcareProfessionalId: AGENCY_B_PRO_ID,
    headline: "E2E RN Agency B",
    bio: "Seeded for multi-agency routing E2E.",
    approximateAvailability: "available_this_week",
  });
  await db.insert(CredentialTable).values({
    agencyId: agencyBId,
    professionalId: AGENCY_B_PRO_ID,
    type: "license",
    name: "RN License",
    status: "verified",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
  await syncMarketplaceComplianceBlock(agencyBId, AGENCY_B_PRO_ID);

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

  const HPP_SHIFT_INVITE_1 = "e2e00000-0000-4000-8000-000000000201";
  const HPP_SHIFT_INVITE_2 = "e2e00000-0000-4000-8000-000000000202";
  const HPP_INVITE_ASSIGNMENT_1 = "e2e00000-0000-4000-8000-000000000101";
  const HPP_INVITE_ASSIGNMENT_2 = "e2e00000-0000-4000-8000-000000000102";
  const HPP_AVAIL_BLOCK_1 = "e2e00000-0000-4000-8000-000000000301";
  const HPP_AVAIL_BLOCK_2 = "e2e00000-0000-4000-8000-000000000302";

  const [hppRequest] = await db
    .insert(StaffingRequestTable)
    .values({
      agencyId: agencyAId,
      facilityId: facility.id,
      createdByUserId: ownerAId,
      assignedCoordinatorId: ownerAId,
      title: "Provider Portal ICU RN",
      roleNeeded: "rn",
      professionalsRequired: 2,
      priority: "high",
      status: "matching",
      facilityInstructions: "Check in at nurse station 3.",
    })
    .returning({ id: StaffingRequestTable.id });

  const inviteStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  inviteStart.setHours(7, 0, 0, 0);
  const inviteEnd = new Date(inviteStart.getTime() + 8 * 60 * 60 * 1000);

  await db.insert(ShiftTable).values([
    {
      id: HPP_SHIFT_INVITE_1,
      agencyId: agencyAId,
      staffingRequestId: hppRequest.id,
      facilityId: facility.id,
      startAt: inviteStart,
      endAt: inviteEnd,
      status: "open",
    },
    {
      id: HPP_SHIFT_INVITE_2,
      agencyId: agencyAId,
      staffingRequestId: hppRequest.id,
      facilityId: facility.id,
      startAt: inviteStart,
      endAt: inviteEnd,
      status: "open",
    },
  ]);

  await db.insert(ShiftAssignmentTable).values([
    {
      id: HPP_INVITE_ASSIGNMENT_1,
      shiftId: HPP_SHIFT_INVITE_1,
      professionalId: E2E_PROVIDER_PRO_ID,
      invitedByUserId: ownerAId,
      status: "invited",
      invitedAt: new Date(),
    },
    {
      id: HPP_INVITE_ASSIGNMENT_2,
      shiftId: HPP_SHIFT_INVITE_2,
      professionalId: E2E_PROVIDER_PRO_ID,
      invitedByUserId: ownerAId,
      status: "invited",
      invitedAt: new Date(),
    },
  ]);

  const availBase = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  availBase.setHours(8, 0, 0, 0);
  const availEnd = new Date(availBase.getTime() + 8 * 60 * 60 * 1000);
  const avail2Start = new Date(availEnd.getTime() + 24 * 60 * 60 * 1000);
  const avail2End = new Date(avail2Start.getTime() + 4 * 60 * 60 * 1000);

  await db.insert(AvailabilityBlockTable).values([
    {
      id: HPP_AVAIL_BLOCK_1,
      professionalId: E2E_PROVIDER_PRO_ID,
      startAt: availBase,
      endAt: availEnd,
      status: "available",
      notes: "E2E seeded availability",
    },
    {
      id: HPP_AVAIL_BLOCK_2,
      professionalId: E2E_PROVIDER_PRO_ID,
      startAt: avail2Start,
      endAt: avail2End,
      status: "unavailable",
    },
  ]);

  const in20Days = new Date();
  in20Days.setDate(in20Days.getDate() + 20);
  const in20DaysStr = in20Days.toISOString().slice(0, 10);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);
  const pastDateStr = pastDate.toISOString().slice(0, 10);

  const E2E_CRED_PENDING = "e2e00000-0000-4000-8000-0000000000c1";
  const E2E_CRED_VERIFIED = "e2e00000-0000-4000-8000-0000000000c2";
  const E2E_CRED_EXPIRING = "e2e00000-0000-4000-8000-0000000000c3";
  const E2E_CRED_EXPIRED = "e2e00000-0000-4000-8000-0000000000c4";
  const E2E_CRED_REJECTED = "e2e00000-0000-4000-8000-0000000000c5";
  const E2E_CRED_AGENCY_B = "e2e00000-0000-4000-8000-0000000000c6";

  await db.insert(CredentialTable).values([
    {
      id: E2E_CRED_PENDING,
      agencyId: agencyAId,
      professionalId: pros[1],
      type: "cert",
      name: "BLS Certification",
      licenseNumber: "BLS-001",
      status: "pending_review",
    },
    {
      id: E2E_CRED_VERIFIED,
      agencyId: agencyAId,
      professionalId: pros[0],
      type: "license",
      name: "RN License",
      licenseNumber: "RN-12345",
      status: "verified",
      expiresAt: in20DaysStr,
      verifiedAt: new Date(),
      verifiedByUserId: ownerAId,
    },
    {
      id: E2E_CRED_EXPIRING,
      agencyId: agencyAId,
      professionalId: pros[0],
      type: "cert",
      name: "ACLS",
      status: "expiring_soon",
      expiresAt: in20DaysStr,
    },
    {
      id: E2E_CRED_EXPIRED,
      agencyId: agencyAId,
      professionalId: pros[2],
      type: "license",
      name: "Expired License",
      status: "expired",
      expiresAt: pastDateStr,
    },
    {
      id: E2E_CRED_REJECTED,
      agencyId: agencyAId,
      professionalId: pros[2],
      type: "cert",
      name: "Rejected Cert",
      status: "rejected",
      reviewNotes: "Document illegible for E2E seed.",
    },
    {
      id: E2E_CRED_AGENCY_B,
      agencyId: agencyBId,
      professionalId: AGENCY_B_PRO_ID,
      type: "license",
      name: "Other Agency License",
      status: "verified",
    },
  ]);

  const E2E_NOTIF_COORD_INFO = "e2e00000-0000-4000-8000-000000000010";
  const E2E_NOTIF_COORD_READ = "e2e00000-0000-4000-8000-000000000011";
  const E2E_NOTIF_COORD_URGENT = "e2e00000-0000-4000-8000-000000000012";
  const E2E_NOTIF_COORD_CRITICAL = "e2e00000-0000-4000-8000-000000000013";
  const E2E_NOTIF_PROVIDER = "e2e00000-0000-4000-8000-000000000014";
  const E2E_NOTIF_RECRUITER = "e2e00000-0000-4000-8000-000000000015";

  const readAt = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db.insert(NotificationTable).values([
    {
      id: E2E_NOTIF_COORD_INFO,
      agencyId: agencyAId,
      userId: coordinatorUserId,
      title: "New staffing request",
      message: "ICU RN — Night was submitted for review.",
      priority: "info",
      relatedEntityType: "staffing_request",
      relatedEntityId: requestIds[0],
    },
    {
      id: E2E_NOTIF_COORD_READ,
      agencyId: agencyAId,
      userId: coordinatorUserId,
      title: "Shift confirmed",
      message: "A professional confirmed their shift assignment.",
      priority: "important",
      readAt,
    },
    {
      id: E2E_NOTIF_COORD_URGENT,
      agencyId: agencyAId,
      userId: coordinatorUserId,
      title: "Assignment declined",
      message: "A professional declined a shift invite — action needed.",
      priority: "urgent",
      relatedEntityType: "shift_assignment",
      relatedEntityId: E2E_DECLINED_ASSIGNMENT,
      createdAt: yesterday,
    },
    {
      id: E2E_NOTIF_COORD_CRITICAL,
      agencyId: agencyAId,
      userId: coordinatorUserId,
      title: "Critical coverage gap",
      message: "ER RN weekend shift has no confirmed coverage.",
      priority: "critical",
      relatedEntityType: "shift",
      relatedEntityId: E2E_AGENCY_A_ER_SHIFT,
    },
    {
      id: E2E_NOTIF_PROVIDER,
      userId: providerUserId,
      title: "Shift invite",
      message: "You have a new shift invitation.",
      priority: "important",
    },
    {
      id: E2E_NOTIF_RECRUITER,
      agencyId: agencyAId,
      userId: recruiterUserId,
      title: "Recruiter-only alert",
      message: "This notification belongs to another user.",
      priority: "info",
    },
  ]);

  const E2E_ACTIVITY_SYSTEM = "e2e00000-0000-4000-8000-000000000030";
  const E2E_ACTIVITY_FACILITY = "e2e00000-0000-4000-8000-000000000031";

  await db.insert(ActivityLogTable).values([
    {
      id: E2E_ACTIVITY_SYSTEM,
      agencyId: agencyAId,
      actorUserId: null,
      action: "staffing_request.status_changed",
      entityType: "staffing_request",
      entityId: requestIds[2],
      metadata: { fromStatus: "open", toStatus: "partially_filled", summary: "Auto risk scan" },
    },
    {
      id: E2E_ACTIVITY_FACILITY,
      agencyId: agencyAId,
      actorUserId: ownerAId,
      action: "facility.created",
      entityType: "facility",
      entityId: facility.id,
      metadata: { summary: "E2E Memorial Hospital added" },
    },
    ...requestIds.slice(0, 3).map((reqId, i) => ({
      agencyId: agencyAId,
      actorUserId: coordinatorUserId,
      action: "staffing_request.created",
      entityType: "staffing_request" as const,
      entityId: reqId,
      metadata: { summary: `Seed request ${i + 1}` },
    })),
    {
      agencyId: agencyAId,
      actorUserId: ownerAId,
      action: "shift.created",
      entityType: "shift",
      entityId: E2E_AGENCY_A_ER_SHIFT,
    },
    {
      agencyId: agencyBId,
      actorUserId: ownerAId,
      action: "staffing_request.created",
      entityType: "staffing_request",
      entityId: AGENCY_B_REQUEST_ID,
      metadata: { summary: "Agency B only" },
    },
  ]);

  for (let i = 0; i < 17; i++) {
    await db.insert(ActivityLogTable).values({
      agencyId: agencyAId,
      actorUserId: i % 2 === 0 ? coordinatorUserId : ownerAId,
      action: "staffing_request.created",
      entityType: "staffing_request",
      entityId: requestIds[i % requestIds.length],
      metadata: { summary: `Dashboard feed item ${i + 1}` },
    });
  }

  const [consumerCareSite] = await db
    .insert(FacilityTable)
    .values({
      agencyId: null,
      siteKind: "consumer_home",
      createdByUserId: consumerUserId,
      name: "E2E Home Care",
      type: "home_healthcare",
      contactName: "E2E Consumer",
      contactEmail: "e2e-dash-consumer@example.com",
      contactPhone: "5554443333",
      city: "San Francisco",
      state: "CA",
      country: "US",
      placeId: "mock-sf-consumer",
      latitude: "37.7749",
      longitude: "-122.4194",
    })
    .returning({ id: FacilityTable.id });

  await db.insert(UserCareSiteTable).values({
    userId: consumerUserId,
    careSiteId: consumerCareSite.id,
  });

  await db.insert(UserInviteTable).values({
    token: "e2e-facility-invite-token-000000000001",
    email: "e2e-dash-facility@example.com",
    role: "facility_user",
    inviteType: "facility_user",
    agencyId: agencyAId,
    facilityId: facility.id,
    invitedByUserId: ownerAId,
    status: "accepted",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    acceptedAt: new Date(),
  });

  for (const proId of [E2E_MP_PRO_1, E2E_MP_PRO_2]) {
    const proIndex = proId === E2E_MP_PRO_1 ? 1 : 2;
    await db
      .update(HealthcareProfessionalTable)
      .set({ publicSlug: `e2e-marketplace-rn-${proIndex}`, availabilityStatus: "available" })
      .where(eq(HealthcareProfessionalTable.id, proId));
    await db.insert(ProfessionalMarketplaceVisibilityTable).values({
      healthcareProfessionalId: proId,
      agencyId: agencyAId,
      isMarketplaceVisible: true,
      marketplaceVisibleAt: new Date(),
      enabledByUserId: ownerAId,
    });
    await db.insert(ProfessionalMarketplaceProfileTable).values({
      healthcareProfessionalId: proId,
      headline: `E2E RN ${proIndex}`,
      bio: "Seeded for customer request E2E.",
      approximateAvailability: "available_this_week",
    });
    await db.insert(CredentialTable).values({
      agencyId: agencyAId,
      professionalId: proId,
      type: "license",
      name: "RN License",
      status: "verified",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    await syncMarketplaceComplianceBlock(agencyAId, proId);
  }

  console.log("Dashboard E2E seed complete.");
  console.log(
    `Facility user: ${facilityUserId}, consumer: ${consumerUserId} (care site ${consumerCareSite.id}), marketplace pros: ${E2E_MP_PRO_1}, ${E2E_MP_PRO_2}`,
  );
  console.log(
    `Agency A: ${agencyAId}, Agency B: ${agencyBId}, Agency B pro: ${AGENCY_B_PRO_ID}, provider pro: e2e00000-0000-4000-8000-0000000000a1, Agency B facility: ${AGENCY_B_FACILITY_ID}, Agency B request: e2e00000-0000-4000-8000-000000000011, Agency B shift: e2e00000-0000-4000-8000-000000000012, draft: ${draftRequest.id}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
