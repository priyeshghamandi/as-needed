# Activity Logs — Test Plan

## Module

Activity Logs (`modules/13. Activity Logs`)

## 1. Test Strategy

### Objectives

Validate agency-scoped activity logging utility, dashboard feed, entity detail panels, API authorization, and integration contract for other modules' server actions.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Dashboard feed, entity panels, access denial |
| Unit / Integration | Vitest | `logActivity`, action formatter, entity route, API scoping |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

- Seed agency A and agency B with distinct `agency_id`
- Seed `activity_logs` rows via `seedActivityLogs(agencyId, items[])`
- Seed agency users: coordinator (agency A), provider (no agency feed access)

### File layout (required)

```
e2e/
  activity/
    activity-access.spec.ts
    activity-dashboard.spec.ts
    activity-entity-panel.spec.ts
    activity-responsive.spec.ts
lib/
  activity/
    log-activity.test.ts
    format-action.test.ts
    entity-route.test.ts
app/
  api/
    activity-logs/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/activity/activity-access.spec.ts`

#### ACT-E2E-001: Provider cannot load activity API

**Steps**

1. Log in as `provider`
2. `GET /api/activity-logs` with session cookie

**Expected**

- `403`

---

#### ACT-E2E-002: Unauthenticated blocked

**Steps**

1. Request `/api/activity-logs` without session

**Expected**

- `401`

---

#### ACT-E2E-003: Agency coordinator can access API

**Steps**

1. Log in as `staffing_coordinator` for agency A
2. `GET /api/activity-logs?limit=5`

**Expected**

- `200`
- Only agency A rows in payload

---

### 2.2 `e2e/activity/activity-dashboard.spec.ts`

#### ACT-E2E-010: Dashboard recent activity renders

**Steps**

1. Seed 3 activity rows for agency A
2. Log in as agency admin
3. Visit `/dashboard`

**Expected**

- **Recent activity** section visible
- 3 rows with action labels

---

#### ACT-E2E-011: Cross-agency rows hidden

**Steps**

1. Seed rows for agency A and B
2. Log in as user in agency A
3. Visit `/dashboard`

**Expected**

- Only agency A events visible

---

#### ACT-E2E-012: Empty state

**Steps**

1. Agency with zero logs
2. Visit `/dashboard`

**Expected**

- **No activity yet** copy

---

#### ACT-E2E-013: Load more

**Steps**

1. Seed 20 rows
2. Visit dashboard; click **Load more**

**Expected**

- More than 15 rows visible (up to cap 50)

---

### 2.3 `e2e/activity/activity-entity-panel.spec.ts`

#### ACT-E2E-020: Staffing request activity panel

**Steps**

1. Seed 2 logs for `entity_type=staffing_request`, same `entity_id`
2. Seed 1 log for different entity
3. Open `/staffing-requests/[id]`

**Expected**

- Panel shows exactly 2 matching rows

---

#### ACT-E2E-021: Shift activity panel

**Steps**

1. Seed shift-scoped logs
2. Open `/shifts/[id]`

**Expected**

- **Activity** section with shift events only

---

#### ACT-E2E-022: System actor display

**Steps**

1. Seed row with `actor_user_id` null
2. View on dashboard

**Expected**

- Actor shows **System**

---

### 2.4 `e2e/activity/activity-responsive.spec.ts`

#### ACT-E2E-030: Mobile timeline layout

**Steps**

1. Viewport 375px
2. Visit `/dashboard` with seeded activity

**Expected**

- No horizontal page scroll
- Timeline/stack visible

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/activity/log-activity.test.ts`

| ID | Case | Expected |
|---|---|---|
| ACT-UT-001 | Valid insert | Row created with all fields |
| ACT-UT-002 | Invalid action format | Zod error |
| ACT-UT-003 | Metadata > 4KB | Rejected |
| ACT-UT-004 | Missing agencyId | Zod error |
| ACT-UT-005 | Null actor allowed | Insert succeeds |

---

### 3.2 `lib/activity/format-action.test.ts`

| ID | Case | Expected |
|---|---|---|
| ACT-UT-010 | Known key `shift.created` | **Shift created** |
| ACT-UT-011 | Unknown key | Humanized fallback |

---

### 3.3 `lib/activity/entity-route.test.ts`

| ID | Case | Expected |
|---|---|---|
| ACT-UT-020 | `facility` entity | `/facilities/{id}` |
| ACT-UT-021 | Unknown type | No link / null |

---

### 3.4 `app/api/activity-logs/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| ACT-UT-030 | Filter entityType + entityId | Scoped rows |
| ACT-UT-031 | agency B user queries agency A entity | 403 |
| ACT-UT-032 | limit max enforced | Max 50 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| ACT-AUTH-01 | Provider dashboard has no recent activity section OR section hidden | No feed / 403 API |
| ACT-AUTH-02 | Facility user denied API | 403 |
| ACT-AUTH-03 | Coordinator cannot pass foreign agencyId in body to logActivity | N/A — utility not exposed; verify caller tests mock |

---

## 5. Required Validation Tests

Covered by ACT-UT-001–005.

| ID | Scenario | Expected |
|---|---|---|
| ACT-VAL-01 | Invalid entityId UUID | Zod error |

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| ACT-EDGE-01 | API failure on dashboard feed | Retry UI |
| ACT-EDGE-02 | Invalid cursor | First page returned |
| ACT-EDGE-03 | logActivity called twice same request | Two distinct rows (no dedupe MVP) |

---

## 7. Responsive Tests

Viewports: 375px, 768px, 1280px — ACT-E2E-030.

| ID | Check |
|---|---|
| ACT-RESP-01 | Load more button ≥ 44px height on mobile |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| ACT-A11Y-01 | Feed section has heading **Recent activity** | Playwright |
| ACT-A11Y-02 | Timeline items in ordered list (`ol`) | DOM |
| ACT-A11Y-03 | Entity links keyboard accessible | Keyboard |
| ACT-A11Y-04 | Expand metadata does not trap focus | Manual |

axe on `/dashboard` activity section: zero critical violations.

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Fallback:

```bash
npx vitest run lib/activity
npx playwright test e2e/activity
```

---

## 10. Pass Criteria

- All ACT-E2E tests pass
- All ACT-UT tests pass
- ACT-AUTH-01–02 pass
- No cross-agency leakage in API tests
- lint, typecheck, build pass
- PRD §14 acceptance criteria met

---

## Test Agent Handoff Checklist

- [ ] Seed activity rows per agency and entity
- [ ] Verify at least one feature module calls `logActivity` in integration test
- [ ] File FAILED_TEST with reproduction on `tasks.md`
