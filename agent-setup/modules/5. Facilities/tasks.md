# Facilities — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Facilities |
| Branch | `module/facilities` |
| Status | FAILED_TEST |
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
| FAC-001 | Create `lib/validations/facility.ts` Zod schema | PASSED | Code Agent | `facilityAddFormSchema` separate from full schema |
| FAC-002 | Create `lib/facilities/type-labels.ts` enum → label map | PASSED | Code Agent | |
| FAC-003 | Create `lib/facilities/queries.ts` list + detail + counts | PASSED | Code Agent | Portal access + open requests |
| FAC-004 | Create `lib/facilities/list-filters.ts` | PASSED | Code Agent | q, type, state |
| FAC-005 | Implement `GET /api/facilities` | PASSED | Code Agent | Pagination 25 |
| FAC-006 | Implement `POST /api/facilities` | PASSED | Code Agent | Create + invite |
| FAC-007 | Implement `GET /api/facilities/[id]` | PASSED | Code Agent | Detail payload |
| FAC-008 | Implement `PATCH /api/facilities/[id]` | PASSED | Code Agent | Write roles |
| FAC-009 | Implement `POST /api/facilities/[id]/invite` | PASSED | Code Agent | facility_user invite |
| FAC-010 | Add `assertCanManageFacilities` / `assertCanViewFacilities` | PASSED | Code Agent | `facilities-access.ts` + rules |
| FAC-011 | Create `app/facilities/page.tsx` | PASSED | Code Agent | |
| FAC-012 | Build facilities table with PRD columns | PASSED | Code Agent | `facilities-list-client.tsx` |
| FAC-013 | Build facilities filters | PASSED | Code Agent | URL sync |
| FAC-014 | Create `app/facilities/new/page.tsx` | PASSED | Code Agent | |
| FAC-015 | Implement `createFacilityAction` | PASSED | Code Agent | Invite after commit (FK fix) |
| FAC-016 | Create `app/facilities/[id]/page.tsx` | PASSED | Code Agent | |
| FAC-017 | Build detail sections (contact, address, summary, requests, activity) | PASSED | Code Agent | |
| FAC-018 | Build edit modal (contact + notes + name/type) | PASSED | Code Agent | No location edit |
| FAC-019 | Wire invite/resend actions | PASSED | Code Agent | |
| FAC-020 | Route guard `/facilities/new` for read-only roles | PASSED | Code Agent | `?error=forbidden` toast |
| FAC-021 | Portal access badge logic (invited/active/not) | PASSED | Code Agent | |
| FAC-022 | Mobile card layout list `< md` | PASSED | Code Agent | |
| FAC-023 | Sidebar nav **Facilities** | PASSED | Code Agent | `agency-shell.tsx` |
| FAC-024 | Enforce `contact_email` unique per agency | PASSED | Code Agent | Case-insensitive |
| FAC-025 | Run lint, typecheck, build | PASSED | Code Agent | Build green |
| FAC-026 | Mark READY_FOR_TEST | PASSED | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| FAC-T001 | `lib/validations/facility.test.ts` (FAC-UT-001–006) | PASSED | Test Agent | 6/6 |
| FAC-T002 | `lib/facilities/type-labels.test.ts` (FAC-UT-010–011) | PASSED | Test Agent | 2/2 |
| FAC-T003 | `app/api/facilities/route.test.ts` (FAC-UT-020–024) | PASSED | Test Agent | 4/4 + access 5 |
| FAC-T004 | `e2e/facilities/facilities-access.spec.ts` | PASSED | Test Agent | 4/4 |
| FAC-T005 | `e2e/facilities/facilities-list.spec.ts` | PASSED | Test Agent | 4/4 |
| FAC-T006 | `e2e/facilities/facilities-add.spec.ts` | PASSED | Test Agent | 4/4 |
| FAC-T007 | `e2e/facilities/facilities-detail.spec.ts` | PASSED | Test Agent | 4/4 |
| FAC-T008 | `e2e/facilities/facilities-auth-write.spec.ts` | PASSED | Test Agent | 3/3 |
| FAC-T009 | `e2e/facilities/facilities-responsive.spec.ts` | PASSED | Test Agent | 1/1 |
| FAC-T010 | Authorization FAC-AUTH-01–04 | PASSED | Test Agent | Via access rules + E2E |
| FAC-T011 | Edge cases FAC-EDGE-01–05 | PASSED | Test Agent | Covered in E2E/unit |
| FAC-T012 | axe list + add | FAILED_TEST | Test Agent | Not automated |
| FAC-T013 | lint, typecheck, build, vitest, playwright | PASSED | Test Agent | 17 unit + 20 E2E |
| FAC-T014 | PRD §14 sign-off | FAILED_TEST | Test Agent | Blocked on FAC-T012 |

---

## 5. Acceptance Criteria

- Routes `/facilities`, `/facilities/new`, `/facilities/[id]` per PRD
- Write: owner, admin, coordinator; read: recruiter, compliance
- Facility types from `FacilityTypeEnum` only
- Service area + contact email rules enforced
- Facility user invite with `facility_id` on `user_invites`
- Agency isolation; provider/facility_user blocked from agency routes
- All FAC-T* pass; build green

**Gaps:** automated axe (FAC-T012) not run.

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
- PASSED after FAC-T001–T014 complete
