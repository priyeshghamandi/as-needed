# Shifts — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Shifts |
| Branch | `module/shifts` |
| Status | PENDING |
| Depends on | Auth (1), Facilities (5), Staffing Requests (6) |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Active implementation |
| READY_FOR_TEST | Awaiting Test Agent |
| FAILED_TEST | Defects found |
| PASSED | Complete |
| BLOCKED | Dependency wait |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| SHIFT-001 | `assertCanManageShifts` permission helper | PENDING | Code Agent | Reuse staffing write roles |
| SHIFT-002 | `lib/validations/shift.ts` Zod schema | PENDING | Code Agent | |
| SHIFT-003 | `lib/shifts/status-transitions.ts` | PENDING | Code Agent | ShiftStatusEnum |
| SHIFT-004 | `lib/shifts/fill-count.ts` | PENDING | Code Agent | Per shift assignment counts |
| SHIFT-005 | `lib/fulfillment/sync-request-shift.ts` | PENDING | Code Agent | Sync request + shift status |
| SHIFT-006 | `GET /api/shifts` with filters | PENDING | Code Agent | |
| SHIFT-007 | `GET /api/shifts/[id]` with assignments join | PENDING | Code Agent | |
| SHIFT-008 | `PATCH /api/shifts/[id]` | PENDING | Code Agent | |
| SHIFT-009 | `POST /api/shifts` secondary shift | PENDING | Code Agent | |
| SHIFT-010 | `updateShiftAction` | PENDING | Code Agent | |
| SHIFT-011 | `cancelShiftAction` | PENDING | Code Agent | Cascade assignments |
| SHIFT-012 | `createSecondaryShiftAction` | PENDING | Code Agent | |
| SHIFT-013 | `recomputeShiftStatusAction` | PENDING | Code Agent | For module 8 callback |
| SHIFT-014 | Route guard `app/(agency)/shifts/layout.tsx` | PENDING | Code Agent | |
| SHIFT-015 | `app/(agency)/shifts/page.tsx` list | PENDING | Code Agent | |
| SHIFT-016 | Shifts table component + badges | PENDING | Code Agent | |
| SHIFT-017 | List filters (status, facility, request, dates, unfilled) | PENDING | Code Agent | |
| SHIFT-018 | Empty state with link to new request | PENDING | Code Agent | |
| SHIFT-019 | `app/(agency)/shifts/[id]/page.tsx` detail | PENDING | Code Agent | |
| SHIFT-020 | Detail timing card | PENDING | Code Agent | |
| SHIFT-021 | Assignments summary table (read-only) | PENDING | Code Agent | |
| SHIFT-022 | Edit shift times dialog | PENDING | Code Agent | |
| SHIFT-023 | Cancel shift dialog | PENDING | Code Agent | |
| SHIFT-024 | **Match professionals** link to match route | PENDING | Code Agent | |
| SHIFT-025 | Urgent row highlight (<24h unfilled) | PENDING | Code Agent | |
| SHIFT-026 | Sidebar **Shifts** nav item | PENDING | Code Agent | |
| SHIFT-027 | Sync primary shift `required_count` when request updated | PENDING | Code Agent | Hook from module 6 |
| SHIFT-028 | Promote to `active`/`completed` on detail load (MVP) | PENDING | Code Agent | Time-based |
| SHIFT-029 | Loading/error states | PENDING | Code Agent | |
| SHIFT-030 | lint, typecheck, build | PENDING | Code Agent | |
| SHIFT-031 | READY_FOR_TEST handoff | PENDING | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| SHIFT-T001 | `lib/validations/shift.test.ts` | PENDING | Test Agent | SHIFT-UT-001–004 |
| SHIFT-T002 | `lib/shifts/status-transitions.test.ts` | PENDING | Test Agent | SHIFT-UT-010–012 |
| SHIFT-T003 | `lib/shifts/fill-count.test.ts` | PENDING | Test Agent | SHIFT-UT-020–022 |
| SHIFT-T004 | `app/api/shifts/route.test.ts` | PENDING | Test Agent | SHIFT-UT-030–032 |
| SHIFT-T005 | `e2e/shifts/shifts-access.spec.ts` | PENDING | Test Agent | SHIFT-E2E-001–004 |
| SHIFT-T006 | `e2e/shifts/shifts-list.spec.ts` | PENDING | Test Agent | SHIFT-E2E-010–013 |
| SHIFT-T007 | `e2e/shifts/shifts-detail.spec.ts` | PENDING | Test Agent | SHIFT-E2E-020–025 |
| SHIFT-T008 | `e2e/shifts/shifts-responsive.spec.ts` | PENDING | Test Agent | SHIFT-E2E-030–032 |
| SHIFT-T009 | SHIFT-AUTH + EDGE tests | PENDING | Test Agent | |
| SHIFT-T010 | axe + build health | PENDING | Test Agent | |
| SHIFT-T011 | PRD acceptance sign-off | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- List and detail routes functional
- ShiftStatusEnum enforced
- Linked request/facility/assignments display
- Write/read auth per PRD
- Tests and build pass

---

## 6. Code Agent Rules

- Branch `module/shifts` only
- No assignment invite logic (module 8)
- Use existing schema tables only

---

## 7. Test Agent Rules

- Mark FAILED_TEST with steps
- PASSED after SHIFT-T001–T011
