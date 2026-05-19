# Category Directory — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Category Directory |
| Branch | `module/category-directory` |
| Status | COMPLETE |
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
| CAT-001 | Migration: `marketplace_categories` + seed slugs (`drizzle/migrations/0007_marketplace_categories.sql`) | COMPLETE | Code Agent |
| CAT-002 | `GET /api/marketplace/categories` | COMPLETE | Code Agent |
| CAT-003 | `GET /api/marketplace/categories/[slug]/professionals` | COMPLETE | Code Agent |
| CAT-004 | `lib/marketplace/categories.ts` slug resolver | COMPLETE | Code Agent |
| CAT-005 | `components/marketplace/location-context.tsx` + `lib/marketplace/location-cookie.ts` | COMPLETE | Code Agent |
| CAT-006 | Location modal via `LocationChip` + `LocationAutocomplete` (Google Places) | COMPLETE | Code Agent |
| CAT-007 | `app/marketplace/categories/page.tsx` index | COMPLETE | Code Agent |
| CAT-008 | `app/marketplace/categories/[slug]/page.tsx` landing | COMPLETE | Code Agent |
| CAT-009 | `MarketplaceProfessionalCard` on category listings | COMPLETE | Code Agent |
| CAT-010 | SEO `generateMetadata` per category | COMPLETE | Code Agent |
| CAT-011 | Pagination (24/page via `CATEGORY_PAGE_SIZE`, `CategoryPagination`) | COMPLETE | Code Agent |
| CAT-012 | Empty + no-location states | COMPLETE | Code Agent |
| CAT-013 | Wire eligibility `getEligibleProfessionals` (`lib/marketplace/category-listings.ts`) | COMPLETE | Code Agent |
| CAT-014 | Run lint, typecheck, build | COMPLETE | Code Agent |

---

## 4. Testing Tasks

| ID | Task | Status | Owner |
|---|---|---|---|
| CAT-T001 | `lib/marketplace/categories.test.ts` (category sort; slug resolver covered via integration) | COMPLETE | Test Agent |
| CAT-T002 | API route tests (`app/api/marketplace/categories/**/route.test.ts`) | COMPLETE | Test Agent |
| CAT-T003 | `e2e/marketplace/category-directory.spec.ts` (CAT-E2E-001–003) | COMPLETE | Test Agent |
| CAT-T004 | `e2e/marketplace/category-listings-geo.spec.ts` | PENDING | Test Agent |
| CAT-T005 | Responsive + axe on category pages (axe on marketplace home only today) | PENDING | Test Agent |
| CAT-T006 | lint, typecheck, build, test (`npm run test:unit:category-directory`, `test:e2e:category-directory`) | PENDING | Test Agent |

---

## 5. Acceptance Criteria

- [x] Public category routes per PRD (`/marketplace/categories`, `/marketplace/categories/[slug]`)
- [x] Location required for listings (cookie + `LocationRequiredBanner`; API 400 without location)
- [x] Eligibility-only queries (`getCategoryListings` → `getEligibleProfessionals`)
- [ ] All CAT-T* pass (CAT-T004–T006 pending)

## 8. Implementation Notes (codebase audit)

Verified in repo (docs were stale):

- Seed slugs: `registered-nurse`, `cna`, `lpn`, `emt`, `cnm`, `cns` (not short `rn` alias)
- Listing page size: 24 (`CATEGORY_PAGE_SIZE` in `lib/marketplace/categories.ts`)
- Consumed by Public Marketplace (19) for popular categories and nav

---

## 6. Code Agent Rules

- Branch `module/category-directory` only
- Reuse eligibility lib; no duplicate geo filters

---

## 7. Test Agent Rules

- Seed multi-agency professionals for listing isolation tests
