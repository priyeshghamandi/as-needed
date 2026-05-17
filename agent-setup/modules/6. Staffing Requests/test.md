# Staffing Requests — Test Plan

## Module

Staffing Requests (`modules/6. Staffing Requests`)

## 1. Test Strategy

### Objectives

Validate staffing request list, create, detail, draft publish, status transitions, fulfillment display, agency isolation, and role-based authorization using Playwright E2E and Vitest unit/integration tests.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Routes, create flow, list filters, detail actions, auth |
| Unit / Integration | Vitest | Zod schemas, status transitions, fulfillment math, API auth |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

- Seed agency A with 2 facilities, coordinator user, recruiter user (read-only)
- Seed agency B with 1 request (cross-agency tests)
- Seed healthcare professionals not required for module 6 core tests

### File layout (required)

```
e2e/
  staffing-requests/
    staffing-requests-access.spec.ts
    staffing-requests-list.spec.ts
    staffing-requests-create.spec.ts
    staffing-requests-detail.spec.ts
    staffing-requests-responsive.spec.ts
lib/
  validations/
    staffing-request.test.ts
  staffing-requests/
    status-transitions.test.ts
    fulfillment.test.ts
  auth/
    staffing-requests-permissions.test.ts
app/
  api/
    staffing-requests/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/staffing-requests/staffing-requests-access.spec.ts`

#### REQ-E2E-001: Unauthenticated user blocked

**Steps:** Visit `/staffing-requests` without session.

**Expected:** Redirect to `/login` with `callbackUrl` containing path.

---

#### REQ-E2E-002: Provider cannot access agency requests

**Steps:** Login as `provider`; visit `/staffing-requests`.

**Expected:** Redirect to provider portal route; no request list.

---

#### REQ-E2E-003: Facility user cannot access agency requests

**Steps:** Login as `facility_user`; visit `/staffing-requests`.

**Expected:** Redirect to facility portal; no request list.

---

#### REQ-E2E-004: Coordinator can access list

**Steps:** Login as `staffing_coordinator`; visit `/staffing-requests`.

**Expected:** Page title/heading “Staffing Requests”; table or empty state visible.

---

#### REQ-E2E-005: Recruiter can read list without create button

**Steps:** Login as `recruiter`; visit `/staffing-requests` and `/staffing-requests/new`.

**Expected:** List visible; `/staffing-requests/new` redirects or shows forbidden (403 page).

---

### 2.2 `e2e/staffing-requests/staffing-requests-list.spec.ts`

#### REQ-E2E-010: List shows seeded requests

**Steps:** Login as coordinator; open `/staffing-requests`.

**Expected:** At least one row with facility name, status badge, role.

---

#### REQ-E2E-011: Filter by status

**Steps:** Apply filter `status=open`.

**Expected:** Only open requests shown; URL contains query param.

---

#### REQ-E2E-012: Search by title

**Steps:** Enter search query matching seeded request title.

**Expected:** Matching row visible; non-matching hidden.

---

#### REQ-E2E-013: Row navigates to detail

**Steps:** Click first request row.

**Expected:** URL `/staffing-requests/[id]`; detail header shows title.

---

### 2.3 `e2e/staffing-requests/staffing-requests-create.spec.ts`

#### REQ-E2E-020: Create request happy path

**Steps:**

1. Login as coordinator
2. Visit `/staffing-requests/new`
3. Fill all required fields (facility, role, professionals required, shift date/times, priority, title)
4. Submit **Create request**

**Expected:**

- Redirect to `/staffing-requests/[id]`
- Status badge `Open`
- Fulfillment shows `0 / N`

---

#### REQ-E2E-021: Create with optional fields

**Steps:** Include specialty, certifications tags, min experience, facility unit, notes.

**Expected:** Detail shows specialty, credential chips, notes content including experience line.

---

#### REQ-E2E-022: Validation prevents past shift date

**Steps:** Set shift date in the past; submit.

**Expected:** Inline error; no redirect.

---

#### REQ-E2E-023: End time before start time rejected

**Steps:** Same-day start 22:00, end 06:00 without overnight flag (if same day invalid).

**Expected:** Validation error OR correct next-day handling per implementation.

---

#### REQ-E2E-024: Save draft

**Steps:** Fill facility + title only; click **Save draft**.

**Expected:** Detail shows `Draft` status; no fulfillment requirement yet.

---

#### REQ-E2E-025: Publish draft

**Steps:** Open draft detail; complete required fields; **Publish request**.

**Expected:** Status `Open`; primary shift exists (visible in Shifts section).

---

#### REQ-E2E-026: Pre-selected facility from query

**Steps:** Visit `/staffing-requests/new?facilityId={seededId}`.

**Expected:** Facility select locked/pre-filled to that facility.

---

### 2.4 `e2e/staffing-requests/staffing-requests-detail.spec.ts`

#### REQ-E2E-030: Start matching transition

**Steps:** On `open` request, click **Start matching**.

**Expected:** Status `Matching`; link to match route visible.

---

#### REQ-E2E-031: Cancel request

**Steps:** Click **Cancel request**; confirm dialog.

**Expected:** Status `Cancelled`; banner shown.

---

#### REQ-E2E-032: Recruiter cannot cancel

**Steps:** Login as recruiter on detail page.

**Expected:** No cancel/edit actions; direct API PATCH returns 403 (optional network assert).

---

#### REQ-E2E-033: Cross-agency detail blocked

