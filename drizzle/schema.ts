// src/db/schema/index.ts
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  date,
  time,
  decimal,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();

export const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();

/* ---------------- ENUMS ---------------- */

export const AgencyStatusEnum = pgEnum("agency_status", [
  "active",
  "suspended",
  "deleted",
]);

export const UserStatusEnum = pgEnum("user_status", [
  "active",
  "invited",
  "suspended",
  "deleted",
]);

export const UserRoleEnum = pgEnum("user_role", [
  "platform_admin",
  "agency_owner",
  "agency_admin",
  "staffing_coordinator",
  "recruiter",
  "compliance_manager",
  "facility_user",
  "provider",
]);

export const FacilityTypeEnum = pgEnum("facility_type", [
  "hospital",
  "nursing_home",
  "clinic",
  "assisted_living",
  "home_healthcare",
  "other",
]);

export const ProfessionalRoleEnum = pgEnum("professional_role", [
  "rn",
  "cna",
  "emt",
  "lpn",
  "cnm",
  "cns",
  "other",
]);

export const AvailabilityStatusEnum = pgEnum("availability_status", [
  "available",
  "unavailable",
  "on_shift",
  "pending_confirmation",
]);

export const StaffingRequestStatusEnum = pgEnum("staffing_request_status", [
  "draft",
  "open",
  "matching",
  "partially_filled",
  "confirmed",
  "at_risk",
  "completed",
  "cancelled",
]);

export const ShiftStatusEnum = pgEnum("shift_status", [
  "open",
  "matching",
  "partially_filled",
  "confirmed",
  "active",
  "completed",
  "cancelled",
]);

export const AssignmentStatusEnum = pgEnum("assignment_status", [
  "invited",
  "accepted",
  "declined",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
]);

export const CredentialStatusEnum = pgEnum("credential_status", [
  "pending_review",
  "verified",
  "expiring_soon",
  "expired",
  "rejected",
]);

export const NotificationPriorityEnum = pgEnum("notification_priority", [
  "info",
  "important",
  "urgent",
  "critical",
]);

export const InviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const InviteTypeEnum = pgEnum("invite_type", [
  "agency_staff",
  "provider",
  "facility_user",
]);

/* ---------------- AUTH TABLES ---------------- */

export const UserTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: text("password_hash"),

  emailVerified: timestamp("email_verified", { withTimezone: true }),

  image: text("image"),

  status: UserStatusEnum("status")
    .notNull()
    .default("active"),

  createdAt,
  updatedAt,
});

export const AccountTable = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),

    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 255 }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index("idx_accounts_user").on(table.userId),
    providerUniq: uniqueIndex("ux_accounts_provider_account").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const SessionTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),

  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),

  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),

  expires: timestamp("expires", { withTimezone: true }).notNull(),

  createdAt,
});

export const VerificationTokenTable = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

/* ---------------- AGENCIES ---------------- */

export const AgencyTable = pgTable(
  "agencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    status: AgencyStatusEnum("status").notNull().default("active"),

    agencyType: varchar("agency_type", { length: 32 }),
    workforceSize: varchar("workforce_size", { length: 32 }),

    phone: varchar("phone", { length: 50 }),
    website: text(),

    primaryServiceAreaName: varchar("primary_service_area_name", { length: 255 }),
    primaryServiceAreaPlaceId: varchar("primary_service_area_place_id", {
      length: 255,
    }),
    primaryServiceAreaCity: varchar("primary_service_area_city", { length: 120 }),
    primaryServiceAreaState: varchar("primary_service_area_state", {
      length: 120,
    }),
    primaryServiceAreaCountry: varchar("primary_service_area_country", {
      length: 120,
    }),
    primaryServiceAreaLat: decimal("primary_service_area_lat", {
      precision: 10,
      scale: 7,
    }),
    primaryServiceAreaLng: decimal("primary_service_area_lng", {
      precision: 10,
      scale: 7,
    }),

    serviceAreaRadiusMiles: integer("service_area_radius_miles")
      .notNull()
      .default(75),

    operationalContactName: varchar("operational_contact_name", { length: 120 }),
    operationalContactEmail: varchar("operational_contact_email", { length: 255 }),
    description: text("description"),
    logoUrl: text("logo_url"),
    staffingSpecialties: jsonb("staffing_specialties")
      .$type<string[]>()
      .notNull()
      .default([]),

    agencyPreferences: jsonb("agency_preferences")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    onboardingCurrentStep: varchar("onboarding_current_step", { length: 32 })
      .notNull()
      .default("welcome"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    onboardingProgress: jsonb("onboarding_progress")
      .$type<{ completedSteps: string[]; skippedSteps: string[] }>()
      .notNull()
      .default({ completedSteps: [], skippedSteps: [] }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    statusIdx: index("idx_agencies_status").on(table.status),
    placeIdx: index("idx_agencies_service_area_place").on(
      table.primaryServiceAreaPlaceId
    ),
  })
);

