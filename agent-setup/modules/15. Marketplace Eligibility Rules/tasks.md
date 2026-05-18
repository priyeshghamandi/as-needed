# Marketplace Eligibility Rules — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Marketplace Eligibility Rules |
| Branch | `module/marketplace-eligibility-rules` |
| Status | READY_FOR_TEST |
| Depends on | Auth (1), Agency Onboarding (2), Workforce (4) |

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

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| MEL-001 | Migration: `professional_marketplace_visibility` table | PASSED | Code Agent | `0005_marketplace_eligibility.sql` |
| MEL-002 | Add `public_slug` to `healthcare_professionals` if missing | PASSED | Code Agent | Unique index |
| MEL-003 | Create `lib/marketplace/eligibility.ts` core API | PASSED | Code Agent | |
| MEL-004 | Create `lib/marketplace/geo-eligibility.ts` | PASSED | Code Agent | Reuse service area helpers |
| MEL-005 | Create `lib/marketplace/visibility-checklist.ts` | PASSED | Code Agent | |
| MEL-006 | Zod schema `marketplaceVisibilityPatchSchema` | PASSED | Code Agent | |
| MEL-007 | `PATCH /api/workforce/[id]/marketplace-visibility` | PASSED | Code Agent | GET + PATCH |
| MEL-008 | Bulk visibility API `POST /api/workforce/marketplace-visibility/bulk` | PASSED | Code Agent | Max 50 |
| MEL-009 | Workforce profile Marketplace tab UI | PASSED | Code Agent | `/workforce/[id]?tab=marketplace` |
| MEL-010 | Checklist component with pass/fail rows | PASSED | Code Agent | |
| MEL-011 | Visibility toggle + blocked reason banner | PASSED | Code Agent | |
| MEL-012 | Workforce list bulk action modal | PASSED | Code Agent | |
| MEL-013 | Activity log on visibility change | PASSED | Code Agent | |
| MEL-014 | Compliance hook: set `visibility_blocked_reason` | PASSED | Code Agent | `syncMarketplaceComplianceBlock` |
| MEL-015 | Export types `EligibleProfessional`, `CustomerLocationContext` | PASSED | Code Agent | `lib/marketplace/index.ts` |
| MEL-016 | Run lint, typecheck, build | PASSED | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| MEL-T001 | `lib/marketplace/eligibility.test.ts` | PASSED | Test Agent | 3 tests |
| MEL-T002 | `lib/marketplace/geo-eligibility.test.ts` | PASSED | Test Agent | |
| MEL-T003 | `lib/marketplace/visibility-checklist.test.ts` | PASSED | Test Agent | |
| MEL-T004 | `lib/auth/marketplace-visibility-permissions.test.ts` | PASSED | Test Agent | |
| MEL-T005 | `app/api/workforce/[id]/marketplace-visibility/route.test.ts` | PASSED | Test Agent | |
| MEL-T006 | `e2e/marketplace-eligibility/marketplace-visibility-access.spec.ts` | PASSED | Test Agent | Added; run with seed |
| MEL-T007 | `e2e/marketplace-eligibility/marketplace-visibility-toggle.spec.ts` | PASSED | Test Agent | Added |
| MEL-T008 | Responsive MEL-RESP-001 | PENDING | Test Agent | Manual |
| MEL-T009 | axe MEL-A11Y-001 | PENDING | Test Agent | |
| MEL-T010 | lint, typecheck, build, vitest, playwright | PASSED | Test Agent | Unit 14/14 |

---

## 5. Acceptance Criteria

- Shared eligibility API is the only public filter entry point for discovery modules
- Opt-in default OFF; geography fail-closed
- Agency authorization enforced
- All MEL-T* pass

---

## 6. Code Agent Rules

- Branch `module/marketplace-eligibility-rules` only
- Do not implement public pages in this module
- No exact availability in eligibility responses

---

## 7. Test Agent Rules

- Tests/fixtures only unless fixing test infrastructure
- Document seed data for geo scenarios (Denver vs Boston)
