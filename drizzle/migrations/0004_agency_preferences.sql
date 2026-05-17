ALTER TABLE "agencies" ADD COLUMN IF NOT EXISTS "agency_preferences" jsonb DEFAULT '{}' NOT NULL;
