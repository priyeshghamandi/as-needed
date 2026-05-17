# Staffing Requests — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Staffing Requests |
| Branch | `module/staffing-requests` |
| Status | FAILED_TEST |
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
| REQ-001 | Add staffing requests access rules + assert helpers | PASSED | Code Agent | `staffing-requests-access-rules.ts` |
| REQ-002 | Create `lib/validations/staffing-request.ts` | PASSED | Code Agent | Create + draft + form schemas |
| REQ-003 | Create `lib/staffing-requests/status-transitions.ts` | PASSED | Code Agent | |
| REQ-004 | Create `lib/staffing-requests/fulfillment.ts` | PASSED | Code Agent | |
| REQ-005 | Create `lib/staffing-requests/create-request.ts` | PASSED | Code Agent | Transaction: request + shift |
| REQ-006 | Implement `GET /api/staffing-requests` | PASSED | Code Agent | Filters + pagination |
| REQ-007 | Implement `POST /api/staffing-requests` | PASSED | Code Agent | |
| REQ-008 | Implement `GET /api/staffing-requests/[id]` | PASSED | Code Agent | |
| REQ-009 | Implement `PATCH /api/staffing-requests/[id]` | PASSED | Code Agent | Update + status |
| REQ-010 | Implement `createStaffingRequestAction` | PASSED | Code Agent | |
| REQ-011 | Implement `updateStaffingRequestAction` | PASSED | Code Agent | Via PATCH API |
| REQ-012 | Implement `transitionStaffingRequestStatusAction` | PASSED | Code Agent | |
| REQ-013 | Implement `publishStaffingRequestDraftAction` | PASSED | Code Agent | |
| REQ-014 | Route guard via page context loaders | PASSED | Code Agent | `loadStaffingRequestsPageContext` |
| REQ-015 | Create `app/staffing-requests/page.tsx` list | PASSED | Code Agent | |
| REQ-016 | Create list table columns component | PASSED | Code Agent | `staffing-requests-list-client.tsx` |
| REQ-017 | Create list filters component | PASSED | Code Agent | URL search params |
| REQ-018 | Create empty state component | PASSED | Code Agent | |
| REQ-019 | Create `app/staffing-requests/new/page.tsx` | PASSED | Code Agent | |
| REQ-020 | Build create form with RHF + Zod | PASSED | Code Agent | |
| REQ-021 | Facility select (agency facilities only) | PASSED | Code Agent | |
| REQ-022 | Coordinator select | PASSED | Code Agent | Default session user |
| REQ-023 | Shift date/time combiner utility | PASSED | Code Agent | `shift-datetime.ts` |
| REQ-024 | Facility unit prefix helper | PASSED | Code Agent | `format-notes.ts` |
| REQ-025 | Min experience append helper | PASSED | Code Agent | |
| REQ-026 | Handle `?facilityId=` prefill | PASSED | Code Agent | |
| REQ-027 | Create `app/staffing-requests/[id]/page.tsx` | PASSED | Code Agent | |
| REQ-028 | Detail header with badges | PASSED | Code Agent | |
| REQ-029 | Fulfillment progress bar | PASSED | Code Agent | |
| REQ-030 | Facility summary card | PASSED | Code Agent | |
| REQ-031 | Linked shifts list + `/shifts/[id]` links | PASSED | Code Agent | |
| REQ-032 | Notes and credentials display | PASSED | Code Agent | |
| REQ-033 | Detail actions (matching, cancel, publish) | PASSED | Code Agent | |
| REQ-034 | Cancel confirmation dialog | PASSED | Code Agent | Cascades shift cancel |
| REQ-035 | Sidebar nav **Staffing Requests** | PASSED | Code Agent | `agency-shell.tsx` |
| REQ-036 | Status badge color map | PASSED | Code Agent | `lib/ui/status-colors.ts` |
| REQ-037 | Server-side validate `facilityId` agency scope | PASSED | Code Agent | |
| REQ-038 | Set `created_by_user_id` on create | PASSED | Code Agent | |
| REQ-039 | Pagination on list (25/page) | PASSED | Code Agent | |
| REQ-040 | Loading and error states | PASSED | Code Agent | Suspense + field errors |
| REQ-041 | Toast messages for actions | PASSED | Code Agent | Status banners |
| REQ-042 | Run lint, typecheck, build | PASSED | Code Agent | Build green |
| REQ-043 | Mark READY_FOR_TEST | PASSED | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| REQ-T001 | `lib/validations/staffing-request.test.ts` | PASSED | Test Agent | 11/11 |
| REQ-T002 | `lib/staffing-requests/status-transitions.test.ts` | PASSED | Test Agent | 5/5 |
| REQ-T003 | `lib/staffing-requests/fulfillment.test.ts` | PASSED | Test Agent | 4/4 |
| REQ-T004 | `lib/auth/staffing-requests-permissions.test.ts` | PASSED | Test Agent | 4/4 |
| REQ-T005 | `app/api/staffing-requests/route.test.ts` | PASSED | Test Agent | 4/4 |
| REQ-T006 | `e2e/staffing-requests/staffing-requests-access.spec.ts` | PASSED | Test Agent | 5/5 |
| REQ-T007 | `e2e/staffing-requests/staffing-requests-list.spec.ts` | PASSED | Test Agent | 4/4 |
| REQ-T008 | `e2e/staffing-requests/staffing-requests-create.spec.ts` | PASSED | Test Agent | 6/6 |
| REQ-T009 | `e2e/staffing-requests/staffing-requests-detail.spec.ts` | PASSED | Test Agent | 4/4 |
| REQ-T010 | `e2e/staffing-requests/staffing-requests-responsive.spec.ts` | PASSED | Test Agent | 3/3 |
| REQ-T011 | Authorization REQ-AUTH-01–05 | PASSED | Test Agent | Via rules + E2E |
| REQ-T012 | Edge cases REQ-EDGE-01–05 | PASSED | Test Agent | Covered in E2E/unit |
| REQ-T013 | axe list + create | FAILED_TEST | Test Agent | Not automated |
| REQ-T014 | lint, typecheck, build, vitest, playwright | PASSED | Test Agent | 28 unit + 22 E2E |
| REQ-T015 | PRD §14 sign-off | FAILED_TEST | Test Agent | Blocked on REQ-T013 |

---

## 5. Acceptance Criteria

- Routes `/staffing-requests`, `/staffing-requests/new`, `/staffing-requests/[id]` per PRD
- `StaffingRequestStatusEnum` transitions enforced
- Create persists request + primary shift
- Write roles: owner, admin, coordinator only
- Recruiter/compliance read-only
- Cross-agency access blocked
- Fulfillment progress reflects assignment counts
- All REQ-T* pass; build green

**Gaps:** automated axe (REQ-T013) not run.

---

## 6. Code Agent Rules

- Branch `module/staffing-requests` only
- Reuse Facilities and Auth helpers
- No matching UI (module 8)
- Scope by `agency_id`

---

## 7. Test Agent Rules

- Tests/fixtures only
- FAILED_TEST with reproduction
- PASSED after REQ-T001–T015
