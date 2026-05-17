# Notifications & Alerts — Test Plan

## Module

Notifications & Alerts (`modules/12. Notifications & Alerts`)

## 1. Test Strategy

### Objectives

Validate user-scoped notification inbox behavior, read/unread mutations, priority filtering, header badge counts, toast/banner surfacing for urgent/critical items, and server-side `createNotification` contracts used by other modules.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | `/notifications` flows, bell badge, toasts, dashboard banner, auth |
| Unit / Integration | Vitest | `createNotification` validation, unread count helpers, entity route resolver, API auth |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

- Seed users: `agency_owner`, `staffing_coordinator`, `provider`, `facility_user` (distinct `user_id`)
- Seed notifications per user via test fixture `seedNotifications({ userId, items[] })`
- Use fixed UUIDs for notification rows in E2E for stable selectors

### File layout (required)

```
e2e/
  notifications/
    notifications-access.spec.ts
    notifications-inbox.spec.ts
    notifications-read-state.spec.ts
    notifications-toast-banner.spec.ts
    notifications-responsive.spec.ts
lib/
  notifications/
    create-notification.test.ts
    unread-count.test.ts
    entity-route.test.ts
app/
  api/
    notifications/
      route.test.ts
      mark-all-read.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/notifications/notifications-access.spec.ts`

#### NOTIF-E2E-001: Unauthenticated user blocked

**Steps**

1. Visit `/notifications` without session

**Expected**

- Redirect to `/login`
- `callbackUrl` includes `/notifications`

---

#### NOTIF-E2E-002: Agency coordinator can access inbox

**Steps**

1. Log in as `staffing_coordinator`
2. Visit `/notifications`

**Expected**

- Page title **Notifications** visible
- Table or card list renders

---

#### NOTIF-E2E-003: Provider can access inbox

**Steps**

1. Log in as `provider`
2. Visit `/notifications`

**Expected**

- Inbox loads in provider portal shell
- No agency-only routes required

---

### 2.2 `e2e/notifications/notifications-inbox.spec.ts`

#### NOTIF-E2E-010: Lists only current user's notifications

**Steps**

1. Seed 2 notifications for user A, 1 for user B
2. Log in as user A
3. Visit `/notifications`

**Expected**

- Exactly 2 rows visible
- User B notification not in DOM

---

#### NOTIF-E2E-011: Priority filter

**Steps**

1. Seed mixed priorities for user A
2. Apply **Critical** filter chip

**Expected**

- Only `critical` rows visible
- URL contains `priority=critical`

---

#### NOTIF-E2E-012: Unread filter

**Steps**

1. Seed 1 unread + 1 read
2. Select **Unread** filter

**Expected**

- Single unread row visible

---

#### NOTIF-E2E-013: Empty state

**Steps**

1. Log in as user with zero notifications
2. Visit `/notifications`

**Expected**

- Copy **No notifications yet** visible

---

### 2.3 `e2e/notifications/notifications-read-state.spec.ts`

#### NOTIF-E2E-020: Mark single notification read

**Steps**

1. Seed one unread notification
2. Click **Mark read** on row

**Expected**

- Row loses unread indicator
- Header badge decrements

---

#### NOTIF-E2E-021: Mark all read

**Steps**

1. Seed 3 unread notifications
2. Click **Mark all as read**

**Expected**

- All rows read
- Badge hidden or shows 0
- Button disabled

---

#### NOTIF-E2E-022: Row click marks read and navigates

**Steps**

1. Seed unread with `related_entity_type=staffing_request` and valid id
2. Click row title

**Expected**

- `read_at` set (verify via API or refetch)
- Navigates to staffing request detail or fallback

---

#### NOTIF-E2E-023: Cannot mark another user's notification via API

**Steps**

1. Log in as user A
2. `PATCH /api/notifications/{userBNotificationId}/read`

**Expected**

- `403` or `404`
- Row remains unread for user B

---

### 2.4 `e2e/notifications/notifications-toast-banner.spec.ts`

#### NOTIF-E2E-030: Urgent toast on layout mount

**Steps**

1. Seed unread `urgent` notification created in last hour
2. Log in and land on `/dashboard`

**Expected**

- Toast visible with notification title
- **View** action present

---

#### NOTIF-E2E-031: Critical dashboard banner

**Steps**

1. Seed unread `critical` notification
2. Visit `/dashboard` as agency user

**Expected**

- `CriticalAlertBanner` visible with title
- **Review** navigates to filtered `/notifications`

---

#### NOTIF-E2E-032: Info priority does not toast

**Steps**

1. Seed only `info` unread
2. Visit `/dashboard`

**Expected**

- No urgent/critical toast shown

---

### 2.5 `e2e/notifications/notifications-responsive.spec.ts`

#### NOTIF-E2E-040: Mobile card layout

**Steps**

1. Set viewport 375px
2. Visit `/notifications` with seeded rows

