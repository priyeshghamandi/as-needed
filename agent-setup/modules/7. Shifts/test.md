# Shifts — Test Plan

## Module

Shifts (`modules/7. Shifts`)

## 1. Test Strategy

### Objectives

Validate shift list, detail, status transitions, edits, cancel, secondary shift creation, linkage to staffing requests, authorization, and agency isolation.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Routes, list, detail, edit, cancel |
| Unit / Integration | Vitest | Status transitions, fill counts, validation |
| Build | npm scripts | lint, typecheck, build, test |

### File layout

```
e2e/
  shifts/
    shifts-access.spec.ts
    shifts-list.spec.ts
    shifts-detail.spec.ts
    shifts-responsive.spec.ts
lib/
  shifts/
    status-transitions.test.ts
    fill-count.test.ts
  validations/
    shift.test.ts
app/
  api/
    shifts/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `shifts-access.spec.ts`

#### SHIFT-E2E-001: Unauthenticated blocked from `/shifts`

**Expected:** Redirect `/login`.

---

#### SHIFT-E2E-002: Provider cannot access `/shifts`

**Expected:** Redirect to provider portal.

---

#### SHIFT-E2E-003: Coordinator can access list

**Expected:** Shifts heading visible.

---

#### SHIFT-E2E-004: Recruiter read-only on detail

**Expected:** No edit/cancel buttons.

---

### 2.2 `shifts-list.spec.ts`

#### SHIFT-E2E-010: List shows seeded shifts

**Expected:** Rows with facility, request link, status badge.

---

#### SHIFT-E2E-011: Filter by status `open`

**Expected:** Only open shifts in results.

---

#### SHIFT-E2E-012: Unfilled filter

**Expected:** Shows shifts where filled < required.

---

#### SHIFT-E2E-013: Row opens detail

**Expected:** URL `/shifts/[id]`.

---

### 2.3 `shifts-detail.spec.ts`

#### SHIFT-E2E-020: Detail shows request and facility links

**Expected:** Links to `/staffing-requests/[id]` and facility name.

---

#### SHIFT-E2E-021: Edit shift times

**Steps:** Change end time; save.

**Expected:** Updated times displayed; toast success.

---

#### SHIFT-E2E-022: Cancel shift

**Steps:** Cancel with confirmation.

**Expected:** Status `Cancelled`; banner shown.

---

#### SHIFT-E2E-023: Match professionals CTA

**Expected:** Navigates to `/staffing-requests/[requestId]/match`.

---

#### SHIFT-E2E-024: Cross-agency shift 404

**Steps:** Agency A user visits agency B shift id.

**Expected:** Not found / forbidden.

---

#### SHIFT-E2E-025: Add secondary shift

**Steps:** From request or shift detail, add shift with new window.

**Expected:** Second shift appears on request; list count +1.

---

### 2.4 `shifts-responsive.spec.ts`

#### SHIFT-E2E-030: Mobile list 375px

#### SHIFT-E2E-031: Mobile detail assignments section

#### SHIFT-E2E-032: Desktop 1280px table

---

## 3. Required Unit/Integration Tests

### `lib/validations/shift.test.ts`

| ID | Case | Expected |
|---|---|---|
| SHIFT-UT-001 | end before start | error |
| SHIFT-UT-002 | breakMinutes negative | error |
| SHIFT-UT-003 | required_count < 1 | error |
| SHIFT-UT-004 | valid payload | pass |

### `lib/shifts/status-transitions.test.ts`

| ID | Case | Expected |
|---|---|---|
| SHIFT-UT-010 | open → matching | allowed |
| SHIFT-UT-011 | confirmed → open | denied |
| SHIFT-UT-012 | cancelled → active | denied |

### `lib/shifts/fill-count.test.ts`

| ID | Case | Expected |
|---|---|---|
| SHIFT-UT-020 | 0 confirmed of 2 | partially_filled candidate |
| SHIFT-UT-021 | 2 confirmed of 2 | confirmed |
| SHIFT-UT-022 | declined not counted | unchanged fill |

### `app/api/shifts/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| SHIFT-UT-030 | GET no session | 401 |
| SHIFT-UT-031 | PATCH as recruiter | 403 |
| SHIFT-UT-032 | PATCH as coordinator | 200 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| SHIFT-AUTH-01 | Recruiter PATCH | 403 |
| SHIFT-AUTH-02 | Coordinator cancel | 200 |
| SHIFT-AUTH-03 | Cross-agency GET | 403/404 |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| SHIFT-VAL-01 | Time window | SHIFT-UT-001, SHIFT-E2E-021 |
| SHIFT-VAL-02 | required_count | SHIFT-UT-003 |

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| SHIFT-EDGE-01 | Edit cancelled shift | blocked |
| SHIFT-EDGE-02 | Cancel with active assignments | assignments cancelled |
| SHIFT-EDGE-03 | Empty shift list | empty state |

---

## 7. Responsive Tests

SHIFT-E2E-030–032; SHIFT-RESP-01 touch targets on cancel.

---

## 8. Accessibility Tests

| ID | Requirement |
|---|---|
| SHIFT-A11Y-01 | Edit dialog labeled fields |
| SHIFT-A11Y-02 | Status not color-only |
| SHIFT-A11Y-03 | axe list + detail zero critical |

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

---

## 10. Pass Criteria

- All SHIFT-E2E, SHIFT-UT, SHIFT-AUTH pass
- Build health exits 0
- PRD acceptance criteria met
- No cross-agency leakage
