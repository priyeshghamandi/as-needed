# Matching & Assignments — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Matching & Assignments |
| Branch | `module/matching-assignments` |
| Status | FAILED_TEST |
| Depends on | Auth (1), Workforce (4), Facilities (5), Staffing Requests (6), Shifts (7) |

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
| MATCH-001 | `assertCanManageAssignments` permission helper | PASSED | Code Agent | owner, admin, coordinator |
| MATCH-002 | `assertProviderOwnsAssignment` helper | PASSED | Code Agent | userId ↔ professional.userId |
| MATCH-003 | `lib/assignments/status-transitions.ts` | PASSED | Code Agent | AssignmentStatusEnum |
| MATCH-004 | `lib/assignments/fulfillment-sync.ts` | PASSED | Code Agent | `syncFulfillmentForRequest` |
| MATCH-005 | `lib/matching/filters.ts` pure filter functions | PASSED | Code Agent | |
| MATCH-006 | `lib/matching/candidate-query.ts` Drizzle query builder | PASSED | Code Agent | Agency scoped |
| MATCH-007 | `lib/matching/distance.ts` facility ↔ professional miles | PASSED | Code Agent | Reuse service area utils |
| MATCH-008 | `lib/matching/credential-match.ts` required vs verified | PASSED | Code Agent | Warning flags |
| MATCH-009 | `GET /api/staffing-requests/[id]/matches` | PASSED | Code Agent | Query params for filters |
| MATCH-010 | `GET /api/staffing-requests/[id]/assignments` | PASSED | Code Agent | |
| MATCH-011 | `POST /api/shifts/[id]/assignments` | PASSED | Code Agent | Single invite |
| MATCH-012 | `POST /api/shifts/[id]/assignments/bulk` | PASSED | Code Agent | |
| MATCH-013 | `PATCH /api/shift-assignments/[id]` | PASSED | Code Agent | Status transitions |
| MATCH-014 | `inviteProfessionalToShiftAction` | PASSED | Code Agent | |
| MATCH-015 | `bulkInviteProfessionalsAction` | PASSED | Code Agent | |
| MATCH-016 | `cancelShiftAssignmentAction` | PASSED | Code Agent | |
| MATCH-017 | `confirmShiftAssignmentAction` | PASSED | Code Agent | |
| MATCH-018 | `respondToShiftAssignmentAction` | PASSED | Code Agent | Provider accept/decline |
| MATCH-019 | `getMatchCandidatesAction` | PASSED | Code Agent | Shared by page + embedded |
| MATCH-020 | `app/staffing-requests/[id]/match/page.tsx` | PASSED | Code Agent | |
| MATCH-021 | Match page header + fulfillment summary | PASSED | Code Agent | |
| MATCH-022 | Shift selector component (multi-shift requests) | PASSED | Code Agent | `?shiftId=` |
| MATCH-023 | Match filters toolbar | PASSED | Code Agent | |
| MATCH-024 | Candidate table component | PASSED | Code Agent | |
| MATCH-025 | Bulk select + invite bar | PASSED | Code Agent | |
| MATCH-026 | Existing assignments panel | PASSED | Code Agent | |
| MATCH-027 | Invite / cancel / confirm row actions | PASSED | Code Agent | |
| MATCH-028 | Compliance warning tooltip component | PASSED | Code Agent | |
| MATCH-029 | Embedded `SuggestedMatchesPanel` on request detail | PASSED | Code Agent | limit 5 |
| MATCH-030 | Wire **Match professionals** CTA from request + shift detail | PASSED | Code Agent | |
| MATCH-031 | Enforce slot limit before invite | PASSED | Code Agent | required - filled |
| MATCH-032 | Handle unique constraint duplicate invite | PASSED | Code Agent | 409 friendly message |
| MATCH-033 | Set `invited_by_user_id`, `invited_at` on create | PASSED | Code Agent | |
| MATCH-034 | Set `responded_at` on accept/decline | PASSED | Code Agent | |
| MATCH-035 | Set `confirmed_at` on confirm | PASSED | Code Agent | |
| MATCH-036 | Auto-confirm on accept config (default true) | PASSED | Code Agent | env or constant |
| MATCH-037 | Call `recomputeShiftStatus` + request sync after mutations | PASSED | Code Agent | Uses module 7 helper |
| MATCH-038 | Mark request `at_risk` rule when unfilled <24h | PASSED | Code Agent | |
| MATCH-039 | Read-only match view for recruiter/compliance | PASSED | Code Agent | |
| MATCH-040 | Loading, empty, error states | PASSED | Code Agent | |
| MATCH-041 | Toasts for invite/bulk/cancel | PASSED | Code Agent | |
| MATCH-042 | lint, typecheck, build | PASSED | Code Agent | |
| MATCH-043 | READY_FOR_TEST handoff | PASSED | Code Agent | Note provider portal dependency |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| MATCH-T001 | `lib/matching/filters.test.ts` | PASSED | Test Agent | MATCH-UT-001–004 |
| MATCH-T002 | `lib/matching/candidate-query.test.ts` | PASSED | Test Agent | MATCH-UT-010–011 |
| MATCH-T003 | `lib/assignments/status-transitions.test.ts` | PASSED | Test Agent | MATCH-UT-020–024 |
| MATCH-T004 | `lib/assignments/fulfillment-sync.test.ts` | PASSED | Test Agent | MATCH-UT-030–032 |
| MATCH-T005 | `lib/auth/assignment-permissions.test.ts` | PASSED | Test Agent | MATCH-UT-040–042 |
| MATCH-T006 | `app/api/shift-assignments/route.test.ts` | PASSED | Test Agent | MATCH-UT-050–053 |
| MATCH-T007 | `e2e/matching/matching-access.spec.ts` | PASSED | Test Agent | MATCH-E2E-001–004 |
| MATCH-T008 | `e2e/matching/matching-invite.spec.ts` | PASSED | Test Agent | MATCH-E2E-010–016 |
| MATCH-T009 | `e2e/matching/matching-z-assignment-response.spec.ts` | PASSED | Test Agent | MATCH-E2E-020–023 |
| MATCH-T010 | `e2e/matching/matching-embedded.spec.ts` | PASSED | Test Agent | MATCH-E2E-030–031 |
| MATCH-T011 | `e2e/matching/matching-responsive.spec.ts` | PASSED | Test Agent | MATCH-E2E-040–041 |
| MATCH-T012 | MATCH-AUTH + EDGE tests | PASSED | Test Agent | |
| MATCH-T013 | axe + build health | FAILED_TEST | Test Agent | MATCH-A11Y not automated |
| MATCH-T014 | PRD acceptance sign-off | PASSED | Test Agent | |

---

## 5. Acceptance Criteria

- Match route and invite flows work
- AssignmentStatusEnum transitions enforced
- Accept/decline updates fulfillment and request/shift status
- Duplicate invites prevented
- Authorization matrix enforced
- All MATCH-T* tests pass

---

## 6. Code Agent Rules

- Branch `module/matching-assignments` only
- Do not build full provider portal (module 9) — expose `respondToShiftAssignmentAction` for portal
- Use `shift_assignments` unique index
- Call fulfillment sync after every assignment mutation

---

## 7. Test Agent Rules

- Provider E2E may use API directly if portal not merged
- Mark FAILED_TEST with reproduction steps
- PASSED after MATCH-T001–T014
