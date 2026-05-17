ALTER TABLE "agencies" ADD COLUMN IF NOT EXISTS "agency_type" varchar(32);
ALTER TABLE "agencies" ADD COLUMN IF NOT EXISTS "workforce_size" varchar(32);
