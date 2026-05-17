# Facilities — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Facilities |
| Branch | `module/facilities` |
| Status | PENDING |
| Depends on | Auth, Agency Onboarding |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent actively implementing |
| READY_FOR_TEST | Implementation complete; awaiting Test Agent |
| FAILED_TEST | Test Agent found defects; needs fix |
| PASSED | Verified and approved |
| BLOCKED | Waiting on dependency or decision |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| FAC-001 | Create `lib/validations/facility.ts` Zod schema | PENDING | Code Agent | PRD §8.2 |
| FAC-002 | Create `lib/facilities/type-labels.ts` enum → label map | PENDING | Code Agent | §8.1.1 |
| FAC-003 | Create `lib/facilities/queries.ts` list + detail + counts | PENDING | Code Agent | staffing_requests join optional |
| FAC-004 | Create `lib/facilities/list-filters.ts` | PENDING | Code Agent | q, type, state |
| FAC-005 | Implement `GET /api/facilities` | PENDING | Code Agent | Pagination 25 |
| FAC-006 | Implement `POST /api/facilities` | PENDING | Code Agent | Create + invite |
| FAC-007 | Implement `GET /api/facilities/[id]` | PENDING | Code Agent | Detail payload |
| FAC-008 | Implement `PATCH /api/facilities/[id]` | PENDING | Code Agent | Write roles |
| FAC-009 | Implement `POST /api/facilities/[id]/invite` | PENDING | Code Agent | facility_user invite |
| FAC-010 | Add `assertCanManageFacilities` / `assertCanViewFacilities` | PENDING | Code Agent | PRD §10 |
| FAC-011 | Create `app/(agency)/facilities/page.tsx` | PENDING | Code Agent | |
| FAC-012 | Build `FacilitiesTable` with PRD columns | PENDING | Code Agent | |
| FAC-013 | Build `FacilitiesFilters` | PENDING | Code Agent | |
| FAC-014 | Create `app/(agency)/facilities/new/page.tsx` | PENDING | Code Agent | |
| FAC-015 | Implement `createFacilityAction` | PENDING | Code Agent | Service area server |
| FAC-016 | Create `app/(agency)/facilities/[id]/page.tsx` | PENDING | Code Agent | |
| FAC-017 | Build detail sections (contact, address, summary, requests, activity) | PENDING | Code Agent | |
| FAC-018 | Build edit modal (contact + notes + name/type) | PENDING | Code Agent | No location edit |
| FAC-019 | Wire invite/resend actions | PENDING | Code Agent | Auth pattern |
| FAC-020 | Route guard `/facilities/new` for read-only roles | PENDING | Code Agent | |
| FAC-021 | Portal access badge logic (invited/active/not) | PENDING | Code Agent | |
| FAC-022 | Mobile card layout list `< md` | PENDING | Code Agent | |
| FAC-023 | Sidebar nav **Facilities** | PENDING | Code Agent | |
| FAC-024 | Enforce `contact_email` unique per agency | PENDING | Code Agent | Case-insensitive |
| FAC-025 | Run lint, typecheck, build | PENDING | Code Agent | |
| FAC-026 | Mark READY_FOR_TEST | PENDING | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| FAC-T001 | `lib/validations/facility.test.ts` (FAC-UT-001–006) | PENDING | Test Agent | |
| FAC-T002 | `lib/facilities/type-labels.test.ts` (FAC-UT-010–011) | PENDING | Test Agent | |
| FAC-T003 | `app/api/facilities/route.test.ts` (FAC-UT-020–024) | PENDING | Test Agent | |
| FAC-T004 | `e2e/facilities/facilities-access.spec.ts` | PENDING | Test Agent | |
| FAC-T005 | `e2e/facilities/facilities-list.spec.ts` | PENDING | Test Agent | |
| FAC-T006 | `e2e/facilities/facilities-add.spec.ts` | PENDING | Test Agent | |
| FAC-T007 | `e2e/facilities/facilities-detail.spec.ts` | PENDING | Test Agent | |
| FAC-T008 | `e2e/facilities/facilities-auth-write.spec.ts` | PENDING | Test Agent | |
| FAC-T009 | `e2e/facilities/facilities-responsive.spec.ts` | PENDING | Test Agent | |
| FAC-T010 | Authorization FAC-AUTH-01–04 | PENDING | Test Agent | |
| FAC-T011 | Edge cases FAC-EDGE-01–05 | PENDING | Test Agent | |
| FAC-T012 | axe list + add | PENDING | Test Agent | |
| FAC-T013 | lint, typecheck, build, vitest, playwright | PENDING | Test Agent | |
| FAC-T014 | PRD §14 sign-off | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- Routes `/facilities`, `/facilities/new`, `/facilities/[id]` per PRD
- Write: owner, admin, coordinator; read: recruiter, compliance
- Facility types from `FacilityTypeEnum` only
- Service area + contact email rules enforced
- Facility user invite with `facility_id` on `user_invites`
- Agency isolation; provider/facility_user blocked from agency routes
- All FAC-T* pass; build green

---

## 6. Code Agent Rules

- Branch `module/facilities` only
- Reuse onboarding facility patterns and Auth invites
- No facility portal implementation
- Do not edit facility location in MVP PATCH
- Scope by `agency_id`

---

## 7. Test Agent Rules

- Tests/fixtures only
- FAILED_TEST with reproduction
- PASSED after FAC-T001–T014
