ALTER TABLE "healthcare_professionals" ADD COLUMN IF NOT EXISTS "public_slug" varchar(160);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_professionals_public_slug" ON "healthcare_professionals" ("public_slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "professional_marketplace_visibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"healthcare_professional_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"is_marketplace_visible" boolean DEFAULT false NOT NULL,
	"visibility_blocked_reason" varchar(64),
	"marketplace_visible_at" timestamp with time zone,
	"marketplace_hidden_at" timestamp with time zone,
	"enabled_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "professional_marketplace_visibility" ADD CONSTRAINT "professional_marketplace_visibility_healthcare_professional_id_healthcare_professionals_id_fk" FOREIGN KEY ("healthcare_professional_id") REFERENCES "public"."healthcare_professionals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "professional_marketplace_visibility" ADD CONSTRAINT "professional_marketplace_visibility_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "professional_marketplace_visibility" ADD CONSTRAINT "professional_marketplace_visibility_enabled_by_user_id_users_id_fk" FOREIGN KEY ("enabled_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_marketplace_visibility_professional" ON "professional_marketplace_visibility" ("healthcare_professional_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_visibility_agency" ON "professional_marketplace_visibility" ("agency_id");