export const UserRoleTable = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    role: UserRoleEnum("role").notNull(),

    agencyId: uuid("agency_id").references(() => AgencyTable.id, {
      onDelete: "cascade",
    }),

    createdAt,
  },
  (table) => ({
    userIdx: index("idx_user_roles_user").on(table.userId),
    roleIdx: index("idx_user_roles_role").on(table.role),
    agencyIdx: index("idx_user_roles_agency").on(table.agencyId),
    uniqUserRoleScope: uniqueIndex("ux_user_roles_user_role_agency").on(
      table.userId,
      table.role,
      table.agencyId
    ),
  })
);

/* ---------------- FACILITIES ---------------- */

export const FacilityTable = pgTable(
  "facilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    type: FacilityTypeEnum("type").notNull().default("other"),

    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),

    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 120 }),
    country: varchar("country", { length: 120 }),
    postalCode: varchar("postal_code", { length: 40 }),

    placeId: varchar("place_id", { length: 255 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),

    notes: text("notes"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    agencyIdx: index("idx_facilities_agency").on(table.agencyId),
    typeIdx: index("idx_facilities_type").on(table.type),
  })
);

export const UserInviteTable = pgTable(
  "user_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    token: varchar("token", { length: 64 }).notNull().unique(),

    email: varchar("email", { length: 255 }).notNull(),

    role: UserRoleEnum("role").notNull(),

    inviteType: InviteTypeEnum("invite_type").notNull(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    facilityId: uuid("facility_id").references(() => FacilityTable.id, {
      onDelete: "set null",
    }),

    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    status: InviteStatusEnum("status").notNull().default("pending"),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    acceptedAt: timestamp("accepted_at", { withTimezone: true }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    emailIdx: index("idx_user_invites_email").on(table.email),
    agencyIdx: index("idx_user_invites_agency").on(table.agencyId),
    statusIdx: index("idx_user_invites_status").on(table.status),
    tokenIdx: uniqueIndex("ux_user_invites_token").on(table.token),
  })
);

/* ---------------- HEALTHCARE PROFESSIONALS ---------------- */

export const HealthcareProfessionalTable = pgTable(
  "healthcare_professionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    userId: uuid("user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),

    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),

    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),

    role: ProfessionalRoleEnum("role").notNull(),
    specialty: varchar("specialty", { length: 120 }),

    yearsExperience: integer("years_experience"),

    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 120 }),
    country: varchar("country", { length: 120 }),
    postalCode: varchar("postal_code", { length: 40 }),
    placeId: varchar("place_id", { length: 255 }),

    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),

    availabilityStatus: AvailabilityStatusEnum("availability_status")
      .notNull()
      .default("unavailable"),

    reliabilityScore: integer("reliability_score").default(100),

    isActive: boolean("is_active").notNull().default(true),

    publicSlug: varchar("public_slug", { length: 160 }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    agencyIdx: index("idx_professionals_agency").on(table.agencyId),
    userIdx: index("idx_professionals_user").on(table.userId),
    roleIdx: index("idx_professionals_role").on(table.role),
    availabilityIdx: index("idx_professionals_availability").on(
      table.availabilityStatus
    ),
    publicSlugIdx: uniqueIndex("ux_professionals_public_slug").on(table.publicSlug),
  })
);

