# Category Directory — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Category Directory |
| Branch | `module/category-directory` |
| Status | PENDING |
| Depends on | Marketplace Eligibility Rules (15) |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent actively implementing |
| READY_FOR_TEST | Implementation complete; awaiting Test Agent |
| FAILED_TEST | Test Agent found defects |
| PASSED | Verified and approved |
| BLOCKED | Waiting on dependency |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner |
|---|---|---|---|
| CAT-001 | Migration: `marketplace_categories` + seed slugs | PENDING | Code Agent |
| CAT-002 | `GET /api/marketplace/categories` | PENDING | Code Agent |
| CAT-003 | `GET /api/marketplace/categories/[slug]/professionals` | PENDING | Code Agent |
| CAT-004 | `lib/marketplace/categories.ts` slug resolver | PENDING | Code Agent |
| CAT-005 | `components/marketplace/location-context.tsx` + cookie helpers | PENDING | Code Agent |
| CAT-006 | Location modal (Google Places) | PENDING | Code Agent |
| CAT-007 | `app/marketplace/categories/page.tsx` index | PENDING | Code Agent |
| CAT-008 | `app/marketplace/categories/[slug]/page.tsx` landing | PENDING | Code Agent |
| CAT-009 | `ProfessionalCard` public component | PENDING | Code Agent |
| CAT-010 | SEO `generateMetadata` per category | PENDING | Code Agent |
| CAT-011 | Pagination (24/page) | PENDING | Code Agent |
| CAT-012 | Empty + no-location states | PENDING | Code Agent |
| CAT-013 | Wire eligibility `getEligibleProfessionals` | PENDING | Code Agent |
| CAT-014 | Run lint, typecheck, build | PENDING | Code Agent |

---

## 4. Testing Tasks

| ID | Task | Status | Owner |
|---|---|---|---|
| CAT-T001 | `lib/marketplace/categories.test.ts` | PENDING | Test Agent |
| CAT-T002 | API route tests | PENDING | Test Agent |
| CAT-T003 | `e2e/marketplace/category-directory.spec.ts` | PENDING | Test Agent |
| CAT-T004 | `e2e/marketplace/category-listings-geo.spec.ts` | PENDING | Test Agent |
| CAT-T005 | Responsive + axe | PENDING | Test Agent |
| CAT-T006 | lint, typecheck, build, test | PENDING | Test Agent |

---

## 5. Acceptance Criteria

- Public category routes per PRD
- Location required for listings
- Eligibility-only queries
- All CAT-T* pass

---

## 6. Code Agent Rules

- Branch `module/category-directory` only
- Reuse eligibility lib; no duplicate geo filters

---

## 7. Test Agent Rules

- Seed multi-agency professionals for listing isolation tests
