DO $$ BEGIN
  CREATE TYPE "suggested_alternative_status" AS ENUM(
    'pending_customer',
    'approved',
    'rejected',
    'withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "staffing_request_selection_type" ADD VALUE IF NOT EXISTS 'suggested_alternative';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suggested_alternatives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "staffing_request_id" uuid NOT NULL,
  "staffing_request_route_id" uuid NOT NULL,
  "agency_id" uuid NOT NULL,
  "original_professional_id" uuid NOT NULL,
  "suggested_professional_id" uuid NOT NULL,
  "message_to_customer" text,
  "status" "suggested_alternative_status" DEFAULT 'pending_customer' NOT NULL,
  "proposed_by_user_id" uuid NOT NULL,
  "proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone,
  "customer_rejection_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_staffing_request_id_staffing_requests_id_fk" FOREIGN KEY ("staffing_request_id") REFERENCES "public"."staffing_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_staffing_request_route_id_staffing_request_routes_id_fk" FOREIGN KEY ("staffing_request_route_id") REFERENCES "public"."staffing_request_routes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_original_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("original_professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_suggested_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("suggested_professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suggested_alternatives" ADD CONSTRAINT "suggested_alternatives_proposed_by_user_id_users_id_fk" FOREIGN KEY ("proposed_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suggested_alternatives_request" ON "suggested_alternatives" ("staffing_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suggested_alternatives_agency" ON "suggested_alternatives" ("agency_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_suggested_alternatives_pending_original" ON "suggested_alternatives" ("staffing_request_id", "original_professional_id") WHERE "status" = 'pending_customer';
