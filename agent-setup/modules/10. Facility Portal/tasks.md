# Facility Portal — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Facility Portal |
| Branch | `module/facility-portal` |
| Status | READY_FOR_TEST |
| Depends on | Auth, Facilities, Staffing Requests (schema) |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent actively implementing |
| READY_FOR_TEST | Implementation complete; awaiting Test Agent |
| FAILED_TEST | Test Agent found defects; needs fix |
| PASSED | Verified and approved |
| BLOCKED | Waiting on dependency |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| FPORT-001 | Create `lib/facility/resolve-facility.ts` from accepted invite | READY_FOR_TEST | Code Agent | email + role match |
| FPORT-002 | Create `lib/validations/facility-staffing-request.ts` | READY_FOR_TEST | Code Agent | FPORT-027 |
| FPORT-003 | Create `lib/facility/fulfillment-timeline.ts` | READY_FOR_TEST | Code Agent | Pure step derivation |
| FPORT-004 | Add `requireFacilityContext` auth helper | READY_FOR_TEST | Code Agent | facilityId + agencyId |
| FPORT-005 | Implement `GET /api/facility/context` | READY_FOR_TEST | Code Agent | |
| FPORT-006 | Implement `GET /api/facility/dashboard` | READY_FOR_TEST | Code Agent | KPIs FPORT-010–013 |
| FPORT-007 | Implement `GET /api/facility/requests` | READY_FOR_TEST | Code Agent | Filters + pagination |
| FPORT-008 | Implement `GET /api/facility/requests/[id]` | READY_FOR_TEST | Code Agent | Timeline + assignments |
| FPORT-009 | Implement `createFacilityStaffingRequestAction` | READY_FOR_TEST | Code Agent | Request + shift FPORT-028 |
| FPORT-010 | Create `app/facility/layout.tsx` with nav | READY_FOR_TEST | Code Agent | Dashboard, Requests |
| FPORT-011 | Build `/facility/dashboard` page | READY_FOR_TEST | Code Agent | KPI cards + snippets |
| FPORT-012 | Build `/facility/requests` list page | READY_FOR_TEST | Code Agent | Table/cards responsive |
| FPORT-013 | Build `/facility/requests/new` form | READY_FOR_TEST | Code Agent | RHF + Zod |
| FPORT-014 | Build `/facility/requests/[id]` detail page | READY_FOR_TEST | Code Agent | Timeline + assigned staff |
| FPORT-015 | Build `FulfillmentTimeline` component | READY_FOR_TEST | Code Agent | |
| FPORT-016 | Build `AssignedProfessionalCard` read-only | READY_FOR_TEST | Code Agent | |
| FPORT-017 | No-facility-linked empty state | READY_FOR_TEST | Code Agent | |
| FPORT-018 | Submit button disable / idempotency FPORT-031 | READY_FOR_TEST | Code Agent | disable while submitting |
| FPORT-019 | Verify `path-access.ts` `/facility` prefix | READY_FOR_TEST | Code Agent | existing middleware |
| FPORT-020 | Run lint, typecheck, build | READY_FOR_TEST | Code Agent | build passes |
| FPORT-021 | Mark READY_FOR_TEST | READY_FOR_TEST | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| FPORT-T001 | Seed facility A/B users and requests | PENDING | Test Agent | |
| FPORT-T002 | `facility-staffing-request.test.ts` | PENDING | Test Agent | FPORT-UT-001–005 |
| FPORT-T003 | `resolve-facility.test.ts` | PENDING | Test Agent | |
| FPORT-T004 | `fulfillment-timeline.test.ts` | PENDING | Test Agent | |
| FPORT-T005 | API route tests FPORT-UT-030–032 | PENDING | Test Agent | |
| FPORT-T006 | `facility-access.spec.ts` | PENDING | Test Agent | FPORT-E2E-001–004 |
| FPORT-T007 | `facility-dashboard.spec.ts` | PENDING | Test Agent | FPORT-E2E-010–012 |
| FPORT-T008 | `facility-requests.spec.ts` | PENDING | Test Agent | FPORT-E2E-020–025 |
| FPORT-T009 | `facility-responsive.spec.ts` | PENDING | Test Agent | |
| FPORT-T010 | FPORT-AUTH + FPORT-EDGE tests | PENDING | Test Agent | |
| FPORT-T011 | FPORT-A11Y checks | PENDING | Test Agent | |
| FPORT-T012 | Build health + PRD sign-off | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- Facility user scoped to own `facility_id` for all reads/writes
- Create request + shift on submit
- Dashboard KPIs accurate
- Agency/provider cannot access facility routes
- Responsive list/form layouts
- All FPORT-T* pass

---

## 6. Code Agent Rules

- Branch `module/facility-portal` only
- Never accept `facilityId`/`agencyId` from untrusted client body
- Do not build agency staffing UI here
- Use `StaffingRequestStatusEnum`, `ProfessionalRoleEnum` from schema

---

## 7. Test Agent Rules

- Read `test.md` first; fixtures only in test code
- Mark `PASSED` after FPORT-T001–T012
