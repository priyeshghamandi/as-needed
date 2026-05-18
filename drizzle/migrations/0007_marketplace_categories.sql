CREATE TABLE IF NOT EXISTS "marketplace_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(80) NOT NULL,
  "name" varchar(160) NOT NULL,
  "description" text,
  "role_filter" varchar(32) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "seo_title" varchar(160),
  "seo_description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "ux_marketplace_categories_slug"
  ON "marketplace_categories" ("slug");

CREATE INDEX IF NOT EXISTS "idx_marketplace_categories_active_sort"
  ON "marketplace_categories" ("is_active", "sort_order");

INSERT INTO "marketplace_categories" (
  "slug", "name", "description", "role_filter", "sort_order", "seo_title", "seo_description"
) VALUES
  (
    'registered-nurse',
    'Registered Nurse (RN)',
    'Browse registered nurses available in your facility area. Staffing requests are fulfilled by licensed agency coordinators.',
    'rn',
    1,
    'Registered Nurse (RN) — Healthcare Staffing Marketplace',
    'Find registered nurses near your facility. Request staffing fulfilled by licensed agencies.'
  ),
  (
    'cna',
    'Certified Nursing Assistant (CNA)',
    'Certified nursing assistants supporting patient care in hospitals, SNFs, and clinics.',
    'cna',
    2,
    'Certified Nursing Assistant (CNA) — Marketplace',
    'Discover CNAs available in your area for agency-coordinated staffing.'
  ),
  (
    'lpn',
    'Licensed Practical Nurse (LPN)',
    'Licensed practical nurses for skilled nursing and acute care coverage.',
    'lpn',
    3,
    'Licensed Practical Nurse (LPN) — Marketplace',
    'Browse LPN professionals available near your facility.'
  ),
  (
    'emt',
    'Emergency Medical Technician (EMT)',
    'Emergency medical technicians for EMS-adjacent and facility support roles.',
    'emt',
    4,
    'Emergency Medical Technician (EMT) — Marketplace',
    'Find EMT professionals in your service area.'
  ),
  (
    'cnm',
    'Certified Nurse Midwife (CNM)',
    'Certified nurse midwives for women''s health and labor & delivery support.',
    'cnm',
    5,
    'Certified Nurse Midwife (CNM) — Marketplace',
    'Discover CNM professionals available in your area.'
  ),
  (
    'cns',
    'Clinical Nurse Specialist (CNS)',
    'Clinical nurse specialists for advanced practice and specialty unit coverage.',
    'cns',
    6,
    'Clinical Nurse Specialist (CNS) — Marketplace',
    'Browse CNS professionals near your facility.'
  )
ON CONFLICT ("slug") DO NOTHING;
