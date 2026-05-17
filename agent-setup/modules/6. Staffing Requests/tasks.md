# Staffing Requests — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Staffing Requests |
| Branch | `module/staffing-requests` |
| Status | PENDING |
| Depends on | Auth (1), Agency Onboarding (2), Workforce (4), Facilities (5) |

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
| REQ-001 | Add `assertCanManageStaffingRequests` and `canReadStaffingRequests` in `lib/auth/permissions.ts` | PENDING | Code Agent | owner, admin, coordinator write; +recruiter, compliance read |
| REQ-002 | Create `lib/validations/staffing-request.ts` Zod schema (create + draft + update) | PENDING | Code Agent | Map PRD fields |
| REQ-003 | Create `lib/staffing-requests/status-transitions.ts` | PENDING | Code Agent | `StaffingRequestStatusEnum` rules |
| REQ-004 | Create `lib/staffing-requests/fulfillment.ts` | PENDING | Code Agent | `getFulfillmentCounts(requestId)` |
| REQ-005 | Create `lib/staffing-requests/create-request.ts` service | PENDING | Code Agent | Transaction: request + primary shift |
| REQ-006 | Implement `GET /api/staffing-requests` with filters | PENDING | Code Agent | Agency-scoped query |
| REQ-007 | Implement `POST /api/staffing-requests` | PENDING | Code Agent | Write roles only |
| REQ-008 | Implement `GET /api/staffing-requests/[id]` | PENDING | Code Agent | Include facility, shifts, fulfillment |
| REQ-009 | Implement `PATCH /api/staffing-requests/[id]` | PENDING | Code Agent | Field update + status |
| REQ-010 | Implement `createStaffingRequestAction` | PENDING | Code Agent | Form → service |
| REQ-011 | Implement `updateStaffingRequestAction` | PENDING | Code Agent | |
| REQ-012 | Implement `transitionStaffingRequestStatusAction` | PENDING | Code Agent | Uses status-transitions |
| REQ-013 | Implement `publishStaffingRequestDraftAction` | PENDING | Code Agent | Creates shift if missing |
| REQ-014 | Add route guard `app/(agency)/staffing-requests/layout.tsx` | PENDING | Code Agent | Read roles |
| REQ-015 | Create `app/(agency)/staffing-requests/page.tsx` list | PENDING | Code Agent | Table + filters |
| REQ-016 | Create list table columns component | PENDING | Code Agent | Status/priority badges |
| REQ-017 | Create list filters component (status, facility, priority, coordinator, dates) | PENDING | Code Agent | URL search params |
| REQ-018 | Create empty state component | PENDING | Code Agent | CTA for write roles |
| REQ-019 | Create `app/(agency)/staffing-requests/new/page.tsx` | PENDING | Code Agent | Write guard |
| REQ-020 | Build create form with RHF + Zod | PENDING | Code Agent | All PRD fields |
| REQ-021 | Facility select (agency facilities only) | PENDING | Code Agent | Depends module 5 API |
| REQ-022 | Coordinator select (agency staff roles) | PENDING | Code Agent | Default session user |
| REQ-023 | Shift date/time combiner utility | PENDING | Code Agent | Agency timezone |
| REQ-024 | Facility unit prefix helper for `facility_instructions` | PENDING | Code Agent | `formatFacilityInstructions` |
| REQ-025 | Min experience append helper for `notes` | PENDING | Code Agent | |
| REQ-026 | Handle `?facilityId=` prefill on new page | PENDING | Code Agent | |
| REQ-027 | Create `app/(agency)/staffing-requests/[id]/page.tsx` detail | PENDING | Code Agent | |
| REQ-028 | Detail header with status/priority badges | PENDING | Code Agent | |
| REQ-029 | Fulfillment progress bar component | PENDING | Code Agent | Uses fulfillment.ts |
| REQ-030 | Facility summary card on detail | PENDING | Code Agent | Join `facilities` |
| REQ-031 | Linked shifts list section with links to `/shifts/[id]` | PENDING | Code Agent | |
| REQ-032 | Notes and credentials display | PENDING | Code Agent | |
| REQ-033 | Detail actions: Start matching, Cancel, Publish draft | PENDING | Code Agent | Write roles only |
| REQ-034 | Cancel confirmation dialog | PENDING | Code Agent | Cascade cancel shifts (call Shifts service) |
| REQ-035 | Add sidebar nav item **Staffing Requests** | PENDING | Code Agent | |
| REQ-036 | Add status badge color map shared constant | PENDING | Code Agent | `lib/ui/status-colors.ts` |
| REQ-037 | Server-side validate `facilityId` belongs to agency | PENDING | Code Agent | |
| REQ-038 | Set `created_by_user_id` on create | PENDING | Code Agent | |
| REQ-039 | Pagination on list (25/page) | PENDING | Code Agent | |
| REQ-040 | Loading and error states (list, new, detail) | PENDING | Code Agent | |
| REQ-041 | Toast messages for create/update/cancel | PENDING | Code Agent | |
| REQ-042 | Run `npm run lint`, `typecheck`, `build` | PENDING | Code Agent | |
| REQ-043 | Mark module READY_FOR_TEST | PENDING | Code Agent | Handoff notes |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| REQ-T001 | `lib/validations/staffing-request.test.ts` (REQ-UT-001–010) | PENDING | Test Agent | Vitest |
| REQ-T002 | `lib/staffing-requests/status-transitions.test.ts` (REQ-UT-020–024) | PENDING | Test Agent | |
| REQ-T003 | `lib/staffing-requests/fulfillment.test.ts` (REQ-UT-030–033) | PENDING | Test Agent | |
| REQ-T004 | `lib/auth/staffing-requests-permissions.test.ts` (REQ-UT-040–042) | PENDING | Test Agent | |
| REQ-T005 | `app/api/staffing-requests/route.test.ts` (REQ-UT-050–053) | PENDING | Test Agent | |
| REQ-T006 | `e2e/staffing-requests/staffing-requests-access.spec.ts` | PENDING | Test Agent | REQ-E2E-001–005 |
| REQ-T007 | `e2e/staffing-requests/staffing-requests-list.spec.ts` | PENDING | Test Agent | REQ-E2E-010–013 |
| REQ-T008 | `e2e/staffing-requests/staffing-requests-create.spec.ts` | PENDING | Test Agent | REQ-E2E-020–026 |
| REQ-T009 | `e2e/staffing-requests/staffing-requests-detail.spec.ts` | PENDING | Test Agent | REQ-E2E-030–033 |
| REQ-T010 | `e2e/staffing-requests/staffing-requests-responsive.spec.ts` | PENDING | Test Agent | REQ-E2E-040–042 |
| REQ-T011 | Authorization tests REQ-AUTH-01–05 | PENDING | Test Agent | |
| REQ-T012 | Edge cases REQ-EDGE-01–05 | PENDING | Test Agent | |
| REQ-T013 | axe on list + create (REQ-A11Y-05) | PENDING | Test Agent | |
| REQ-T014 | Run lint, typecheck, build, npm test | PENDING | Test Agent | |
| REQ-T015 | Verify PRD acceptance criteria | PENDING | Test Agent | Sign-off |

---

## 5. Acceptance Criteria

- List, create, and detail routes work per `prd.md`
- `StaffingRequestStatusEnum` transitions enforced
- Create persists request + primary shift
- Write roles: owner, admin, coordinator only
- Recruiter/compliance read-only
- Cross-agency access blocked
- All REQ-T* tests pass
- Build health passes

---

## 6. Code Agent Rules

- Read `prd.md` and `test.md` before starting
- Branch `module/staffing-requests` only
- Use `drizzle/schema.ts` enums and columns; no new tables
- Do not implement matching UI (module 8)
- Reuse Facilities and Auth helpers
- Update task status after each task

---

## 7. Test Agent Rules

- Tests and fixtures only in production paths where test files belong
- Mark FAILED_TEST with reproduction steps
- PASSED only after REQ-T001–T015 and acceptance criteria