/* ---------------- MARKETPLACE VISIBILITY ---------------- */

export const ProfessionalMarketplaceVisibilityTable = pgTable(
  "professional_marketplace_visibility",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    healthcareProfessionalId: uuid("healthcare_professional_id")
      .notNull()
      .references(() => HealthcareProfessionalTable.id, { onDelete: "cascade" }),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    isMarketplaceVisible: boolean("is_marketplace_visible").notNull().default(false),

    visibilityBlockedReason: varchar("visibility_blocked_reason", { length: 64 }),

    marketplaceVisibleAt: timestamp("marketplace_visible_at", { withTimezone: true }),
    marketplaceHiddenAt: timestamp("marketplace_hidden_at", { withTimezone: true }),

    enabledByUserId: uuid("enabled_by_user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    professionalIdx: uniqueIndex("ux_marketplace_visibility_professional").on(
      table.healthcareProfessionalId,
    ),
    agencyIdx: index("idx_marketplace_visibility_agency").on(table.agencyId),
  }),
);

/* ---------------- CREDENTIALS ---------------- */

export const CredentialTable = pgTable(
  "credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    professionalId: uuid("professional_id")
      .notNull()
      .references(() => HealthcareProfessionalTable.id, {
        onDelete: "cascade",
      }),

    type: varchar("type", { length: 120 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),

    licenseNumber: varchar("license_number", { length: 120 }),
    issuingAuthority: varchar("issuing_authority", { length: 255 }),

    issuedAt: date("issued_at"),
    expiresAt: date("expires_at"),

    status: CredentialStatusEnum("status").notNull().default("pending_review"),

    documentUrl: text("document_url"),

    verifiedByUserId: uuid("verified_by_user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    reviewNotes: text("review_notes"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    agencyIdx: index("idx_credentials_agency").on(table.agencyId),
    professionalIdx: index("idx_credentials_professional").on(
      table.professionalId
    ),
    statusIdx: index("idx_credentials_status").on(table.status),
    expiryIdx: index("idx_credentials_expires").on(table.expiresAt),
  })
);

/* ---------------- AVAILABILITY ---------------- */

export const AvailabilityBlockTable = pgTable(
  "availability_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    professionalId: uuid("professional_id")
      .notNull()
      .references(() => HealthcareProfessionalTable.id, {
        onDelete: "cascade",
      }),

    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),

    status: AvailabilityStatusEnum("status").notNull().default("available"),

    notes: text("notes"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    professionalIdx: index("idx_availability_professional").on(
      table.professionalId
    ),
    timeIdx: index("idx_availability_time").on(table.startAt, table.endAt),
  })
);

/* ---------------- STAFFING REQUESTS ---------------- */

export const StaffingRequestTable = pgTable(
  "staffing_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => FacilityTable.id, { onDelete: "cascade" }),

    createdByUserId: uuid("created_by_user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),

    assignedCoordinatorId: uuid("assigned_coordinator_id").references(
      () => UserTable.id,
      { onDelete: "set null" }
    ),

    title: text("title").notNull(),

    roleNeeded: ProfessionalRoleEnum("role_needed").notNull(),
    specialty: varchar("specialty", { length: 120 }),

    professionalsRequired: integer("professionals_required").notNull().default(1),

    priority: varchar("priority", { length: 40 }).notNull().default("normal"),

    status: StaffingRequestStatusEnum("status").notNull().default("open"),

    requiredCredentials: jsonb("required_credentials").$type<string[]>(),

    notes: text("notes"),
    facilityInstructions: text("facility_instructions"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    agencyIdx: index("idx_staffing_requests_agency").on(table.agencyId),
    facilityIdx: index("idx_staffing_requests_facility").on(table.facilityId),
    statusIdx: index("idx_staffing_requests_status").on(table.status),
    coordinatorIdx: index("idx_staffing_requests_coordinator").on(
      table.assignedCoordinatorId
    ),
  })
);

