DO $$ BEGIN
  CREATE TYPE "fulfillment_review_decision" AS ENUM('confirmed', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "fulfillment_decline_reason" AS ENUM(
    'unavailable',
    'credentials',
    'scheduling_conflict',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD COLUMN IF NOT EXISTS "customer_approved_at" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fulfillment_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "staffing_request_id" uuid NOT NULL,
  "staffing_request_route_id" uuid NOT NULL,
  "agency_id" uuid NOT NULL,
  "healthcare_professional_id" uuid,
  "decision" "fulfillment_review_decision" NOT NULL,
  "decline_reason" "fulfillment_decline_reason",
  "decline_notes" text,
  "reviewed_by_user_id" uuid NOT NULL,
  "reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fulfillment_reviews" ADD CONSTRAINT "fulfillment_reviews_staffing_request_id_staffing_requests_id_fk" FOREIGN KEY ("staffing_request_id") REFERENCES "public"."staffing_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fulfillment_reviews" ADD CONSTRAINT "fulfillment_reviews_staffing_request_route_id_staffing_request_routes_id_fk" FOREIGN KEY ("staffing_request_route_id") REFERENCES "public"."staffing_request_routes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fulfillment_reviews" ADD CONSTRAINT "fulfillment_reviews_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fulfillment_reviews" ADD CONSTRAINT "fulfillment_reviews_healthcare_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("healthcare_professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fulfillment_reviews" ADD CONSTRAINT "fulfillment_reviews_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_fulfillment_reviews_request_agency_professional" ON "fulfillment_reviews" ("staffing_request_id", "agency_id", "healthcare_professional_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fulfillment_reviews_request" ON "fulfillment_reviews" ("staffing_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fulfillment_reviews_agency" ON "fulfillment_reviews" ("agency_id");
