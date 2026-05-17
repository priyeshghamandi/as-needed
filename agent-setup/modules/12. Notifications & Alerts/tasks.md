# Notifications & Alerts — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Notifications & Alerts |
| Branch | `module/notifications-alerts` |
| Status | PENDING |
| Depends on | Auth; benefits from Shifts, Staffing Requests, Compliance (integration callers) |

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
| NOTIF-001 | Create `lib/notifications/create-notification.ts` with Zod schema | PENDING | Code Agent | NOTIF-UT-001–006 |
| NOTIF-002 | Create `createNotificationsForUsers` batch helper | PENDING | Code Agent | Transactional insert |
| NOTIF-003 | Create `lib/notifications/unread-count.ts` | PENDING | Code Agent | Used by bell + page header |
| NOTIF-004 | Create `lib/notifications/entity-route.ts` resolver | PENDING | Code Agent | NOTIF-UT-020–022 |
| NOTIF-005 | Implement `GET /api/notifications` with filters + cursor | PENDING | Code Agent | User-scoped |
| NOTIF-006 | Implement `PATCH /api/notifications/[id]/read` | PENDING | Code Agent | Owner check |
| NOTIF-007 | Implement `POST /api/notifications/mark-all-read` | PENDING | Code Agent | Transaction |
| NOTIF-008 | Add `markNotificationReadAction` server action | PENDING | Code Agent | Revalidate tag |
| NOTIF-009 | Add `markAllNotificationsReadAction` | PENDING | Code Agent | |
| NOTIF-010 | Create `/notifications` page (RSC + client filters) | PENDING | Code Agent | Query string sync |
| NOTIF-011 | Build `NotificationTable` UI component | PENDING | Code Agent | Columns per PRD |
| NOTIF-012 | Add mobile card variant for notification list | PENDING | Code Agent | `< md` |
| NOTIF-013 | Implement empty states (all/unread/filter) | PENDING | Code Agent | |
| NOTIF-014 | Add `NotificationBell` to app header layouts | PENDING | Code Agent | Agency + portals |
| NOTIF-015 | Wire unread badge to `unread-count` + revalidation | PENDING | Code Agent | Tag `notifications` |
| NOTIF-016 | Create `NotificationToastHost` in root layout | PENDING | Code Agent | Sonner |
| NOTIF-017 | Implement client fetch for urgent/critical toasts on mount/focus | PENDING | Code Agent | 60s poll acceptable |
| NOTIF-018 | Create `CriticalAlertBanner` on `/dashboard` | PENDING | Code Agent | sessionStorage dismiss |
| NOTIF-019 | Add nav item **Notifications** to agency sidebar | PENDING | Code Agent | |
| NOTIF-020 | Protect `/notifications` in middleware (authenticated) | PENDING | Code Agent | |
| NOTIF-021 | Export `NotificationPayload` type for other modules | PENDING | Code Agent | `lib/notifications/types.ts` |
| NOTIF-022 | Add integration example in Shifts module stub OR dev seed script | PENDING | Code Agent | Decline → urgent |
| NOTIF-023 | Add priority badge component tokens (info/important/urgent/critical) | PENDING | Code Agent | Shared |
| NOTIF-024 | Implement pagination **Load more** | PENDING | Code Agent | 25 per page |
| NOTIF-025 | Add error boundary / retry on inbox load failure | PENDING | Code Agent | NOTIF-EDGE-05 |
| NOTIF-026 | Run `npm run lint`, `typecheck`, `build` | PENDING | Code Agent | |
| NOTIF-027 | Mark module READY_FOR_TEST | PENDING | Code Agent | Handoff notes |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| NOTIF-T001 | Create `lib/notifications/create-notification.test.ts` | PENDING | Test Agent | NOTIF-UT-001–006 |
| NOTIF-T002 | Create `lib/notifications/unread-count.test.ts` | PENDING | Test Agent | NOTIF-UT-010–012 |
| NOTIF-T003 | Create `lib/notifications/entity-route.test.ts` | PENDING | Test Agent | NOTIF-UT-020–022 |
| NOTIF-T004 | Create `app/api/notifications/route.test.ts` | PENDING | Test Agent | NOTIF-UT-030–032 |
| NOTIF-T005 | Create mark-all-read API test | PENDING | Test Agent | NOTIF-UT-040–041 |
| NOTIF-T006 | Create `e2e/notifications/notifications-access.spec.ts` | PENDING | Test Agent | NOTIF-E2E-001–003 |
| NOTIF-T007 | Create `e2e/notifications/notifications-inbox.spec.ts` | PENDING | Test Agent | NOTIF-E2E-010–013 |
| NOTIF-T008 | Create `e2e/notifications/notifications-read-state.spec.ts` | PENDING | Test Agent | NOTIF-E2E-020–023 |
| NOTIF-T009 | Create `e2e/notifications/notifications-toast-banner.spec.ts` | PENDING | Test Agent | NOTIF-E2E-030–032 |
| NOTIF-T010 | Create `e2e/notifications/notifications-responsive.spec.ts` | PENDING | Test Agent | NOTIF-E2E-040–041 |
| NOTIF-T011 | Run NOTIF-AUTH-01–03 | PENDING | Test Agent | |
| NOTIF-T012 | Run NOTIF-EDGE and axe NOTIF-A11Y-05 | PENDING | Test Agent | |
| NOTIF-T013 | Run `npm run lint`, `typecheck`, `build`, `npm test` | PENDING | Test Agent | |
| NOTIF-T014 | Verify PRD acceptance criteria §14 | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

Module complete when:

- `/notifications` shows user-scoped inbox with priority and read filters
- `NotificationTable` matches PRD columns; responsive cards on mobile
- Read/unread uses `read_at`; mark one and mark all work
- Header bell badge accurate
- `createNotification` utility available for other modules
- Toasts for `urgent`/`critical`; dashboard banner for `critical`
- No cross-user read or list leakage
- All NOTIF-T* tests pass; lint, typecheck, build pass

---

## 6. Code Agent Rules

- Read `prd.md` and `test.md` before starting
- Branch `module/notifications-alerts` only
- Do not add email/SMS/push
- Do not implement Activity Logs in this module
- Other modules must call `createNotification`, not raw inserts from UI
- All reads/writes filter `user_id` from session
- Update task statuses after each task
- Stop at READY_FOR_TEST

---

## 7. Test Agent Rules

- Tests and fixtures only in test pass
- Mark failures `FAILED_TEST` with steps
- Mark PASSED only after NOTIF-T001–T014 and acceptance criteria met
