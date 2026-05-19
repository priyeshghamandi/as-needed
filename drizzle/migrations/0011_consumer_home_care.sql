ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'consumer';
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "facility_site_kind" AS ENUM('organization', 'consumer_home');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "site_kind" "facility_site_kind" DEFAULT 'organization' NOT NULL;
--> statement-breakpoint
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "facilities" ADD CONSTRAINT "facilities_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "facilities" ALTER COLUMN "agency_id" DROP NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_care_sites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "care_site_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_care_sites" ADD CONSTRAINT "user_care_sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_care_sites" ADD CONSTRAINT "user_care_sites_care_site_id_facilities_id_fk" FOREIGN KEY ("care_site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_user_care_sites_user" ON "user_care_sites" ("user_id");
--> statement-breakpoint
ALTER TYPE "staffing_request_source" ADD VALUE IF NOT EXISTS 'marketplace_consumer';