/* ---------------- SHIFTS ---------------- */

export const ShiftTable = pgTable(
  "shifts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    staffingRequestId: uuid("staffing_request_id")
      .notNull()
      .references(() => StaffingRequestTable.id, {
        onDelete: "cascade",
      }),

    facilityId: uuid("facility_id")
      .notNull()
      .references(() => FacilityTable.id, { onDelete: "cascade" }),

    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),

    shiftType: varchar("shift_type", { length: 60 }),
    breakMinutes: integer("break_minutes").default(0),

    requiredCount: integer("required_count").notNull().default(1),

    status: ShiftStatusEnum("status").notNull().default("open"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    agencyIdx: index("idx_shifts_agency").on(table.agencyId),
    requestIdx: index("idx_shifts_request").on(table.staffingRequestId),
    facilityIdx: index("idx_shifts_facility").on(table.facilityId),
    timeIdx: index("idx_shifts_time").on(table.startAt, table.endAt),
    statusIdx: index("idx_shifts_status").on(table.status),
  })
);

/* ---------------- SHIFT ASSIGNMENTS ---------------- */

export const ShiftAssignmentTable = pgTable(
  "shift_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    shiftId: uuid("shift_id")
      .notNull()
      .references(() => ShiftTable.id, { onDelete: "cascade" }),

    professionalId: uuid("professional_id")
      .notNull()
      .references(() => HealthcareProfessionalTable.id, {
        onDelete: "cascade",
      }),

    invitedByUserId: uuid("invited_by_user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),

    status: AssignmentStatusEnum("status").notNull().default("invited"),

    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),

    declineReason: text("decline_reason"),
    cancellationReason: text("cancellation_reason"),

    createdAt,
    updatedAt,
  },
  (table) => ({
    shiftIdx: index("idx_shift_assignments_shift").on(table.shiftId),
    professionalIdx: index("idx_shift_assignments_professional").on(
      table.professionalId
    ),
    statusIdx: index("idx_shift_assignments_status").on(table.status),
    uniqueShiftProfessional: uniqueIndex("ux_shift_professional").on(
      table.shiftId,
      table.professionalId
    ),
  })
);

/* ---------------- NOTIFICATIONS ---------------- */

export const NotificationTable = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id").references(() => AgencyTable.id, {
      onDelete: "cascade",
    }),

    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    message: text("message").notNull(),

    priority: NotificationPriorityEnum("priority").notNull().default("info"),

    relatedEntityType: varchar("related_entity_type", { length: 80 }),
    relatedEntityId: uuid("related_entity_id"),

    readAt: timestamp("read_at", { withTimezone: true }),

    createdAt,
  },
  (table) => ({
    userIdx: index("idx_notifications_user").on(table.userId),
    agencyIdx: index("idx_notifications_agency").on(table.agencyId),
    readIdx: index("idx_notifications_read").on(table.readAt),
  })
);

/* ---------------- ACTIVITY LOGS ---------------- */

export const ActivityLogTable = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    agencyId: uuid("agency_id")
      .notNull()
      .references(() => AgencyTable.id, { onDelete: "cascade" }),

    actorUserId: uuid("actor_user_id").references(() => UserTable.id, {
      onDelete: "set null",
    }),

    action: varchar("action", { length: 120 }).notNull(),

    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt,
  },
  (table) => ({
    agencyIdx: index("idx_activity_logs_agency").on(table.agencyId),
    actorIdx: index("idx_activity_logs_actor").on(table.actorUserId),
    entityIdx: index("idx_activity_logs_entity").on(
      table.entityType,
      table.entityId
    ),
  })
);