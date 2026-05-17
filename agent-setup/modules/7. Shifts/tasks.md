# Shifts — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Shifts |
| Branch | `module/shifts` |
| Status | FAILED_TEST |
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
| SHIFT-001 | `assertCanManageShifts` permission helper | PASSED | Code Agent | Reuse staffing write roles |
| SHIFT-002 | `lib/validations/shift.ts` Zod schema | PASSED | Code Agent | |
| SHIFT-003 | `lib/shifts/status-transitions.ts` | PASSED | Code Agent | ShiftStatusEnum |
| SHIFT-004 | `lib/shifts/fill-count.ts` | PASSED | Code Agent | Per shift assignment counts |
| SHIFT-005 | `lib/shifts/sync-request-shift.ts` | PASSED | Code Agent | Sync request + shift status |
| SHIFT-006 | `GET /api/shifts` with filters | PASSED | Code Agent | |
| SHIFT-007 | `GET /api/shifts/[id]` with assignments join | PASSED | Code Agent | |
| SHIFT-008 | `PATCH /api/shifts/[id]` | PASSED | Code Agent | |
| SHIFT-009 | `POST /api/shifts` secondary shift | PASSED | Code Agent | |
| SHIFT-010 | `updateShiftAction` | PASSED | Code Agent | |
| SHIFT-011 | `cancelShiftAction` | PASSED | Code Agent | Cascade assignments |
| SHIFT-012 | `createSecondaryShiftAction` | PASSED | Code Agent | |
| SHIFT-013 | `recomputeShiftStatusAction` | PASSED | Code Agent | For module 8 callback |
| SHIFT-014 | Route guard via `loadShiftsPageContext` | PASSED | Code Agent | + `/shifts` in path-access |
| SHIFT-015 | `app/shifts/page.tsx` list | PASSED | Code Agent | |
| SHIFT-016 | Shifts table component + badges | PASSED | Code Agent | `shifts-list-client.tsx` |
| SHIFT-017 | List filters (status, facility, request, dates, unfilled) | PASSED | Code Agent | Status + unfilled MVP |
| SHIFT-018 | Empty state with link to new request | PASSED | Code Agent | |
| SHIFT-019 | `app/shifts/[id]/page.tsx` detail | PASSED | Code Agent | |
| SHIFT-020 | Detail timing card | PASSED | Code Agent | |
| SHIFT-021 | Assignments summary table (read-only) | PASSED | Code Agent | |
| SHIFT-022 | Edit shift times dialog | PASSED | Code Agent | |
| SHIFT-023 | Cancel shift dialog | PASSED | Code Agent | |
| SHIFT-024 | **Match professionals** link to match route | PASSED | Code Agent | |
| SHIFT-025 | Urgent row highlight (<24h unfilled) | PASSED | Code Agent | |
| SHIFT-026 | Sidebar **Shifts** nav item | PASSED | Code Agent | Pre-existing in agency-shell |
| SHIFT-027 | Sync primary shift `required_count` when request updated | PASSED | Code Agent | PATCH staffing-requests hook |
| SHIFT-028 | Promote to `active`/`completed` on detail load (MVP) | PASSED | Code Agent | `maybePromoteShiftTimeStatus` |
| SHIFT-029 | Loading/error states | PASSED | Code Agent | Suspense + dialogs |
| SHIFT-030 | lint, typecheck, build | PASSED | Code Agent | |
| SHIFT-031 | READY_FOR_TEST handoff | PASSED | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| SHIFT-T001 | `lib/validations/shift.test.ts` | PASSED | Test Agent | 4/4 |
| SHIFT-T002 | `lib/shifts/status-transitions.test.ts` | PASSED | Test Agent | 3/3 |
| SHIFT-T003 | `lib/shifts/fill-count.test.ts` | PASSED | Test Agent | 3/3 |
| SHIFT-T004 | `app/api/shifts/route.test.ts` | PASSED | Test Agent | 3/3 |
| SHIFT-T005 | `e2e/shifts/shifts-access.spec.ts` | PASSED | Test Agent | 4/4 |
| SHIFT-T006 | `e2e/shifts/shifts-list.spec.ts` | PASSED | Test Agent | 4/4 |
| SHIFT-T007 | `e2e/shifts/shifts-detail.spec.ts` | PASSED | Test Agent | 6/6 |
| SHIFT-T008 | `e2e/shifts/shifts-responsive.spec.ts` | PASSED | Test Agent | 3/3 |
| SHIFT-T009 | SHIFT-AUTH + EDGE tests | PASSED | Test Agent | Via unit + E2E |
| SHIFT-T010 | axe + build health | FAILED_TEST | Test Agent | SHIFT-A11Y-03 not automated |
| SHIFT-T011 | PRD acceptance sign-off | FAILED_TEST | Test Agent | Blocked on SHIFT-T010 |

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
