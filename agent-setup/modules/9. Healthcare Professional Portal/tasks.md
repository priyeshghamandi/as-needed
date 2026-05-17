# Healthcare Professional Portal — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Healthcare Professional Portal |
| Branch | `module/healthcare-professional-portal` |
| Status | PENDING |
| Depends on | Auth, Workforce, Shifts, Matching & Assignments |

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
| HPP-001 | Create `lib/provider/resolve-professional.ts` (user → HP row) | PENDING | Code Agent | Returns null if unlinked |
| HPP-002 | Create `lib/validations/availability-block.ts` Zod schema | PENDING | Code Agent | Per PRD HPP-044–048 |
| HPP-003 | Create `lib/provider/shift-overlap.ts` pure helper | PENDING | Code Agent | For accept guard |
| HPP-004 | Create `lib/provider/assignment-transitions.ts` | PENDING | Code Agent | Status guards |
| HPP-005 | Add `assertProviderRole` / `requireProviderContext` helper | PENDING | Code Agent | `lib/auth/provider-context.ts` |
| HPP-006 | Implement `GET /api/provider/shifts` with `tab` query | PENDING | Code Agent | HPP-010–013 |
| HPP-007 | Implement `GET /api/provider/shifts/[assignmentId]` | PENDING | Code Agent | Detail + credentials count |
| HPP-008 | Implement `acceptShiftAssignmentAction` | PENDING | Code Agent | HPP-020–026 |
| HPP-009 | Implement `declineShiftAssignmentAction` | PENDING | Code Agent | HPP-030–034 |
| HPP-010 | Implement `GET /api/provider/availability` | PENDING | Code Agent | Date range filter |
| HPP-011 | Implement `createAvailabilityBlockAction` | PENDING | Code Agent | Overlap check |
| HPP-012 | Implement `updateAvailabilityBlockAction` | PENDING | Code Agent | Own block only |
| HPP-013 | Implement `deleteAvailabilityBlockAction` | PENDING | Code Agent | |
| HPP-014 | Create `app/(provider)/my-shifts/page.tsx` layout shell | PENDING | Code Agent | Mobile-first |
| HPP-015 | Build Invites / Upcoming / Past tabs UI | PENDING | Code Agent | shadcn Tabs |
| HPP-016 | Build invite detail sheet + sticky Accept/Decline footer | PENDING | Code Agent | |
| HPP-017 | Build accept confirmation sheet with compliance line | PENDING | Code Agent | Read-only credential count |
| HPP-018 | Build decline modal with reason enum | PENDING | Code Agent | |
| HPP-019 | Create `app/(provider)/availability/page.tsx` | PENDING | Code Agent | |
| HPP-020 | Build availability list grouped by week | PENDING | Code Agent | Cards not table on mobile |
| HPP-021 | Build add/edit availability dialog (RHF + Zod) | PENDING | Code Agent | |
| HPP-022 | Add provider portal nav (My Shifts \| Availability) | PENDING | Code Agent | Shared layout |
| HPP-023 | Add not-linked empty state component | PENDING | Code Agent | HPP-003 PRD |
| HPP-024 | Wire loading skeletons and error toasts | PENDING | Code Agent | |
| HPP-025 | Optional: extend session JWT with `professionalId` | PENDING | Code Agent | HPP-060 |
| HPP-026 | Redirect `/rn` → `/my-shifts` if route exists | PENDING | Code Agent | Cleanup legacy path |
| HPP-027 | Verify `path-access.ts` includes portal routes | PENDING | Code Agent | Already partial |
| HPP-028 | Run `npm run lint`, `typecheck`, `build` | PENDING | Code Agent | |
| HPP-029 | Mark module READY_FOR_TEST | PENDING | Code Agent | Seed notes for QA |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| HPP-T001 | Seed e2e provider + assignments fixture | PENDING | Test Agent | |
| HPP-T002 | `availability-block.test.ts` (HPP-UT-001–006) | PENDING | Test Agent | |
| HPP-T003 | `shift-overlap.test.ts` (HPP-UT-010–012) | PENDING | Test Agent | |
| HPP-T004 | `assignment-transitions.test.ts` (HPP-UT-020–023) | PENDING | Test Agent | |
| HPP-T005 | `resolve-professional.test.ts` (HPP-UT-030–031) | PENDING | Test Agent | |
| HPP-T006 | API route tests (HPP-UT-040–043) | PENDING | Test Agent | |
| HPP-T007 | `provider-access.spec.ts` (HPP-E2E-001–005) | PENDING | Test Agent | |
| HPP-T008 | `provider-shifts.spec.ts` (HPP-E2E-010–014) | PENDING | Test Agent | |
| HPP-T009 | `provider-availability.spec.ts` (HPP-E2E-020–024) | PENDING | Test Agent | |
| HPP-T010 | `provider-responsive.spec.ts` (HPP-E2E-030–031) | PENDING | Test Agent | |
| HPP-T011 | Authorization tests HPP-AUTH-01–04 | PENDING | Test Agent | |
| HPP-T012 | Edge cases HPP-EDGE-01–05 | PENDING | Test Agent | |
| HPP-T013 | Accessibility HPP-A11Y-01–04 | PENDING | Test Agent | |
| HPP-T014 | Run lint, typecheck, build, npm test | PENDING | Test Agent | |
| HPP-T015 | PRD acceptance criteria sign-off | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- Provider redirect to `/my-shifts` works
- Accept/decline updates `shift_assignments` correctly with overlap guard
- Availability CRUD on `availability_blocks` with validation
- Only `provider` role accesses portal routes
- No cross-professional data leakage
- Mobile-first responsive at 375px
- All HPP-T* tests pass; lint/typecheck/build pass

---

## 6. Code Agent Rules

- Read `prd.md` and `test.md` before starting
- Branch: `module/healthcare-professional-portal` only
- Do not implement matching/invite creation here
- Do not implement credential upload (Compliance module)
- Derive `professionalId` server-side only
- Reuse `AssignmentStatusEnum`, `AvailabilityStatusEnum` from Drizzle schema
- Update task statuses in this file as work progresses

---

## 7. Test Agent Rules

- Read `test.md` before testing
- Tests/fixtures only — no production feature code
- Mark failures `FAILED_TEST` with reproduction steps
- Mark `PASSED` only after HPP-T001–T015 complete