**Steps:** Login agency A user; visit agency B request id URL.

**Expected:** 404 or forbidden page; no data leak.

---

### 2.5 `e2e/staffing-requests/staffing-requests-responsive.spec.ts`

#### REQ-E2E-040: Mobile list layout (375px)

**Expected:** Usable list/cards; no horizontal overflow of primary content.

---

#### REQ-E2E-041: Mobile create form (375px)

**Expected:** Sticky submit footer visible; fields usable.

---

#### REQ-E2E-042: Desktop table (1280px)

**Expected:** Full table columns visible.

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/validations/staffing-request.test.ts`

| ID | Case | Expected |
|---|---|---|
| REQ-UT-001 | Missing `facilityId` | Zod error |
| REQ-UT-002 | `professionalsRequired` < 1 | Error |
| REQ-UT-003 | `professionalsRequired` > 50 | Error |
| REQ-UT-004 | Invalid `roleNeeded` enum | Error |
| REQ-UT-005 | `priority` not in allowed set | Error |
| REQ-UT-006 | `title` too short | Error |
| REQ-UT-007 | Valid minimal payload | Pass |
| REQ-UT-008 | `requiredCredentials` max items | Error when > 20 |
| REQ-UT-009 | Shift end after start (same day) | Pass |
| REQ-UT-010 | Shift overnight window | Pass per rules |

---

### 3.2 `lib/staffing-requests/status-transitions.test.ts`

| ID | Case | Expected |
|---|---|---|
| REQ-UT-020 | `draft` → `open` | Allowed |
| REQ-UT-021 | `open` → `matching` | Allowed |
| REQ-UT-022 | `completed` → `open` | Denied |
| REQ-UT-023 | `cancelled` → `matching` | Denied |
| REQ-UT-024 | `open` → `cancelled` | Allowed |

---

### 3.3 `lib/staffing-requests/fulfillment.test.ts`

| ID | Case | Expected |
|---|---|---|
| REQ-UT-030 | 0 assignments | 0% progress |
| REQ-UT-031 | 1 confirmed of 2 required | 50%, `partially_filled` hint |
| REQ-UT-032 | 2 confirmed of 2 | 100%, `confirmed` hint |
| REQ-UT-033 | Declined assignments excluded | Count unchanged |

---

### 3.4 `lib/auth/staffing-requests-permissions.test.ts`

| ID | Case | Expected |
|---|---|---|
| REQ-UT-040 | `assertCanManageStaffingRequests` coordinator | true |
| REQ-UT-041 | recruiter | false |
| REQ-UT-042 | compliance_manager | false |

---

### 3.5 `app/api/staffing-requests/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| REQ-UT-050 | GET without session | 401 |
| REQ-UT-051 | POST as recruiter | 403 |
| REQ-UT-052 | POST as coordinator valid body | 201 + id |
| REQ-UT-053 | GET list agency B user agency A | No B rows |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| REQ-AUTH-01 | Recruiter POST `/api/staffing-requests` | 403 |
| REQ-AUTH-02 | Compliance PATCH status | 403 |
| REQ-AUTH-03 | Coordinator POST create | 201 |
| REQ-AUTH-04 | Agency A user GET agency B `[id]` | 403/404 |
| REQ-AUTH-05 | Owner and admin write | 200 |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| REQ-VAL-01 | Required create fields | REQ-E2E-020, REQ-UT-001–007 |
| REQ-VAL-02 | Shift datetime | REQ-E2E-022–023, REQ-UT-009–010 |
| REQ-VAL-03 | Facility agency scope | REQ-UT-053, integration test |
| REQ-VAL-04 | Draft minimal fields | REQ-E2E-024 |

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| REQ-EDGE-01 | Create with invalid `facilityId` | 400/404 |
| REQ-EDGE-02 | API failure on create | Toast error; form retained |
| REQ-EDGE-03 | Empty list agency | Empty state CTA |
| REQ-EDGE-04 | Cancel already completed | Action hidden or 409 |
| REQ-EDGE-05 | Double submit create | Idempotent or single row |

---

## 7. Responsive Tests

Viewports: 375px, 768px, 1280px — REQ-E2E-040–042.

| ID | Check |
|---|---|
| REQ-RESP-01 | Touch targets ≥ 44px on create submit |
| REQ-RESP-02 | Status badges readable on mobile cards |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| REQ-A11Y-01 | Create form fields have labels | `getByLabel` |
| REQ-A11Y-02 | Status badges have text, not color-only | axe |
| REQ-A11Y-03 | Cancel dialog focus trap | Playwright |
| REQ-A11Y-04 | Table headers scope=col | DOM |
| REQ-A11Y-05 | axe on list + create — zero critical | @axe-core/playwright |

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
npx vitest run lib/validations/staffing-request.test.ts lib/staffing-requests
npx playwright test e2e/staffing-requests
```

---

## 10. Pass Criteria

Module passes when:

- All REQ-E2E tests pass
- All REQ-UT and REQ-AUTH tests pass
- REQ-VAL and REQ-EDGE scenarios covered
- Responsive and a11y gates pass
- Build health commands exit 0
- No cross-agency leakage
- `prd.md` section 14 acceptance criteria satisfied

---

## Test Agent Handoff Checklist

- [ ] Seed: coordinator, recruiter, owner, two agencies, facilities, draft + open requests
- [ ] Seed primary shifts for open requests
- [ ] Mark FAILED_TEST on `tasks.md` with reproduction steps
