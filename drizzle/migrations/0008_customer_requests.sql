DO $$ BEGIN
  CREATE TYPE "staffing_request_source" AS ENUM('agency', 'marketplace_customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "staffing_request_fulfillment_status" AS ENUM(
    'pending_agency_review',
    'agency_confirmed',
    'agency_declined',
    'alternative_proposed',
    'customer_approved',
    'customer_rejected',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "staffing_request_selection_type" AS ENUM('customer_preferred');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "staffing_request_routing_status" AS ENUM('pending', 'routed', 'acknowledged', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD COLUMN IF NOT EXISTS "source" "staffing_request_source" DEFAULT 'agency' NOT NULL;
--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD COLUMN IF NOT EXISTS "fulfillment_status" "staffing_request_fulfillment_status";
--> statement-breakpoint
ALTER TABLE "staffing_requests" ADD COLUMN IF NOT EXISTS "customer_submitted_at" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staffing_request_selections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "staffing_request_id" uuid NOT NULL,
  "healthcare_professional_id" uuid NOT NULL,
  "agency_id" uuid NOT NULL,
  "selection_type" "staffing_request_selection_type" DEFAULT 'customer_preferred' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_selections" ADD CONSTRAINT "staffing_request_selections_staffing_request_id_staffing_requests_id_fk" FOREIGN KEY ("staffing_request_id") REFERENCES "public"."staffing_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_selections" ADD CONSTRAINT "staffing_request_selections_healthcare_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("healthcare_professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_selections" ADD CONSTRAINT "staffing_request_selections_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staffing_request_selections_request" ON "staffing_request_selections" ("staffing_request_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staffing_request_routes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "staffing_request_id" uuid NOT NULL,
  "agency_id" uuid NOT NULL,
  "routing_status" "staffing_request_routing_status" DEFAULT 'pending' NOT NULL,
  "routed_at" timestamp with time zone,
  "acknowledged_at" timestamp with time zone,
  "acknowledged_by_user_id" uuid,
  "response_due_at" timestamp with time zone,
  "closed_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_routes" ADD CONSTRAINT "staffing_request_routes_staffing_request_id_staffing_requests_id_fk" FOREIGN KEY ("staffing_request_id") REFERENCES "public"."staffing_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_routes" ADD CONSTRAINT "staffing_request_routes_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "staffing_request_routes" ADD CONSTRAINT "staffing_request_routes_acknowledged_by_user_id_users_id_fk" FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_staffing_request_routes_request_agency" ON "staffing_request_routes" ("staffing_request_id", "agency_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staffing_request_routes_agency" ON "staffing_request_routes" ("agency_id");
