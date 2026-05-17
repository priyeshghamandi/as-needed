# Workforce — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Workforce |
| Branch | `module/workforce` |
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
| WORK-001 | Migration: add `place_id` to `healthcare_professionals` (optional but recommended) | PASSED | Code Agent | Seed migration in dashboard E2E script |
| WORK-002 | Create `lib/validations/healthcare-professional.ts` Zod schema | PASSED | Code Agent | Re-exports + `workforceAddFormSchema` |
| WORK-003 | Create `lib/workforce/shift-readiness.ts` | PASSED | Code Agent | Pure function |
| WORK-004 | Create `lib/workforce/queries.ts` list + profile aggregations | PASSED | Code Agent | Joins shifts, credentials |
| WORK-005 | Create `lib/workforce/list-filters.ts` query builder | PASSED | Code Agent | URL params |
| WORK-006 | Implement `GET /api/workforce` | PASSED | Code Agent | Pagination 25 |
| WORK-007 | Implement `POST /api/workforce` | PASSED | Code Agent | Create + optional invite |
| WORK-008 | Implement `GET /api/workforce/[id]` | PASSED | Code Agent | Profile payload |
| WORK-009 | Implement `PATCH /api/workforce/[id]` | PASSED | Code Agent | Write roles |
| WORK-010 | Implement `POST /api/workforce/[id]/deactivate` | PASSED | Code Agent | |
| WORK-011 | Implement `POST /api/workforce/[id]/invite` | PASSED | Code Agent | Reuse Auth invite |
| WORK-012 | Add `assertCanManageWorkforce` and `assertCanViewWorkforce` helpers | PASSED | Code Agent | `workforce-access.ts` + rules |
| WORK-013 | Create `app/workforce/page.tsx` list page | PASSED | Code Agent | |
| WORK-014 | Build `WorkforceTable` with all PRD columns | PASSED | Code Agent | `workforce-list-client.tsx` |
| WORK-015 | Build `WorkforceFilters` (search, role, availability, compliance, active) | PASSED | Code Agent | URL sync |
| WORK-016 | Create `app/workforce/new/page.tsx` | PASSED | Code Agent | RHF form |
| WORK-017 | Implement `createHealthcareProfessionalAction` | PASSED | Code Agent | Service area server check |
| WORK-018 | Create `app/workforce/[id]/page.tsx` profile | PASSED | Code Agent | |
| WORK-019 | Build profile sections (contact, metrics, credentials summary, shifts) | PASSED | Code Agent | |
| WORK-020 | Build profile edit modal (limited fields) | PASSED | Code Agent | Write roles |
| WORK-021 | Build deactivate confirm dialog | PASSED | Code Agent | |
| WORK-022 | Wire **Send invite** / resend on profile | PASSED | Code Agent | |
| WORK-023 | Enforce route guard on `/workforce/new` | PASSED | Code Agent | Redirect + toast |
| WORK-024 | Mobile card layout for list `< md` | PASSED | Code Agent | |
| WORK-025 | Add sidebar nav item **Workforce** | PASSED | Code Agent | `agency-shell.tsx` Link nav |
| WORK-026 | Map `ProfessionalRoleEnum` to display labels | PASSED | Code Agent | `WORKFORCE_ROLE_LABELS` |
| WORK-027 | Run lint, typecheck, build | PASSED | Code Agent | Build green |
| WORK-028 | Mark READY_FOR_TEST | PASSED | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| WORK-T001 | `lib/validations/healthcare-professional.test.ts` (WORK-UT-001–007) | PASSED | Test Agent | 7/7 |
| WORK-T002 | `lib/workforce/shift-readiness.test.ts` (WORK-UT-010–012) | PASSED | Test Agent | 3/3 |
| WORK-T003 | `lib/workforce/list-filters.test.ts` (WORK-UT-020–021) | PASSED | Test Agent | 3/3 |
| WORK-T004 | `app/api/workforce/route.test.ts` (WORK-UT-030–033) | PASSED | Test Agent | 5/5 |
| WORK-T005 | `e2e/workforce/workforce-access.spec.ts` | PASSED | Test Agent | 4/4 |
| WORK-T006 | `e2e/workforce/workforce-list.spec.ts` | PASSED | Test Agent | 4/4 |
| WORK-T007 | `e2e/workforce/workforce-add.spec.ts` | PASSED | Test Agent | 5/5 |
| WORK-T008 | `e2e/workforce/workforce-profile.spec.ts` | PASSED | Test Agent | 4/4 |
| WORK-T009 | `e2e/workforce/workforce-auth-write.spec.ts` | PASSED | Test Agent | 2/2 |
| WORK-T010 | `e2e/workforce/workforce-responsive.spec.ts` | PASSED | Test Agent | 1/1 |
| WORK-T011 | Authorization WORK-AUTH-01–04 | PASSED | Test Agent | Via access rules + E2E |
| WORK-T012 | Edge cases WORK-EDGE-01–05 | PASSED | Test Agent | Covered in E2E/unit |
| WORK-T013 | axe list + add pages | FAILED_TEST | Test Agent | Not automated |
| WORK-T014 | lint, typecheck, build, vitest, playwright | PASSED | Test Agent | |
| WORK-T015 | PRD §14 sign-off | FAILED_TEST | Test Agent | Blocked on WORK-T013 |

---

## 5. Acceptance Criteria

- List, add, profile routes work per PRD
- Write roles: owner, admin, recruiter; coordinator/compliance read-only
- Service area validation client + server
- Provider invite optional and integrated with Auth
- Agency isolation enforced
- All WORK-T* pass; build health green

**Gaps:** automated axe (WORK-T013) not run; legacy `workforce-app.tsx` mock retained but unused.

---

## 6. Code Agent Rules

- Branch `module/workforce` only
- Reuse `LocationAutocomplete`, `isWithinServiceArea`, Auth invite actions
- Do not build availability calendar or compliance upload UI
- Scope all queries by `agency_id`
- Update task statuses as you go

---

## 7. Test Agent Rules

- Tests/fixtures only
- Mark FAILED_TEST with steps
- PASSED only after WORK-T001–T015 complete
