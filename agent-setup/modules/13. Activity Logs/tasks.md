# Activity Logs — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Activity Logs |
| Branch | `module/activity-logs` |
| Status | PENDING |
| Depends on | Auth; Operations Dashboard shell; entity detail routes from other modules |

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
| ACT-001 | Create `lib/activity/log-activity.ts` with Zod validation | PENDING | Code Agent | ACT-UT-001–005 |
| ACT-002 | Create `lib/activity/format-action.ts` label map + fallback | PENDING | Code Agent | Catalog in PRD |
| ACT-003 | Create `lib/activity/entity-route.ts` | PENDING | Code Agent | |
| ACT-004 | Implement `GET /api/activity-logs` | PENDING | Code Agent | Cursor pagination |
| ACT-005 | Add `assertAgencyActivityAccess` helper | PENDING | Code Agent | Deny provider/facility |
| ACT-006 | Build `ActivityLogTable` shared UI component | PENDING | Code Agent | Table + timeline variant |
| ACT-007 | Build `RecentActivityFeed` for `/dashboard` | PENDING | Code Agent | 15 default, load more |
| ACT-008 | Build `EntityActivityPanel` component | PENDING | Code Agent | Props: entityType, entityId |
| ACT-009 | Mount `EntityActivityPanel` on staffing request detail | PENDING | Code Agent | |
| ACT-010 | Mount panel on shift detail | PENDING | Code Agent | |
| ACT-011 | Mount panel on workforce detail | PENDING | Code Agent | |
| ACT-012 | Mount panel on facility detail | PENDING | Code Agent | |
| ACT-013 | Join actor user name in list queries | PENDING | Code Agent | Left join users |
| ACT-014 | Export `ActivityPayload` type for callers | PENDING | Code Agent | |
| ACT-015 | Document action catalog in `lib/activity/actions.ts` constants | PENDING | Code Agent | |
| ACT-016 | Add `logActivity` call to Settings save action (stub integration) | PENDING | Code Agent | `settings.updated` |
| ACT-017 | Add `logActivity` call to Workforce create (stub integration) | PENDING | Code Agent | |
| ACT-018 | Add empty and error states per PRD | PENDING | Code Agent | |
| ACT-019 | Hide dashboard feed for non-agency roles | PENDING | Code Agent | |
| ACT-020 | Run lint, typecheck, build | PENDING | Code Agent | |
| ACT-021 | Mark READY_FOR_TEST | PENDING | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| ACT-T001 | `lib/activity/log-activity.test.ts` | PENDING | Test Agent | ACT-UT-001–005 |
| ACT-T002 | `lib/activity/format-action.test.ts` | PENDING | Test Agent | ACT-UT-010–011 |
| ACT-T003 | `lib/activity/entity-route.test.ts` | PENDING | Test Agent | ACT-UT-020–021 |
| ACT-T004 | `app/api/activity-logs/route.test.ts` | PENDING | Test Agent | ACT-UT-030–032 |
| ACT-T005 | `e2e/activity/activity-access.spec.ts` | PENDING | Test Agent | ACT-E2E-001–003 |
| ACT-T006 | `e2e/activity/activity-dashboard.spec.ts` | PENDING | Test Agent | ACT-E2E-010–013 |
| ACT-T007 | `e2e/activity/activity-entity-panel.spec.ts` | PENDING | Test Agent | ACT-E2E-020–022 |
| ACT-T008 | `e2e/activity/activity-responsive.spec.ts` | PENDING | Test Agent | ACT-E2E-030 |
| ACT-T009 | ACT-AUTH and ACT-EDGE tests | PENDING | Test Agent | |
| ACT-T010 | axe on dashboard activity section | PENDING | Test Agent | |
| ACT-T011 | Build health commands | PENDING | Test Agent | |
| ACT-T012 | Verify PRD §14 | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- `logActivity` utility validated and server-only
- Dashboard **Recent activity** feed agency-scoped
- Entity panels on four detail page types
- Provider/facility cannot access activity API
- No cross-agency rows in UI or API
- Immutable logs (insert only)
- All ACT-T* pass; lint/typecheck/build pass

---

## 6. Code Agent Rules

- Branch `module/activity-logs` only
- Do not build `/activity-logs` full page route in MVP
- Do not implement notifications here
- Feature modules add `logActivity` calls in their own branches when merging; ship stubs where routes exist
- All reads filter `agency_id` from session
- Update task status after each task

---

## 7. Test Agent Rules

- Tests/fixtures only
- Mark FAILED_TEST with steps
- PASSED after ACT-T001–T012