**Expected**

- No page horizontal scroll
- Cards stack; priority badge visible

---

#### NOTIF-E2E-041: Header bell badge on mobile

**Steps**

1. Seed 2 unread
2. Viewport 375px on any authenticated page

**Expected**

- Bell shows badge **2**

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/notifications/create-notification.test.ts`

| ID | Case | Expected |
|---|---|---|
| NOTIF-UT-001 | Valid minimal payload | Inserts row; returns id |
| NOTIF-UT-002 | Title > 120 chars | Zod error |
| NOTIF-UT-003 | Message > 2000 chars | Zod error |
| NOTIF-UT-004 | Default priority `info` | DB priority `info` |
| NOTIF-UT-005 | Invalid priority enum | Zod error |
| NOTIF-UT-006 | Trims title/message whitespace | Stored trimmed |

---

### 3.2 `lib/notifications/unread-count.test.ts`

| ID | Case | Expected |
|---|---|---|
| NOTIF-UT-010 | No rows | Count 0 |
| NOTIF-UT-011 | Mix read/unread | Count unread only |
| NOTIF-UT-012 | Excludes other user_id | Count scoped |

---

### 3.3 `lib/notifications/entity-route.test.ts`

| ID | Case | Expected |
|---|---|---|
| NOTIF-UT-020 | `staffing_request` + id | `/staffing-requests/{id}` |
| NOTIF-UT-021 | Unknown type | `/notifications` |
| NOTIF-UT-022 | Null related fields | `/notifications` |

---

### 3.4 `app/api/notifications/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| NOTIF-UT-030 | GET without session | 401 |
| NOTIF-UT-031 | GET with filter unread | Only unread rows |
| NOTIF-UT-032 | GET priority query | Filtered by priority |

---

### 3.5 `app/api/notifications/mark-all-read.test.ts`

| ID | Case | Expected |
|---|---|---|
| NOTIF-UT-040 | Marks all user rows | All `read_at` set |
| NOTIF-UT-041 | Does not affect other user | Other user rows unchanged |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| NOTIF-AUTH-01 | User A reads user B inbox via API | 403/empty |
| NOTIF-AUTH-02 | Unauthenticated mark read | 401 |
| NOTIF-AUTH-03 | `createNotification` not exposed as public route | 404/405 on POST to utility path |

---

## 5. Required Validation Tests

Covered by NOTIF-UT-001–006. Additional:

| ID | Scenario | Expected |
|---|---|---|
| NOTIF-VAL-01 | Empty title | Validation error |
| NOTIF-VAL-02 | Empty message | Validation error |

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| NOTIF-EDGE-01 | Mark read on already read id | 200 idempotent; no error toast |
| NOTIF-EDGE-02 | Mark all with zero unread | Button disabled; no-op |
| NOTIF-EDGE-03 | Load more at end of list | **Load more** hidden |
| NOTIF-EDGE-04 | 4 urgent toasts queued | Max 3 visible |
| NOTIF-EDGE-05 | API load failure | Error card + Retry |

Implement NOTIF-EDGE-01–02 in E2E; NOTIF-EDGE-04 in unit or component test.

---

## 7. Responsive Tests

Viewports: 375px, 768px, 1280px

| ID | Check |
|---|---|
| NOTIF-RESP-01 | Filters accessible on mobile (sheet or wrap) |
| NOTIF-RESP-02 | Table → cards below `md` |
| NOTIF-RESP-03 | Toast does not obscure mobile nav |

Covered by NOTIF-E2E-040–041.

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| NOTIF-A11Y-01 | Bell has `aria-label` with unread count | Playwright |
| NOTIF-A11Y-02 | Table headers associated | `getByRole('columnheader')` |
| NOTIF-A11Y-03 | Mark read buttons keyboard activatable | Keyboard test |
| NOTIF-A11Y-04 | Priority badges have text, not color-only | DOM inspection |
| NOTIF-A11Y-05 | Toast announced (`role=status` or live region) | axe |

Minimum gate: `@axe-core/playwright` on `/notifications` with seeded rows — zero critical violations.

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

If `npm test` missing:

```bash
npx vitest run lib/notifications
npx playwright test e2e/notifications
```

---

## 10. Pass Criteria

Module passes when:

- All NOTIF-E2E tests in `e2e/notifications/` pass
- All NOTIF-UT tests pass
- NOTIF-AUTH-01–03 pass
- Responsive smokes NOTIF-E2E-040–041 pass
- No critical axe violations on `/notifications`
- `npm run lint`, `typecheck`, `build` exit 0
- No cross-user notification leakage in API tests
- PRD section 14 acceptance criteria satisfied

---

## Test Agent Handoff Checklist

- [ ] Seed notification fixtures per role
- [ ] Document `revalidateTag('notifications')` usage for Code Agent
- [ ] File `FAILED_TEST` on `tasks.md` with reproduction steps
