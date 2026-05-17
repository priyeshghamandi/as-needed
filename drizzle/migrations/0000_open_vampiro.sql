CREATE TYPE "public"."agency_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."assignment_status" AS ENUM('invited', 'accepted', 'declined', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('available', 'unavailable', 'on_shift', 'pending_confirmation');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('pending_review', 'verified', 'expiring_soon', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."facility_type" AS ENUM('hospital', 'nursing_home', 'clinic', 'assisted_living', 'home_healthcare', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('info', 'important', 'urgent', 'critical');--> statement-breakpoint
CREATE TYPE "public"."professional_role" AS ENUM('rn', 'cna', 'emt', 'lpn', 'cnm', 'cns', 'other');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('open', 'matching', 'partially_filled', 'confirmed', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staffing_request_status" AS ENUM('draft', 'open', 'matching', 'partially_filled', 'confirmed', 'at_risk', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('platform_admin', 'agency_owner', 'agency_admin', 'staffing_coordinator', 'recruiter', 'compliance_manager', 'facility_user', 'provider');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'invited', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "agency_status" DEFAULT 'active' NOT NULL,
	"agency_type" varchar(32),
	"workforce_size" varchar(32),
	"phone" varchar(50),
	"website" text,
	"primary_service_area_name" varchar(255),
	"primary_service_area_place_id" varchar(255),
	"primary_service_area_city" varchar(120),
	"primary_service_area_state" varchar(120),
	"primary_service_area_country" varchar(120),
	"primary_service_area_lat" numeric(10, 7),
	"primary_service_area_lng" numeric(10, 7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "availability_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"type" varchar(120) NOT NULL,
	"name" varchar(255) NOT NULL,
	"license_number" varchar(120),
	"issuing_authority" varchar(255),
	"issued_at" date,
	"expires_at" date,
	"status" "credential_status" DEFAULT 'pending_review' NOT NULL,
	"document_url" text,
	"verified_by_user_id" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "facility_type" DEFAULT 'other' NOT NULL,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"address_line_1" text,
	"address_line_2" text,
	"city" varchar(120),
	"state" varchar(120),
	"country" varchar(120),
	"postal_code" varchar(40),
	"place_id" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "healthcare_professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"user_id" uuid,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"role" "professional_role" NOT NULL,
	"specialty" varchar(120),
	"years_experience" integer,
	"city" varchar(120),
	"state" varchar(120),
	"country" varchar(120),
	"postal_code" varchar(40),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"availability_status" "availability_status" DEFAULT 'unavailable' NOT NULL,
	"reliability_score" integer DEFAULT 100,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" "notification_priority" DEFAULT 'info' NOT NULL,
	"related_entity_type" varchar(80),
	"related_entity_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "shift_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shift_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"invited_by_user_id" uuid,
	"status" "assignment_status" DEFAULT 'invited' NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now(),
	"responded_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"decline_reason" text,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"staffing_request_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"shift_type" varchar(60),
	"break_minutes" integer DEFAULT 0,
	"required_count" integer DEFAULT 1 NOT NULL,
	"status" "shift_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"assigned_coordinator_id" uuid,
	"title" text NOT NULL,
	"role_needed" "professional_role" NOT NULL,
	"specialty" varchar(120),
	"professionals_required" integer DEFAULT 1 NOT NULL,
	"priority" varchar(40) DEFAULT 'normal' NOT NULL,
	"status" "staffing_request_status" DEFAULT 'open' NOT NULL,
	"required_credentials" jsonb,
	"notes" text,
	"facility_instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"agency_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_verified_by_user_id_users_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healthcare_professionals" ADD CONSTRAINT "healthcare_professionals_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healthcare_professionals" ADD CONSTRAINT "healthcare_professionals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_staffing_request_id_staffing_requests_id_fk" FOREIGN KEY ("staffing_request_id") REFERENCES "public"."staffing_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD CONSTRAINT "staffing_requests_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD CONSTRAINT "staffing_requests_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD CONSTRAINT "staffing_requests_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD CONSTRAINT "staffing_requests_assigned_coordinator_id_users_id_fk" FOREIGN KEY ("assigned_coordinator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_user" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_accounts_provider_account" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_agency" ON "activity_logs" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_actor" ON "activity_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_entity" ON "activity_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_agencies_status" ON "agencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agencies_service_area_place" ON "agencies" USING btree ("primary_service_area_place_id");--> statement-breakpoint
CREATE INDEX "idx_availability_professional" ON "availability_blocks" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "idx_availability_time" ON "availability_blocks" USING btree ("start_at","end_at");--> statement-breakpoint
CREATE INDEX "idx_credentials_agency" ON "credentials" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_credentials_professional" ON "credentials" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "idx_credentials_status" ON "credentials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_credentials_expires" ON "credentials" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_facilities_agency" ON "facilities" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_facilities_type" ON "facilities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_professionals_agency" ON "healthcare_professionals" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_professionals_user" ON "healthcare_professionals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_professionals_role" ON "healthcare_professionals" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_professionals_availability" ON "healthcare_professionals" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_agency" ON "notifications" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "idx_shift_assignments_shift" ON "shift_assignments" USING btree ("shift_id");--> statement-breakpoint
CREATE INDEX "idx_shift_assignments_professional" ON "shift_assignments" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "idx_shift_assignments_status" ON "shift_assignments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_shift_professional" ON "shift_assignments" USING btree ("shift_id","professional_id");--> statement-breakpoint
CREATE INDEX "idx_shifts_agency" ON "shifts" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_shifts_request" ON "shifts" USING btree ("staffing_request_id");--> statement-breakpoint
CREATE INDEX "idx_shifts_facility" ON "shifts" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "idx_shifts_time" ON "shifts" USING btree ("start_at","end_at");--> statement-breakpoint
CREATE INDEX "idx_shifts_status" ON "shifts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_staffing_requests_agency" ON "staffing_requests" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_staffing_requests_facility" ON "staffing_requests" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "idx_staffing_requests_status" ON "staffing_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_staffing_requests_coordinator" ON "staffing_requests" USING btree ("assigned_coordinator_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_user" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role" ON "user_roles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_user_roles_agency" ON "user_roles" USING btree ("agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_user_roles_user_role_agency" ON "user_roles" USING btree ("user_id","role","agency_id");