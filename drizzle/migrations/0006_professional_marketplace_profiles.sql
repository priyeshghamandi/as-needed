CREATE TABLE IF NOT EXISTS "professional_marketplace_profiles" (
  "healthcare_professional_id" uuid PRIMARY KEY NOT NULL REFERENCES "healthcare_professionals"("id") ON DELETE CASCADE,
  "headline" varchar(80),
  "bio" text,
  "specialties" text[],
  "photo_url" text,
  "approximate_availability" varchar(32),
  "years_experience_bucket" varchar(8),
  "credentials_summary" text,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_marketplace_profiles_updated"
  ON "professional_marketplace_profiles" ("updated_at");
