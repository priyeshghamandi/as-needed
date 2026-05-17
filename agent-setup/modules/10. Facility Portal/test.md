# Facility Portal — Test Plan

## Module

Facility Portal (`modules/10. Facility Portal`)

## 1. Test Strategy

### Objectives

Validate `facility_user`-only access to `/facility/*`, facility-scoped staffing request create/list/detail, dashboard KPIs, companion shift creation on submit, and prevention of cross-facility data access.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Dashboard, create request, list/detail, auth |
| Unit / Integration | Vitest | Zod schema, timeline derivation, facility resolution |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

| User | Role | Facility |
|---|---|---|
| `e2e-facility@example.com` | `facility_user` | Facility A (accepted invite) |
| `e2e-facility-b@example.com` | `facility_user` | Facility B (same agency, different site) |
| `e2e-owner@example.com` | `agency_owner` | Agency |
| `e2e-provider@example.com` | `provider` | — |

Seed:

- 3 requests for Facility A (mixed statuses)
- 1 request for Facility B
- 1 shift + assignment on confirmed request for upcoming staff card

### File layout

```
e2e/
  facility-portal/
    facility-access.spec.ts
    facility-dashboard.spec.ts
    facility-requests.spec.ts
    facility-responsive.spec.ts
lib/
  validations/
    facility-staffing-request.test.ts
  facility/
    resolve-facility.test.ts
    fulfillment-timeline.test.ts
app/
  api/
    facility/
      requests/route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `facility-access.spec.ts`

#### FPORT-E2E-001: Unauthenticated blocked

Visit `/facility/dashboard` → redirect `/login` with callback.

#### FPORT-E2E-002: Facility user login redirect

Login `e2e-facility@example.com` → `/facility/dashboard`.

#### FPORT-E2E-003: Agency owner blocked

Login owner → visit `/facility/dashboard` → redirect `/dashboard`.

#### FPORT-E2E-004: Provider blocked

Login provider → visit `/facility/requests` → redirect `/my-shifts`.

---

### 2.2 `facility-dashboard.spec.ts`

#### FPORT-E2E-010: Dashboard KPIs render

Login facility user → dashboard shows numeric KPI cards (≥0).

#### FPORT-E2E-011: Active requests snippet

Seed open request → appears in active table with link.

#### FPORT-E2E-012: Create request CTA navigates

Click **Create staffing request** → `/facility/requests/new`.

---

### 2.3 `facility-requests.spec.ts`

#### FPORT-E2E-020: Create staffing request

Fill valid form on `/facility/requests/new` → submit.

**Expected**

- Redirect to detail URL
- `staffing_requests` row with correct `facility_id`
- Companion `shifts` row exists (FPORT-028)

---

#### FPORT-E2E-021: Request list scoped

Login Facility A user → list shows Facility A requests only, not Facility B.

---

#### FPORT-E2E-022: Cross-facility detail returns 404

Login Facility A → visit detail URL for Facility B request (from seed id).

**Expected**

- 404 or not-found page
- No data leak

---

#### FPORT-E2E-023: Request detail timeline visible

Open owned request detail → timeline shows **Request Submitted** step complete.

---

#### FPORT-E2E-024: Validation errors on empty submit

Submit empty create form → inline errors, no DB row.

---

#### FPORT-E2E-025: Search/filter by status

Apply status filter `open` → only open requests shown.

---

### 2.4 `facility-responsive.spec.ts`

#### FPORT-E2E-030: Tablet dashboard layout

Viewport 768×1024 → KPI grid 2×2, no horizontal scroll.

#### FPORT-E2E-031: Mobile request list cards

Viewport 375×812 → list uses cards not wide table.

---

## 3. Required Unit/Integration Tests

### `facility-staffing-request.test.ts`

| ID | Case | Expected |
|---|---|---|
| FPORT-UT-001 | Valid payload | pass |
| FPORT-UT-002 | professionals_required = 0 | fail |
| FPORT-UT-003 | end time before start | fail |
| FPORT-UT-004 | title too short | fail |
| FPORT-UT-005 | invalid role enum | fail |

### `resolve-facility.test.ts`

| ID | Case | Expected |
|---|---|---|
| FPORT-UT-010 | accepted invite with facilityId | resolves |
| FPORT-UT-011 | no accepted invite | null |

### `fulfillment-timeline.test.ts`

| ID | Case | Expected |
|---|---|---|
| FPORT-UT-020 | status open | only Submitted |
| FPORT-UT-021 | status matching | Submitted + Matching |
| FPORT-UT-022 | with assignment accepted | includes Shift Assigned |
| FPORT-UT-023 | status confirmed | includes Confirmed |

### API tests

| ID | Case | Expected |
|---|---|---|
| FPORT-UT-030 | GET requests as facility_user | 200 scoped |
| FPORT-UT-031 | POST create with wrong facilityId in body | ignored; uses context |
| FPORT-UT-032 | GET requests as agency_owner on facility API | 403 |

---

## 4. Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| FPORT-AUTH-01 | Facility A cannot read Facility B request | 404 |
| FPORT-AUTH-02 | facility_user cannot POST agency staffing API | 403 |
| FPORT-AUTH-03 | Unauthenticated POST create | 401 |

---

## 5. Validation Tests

FPORT-UT-001–005, FPORT-E2E-024.

---

## 6. Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| FPORT-EDGE-01 | Double-click submit create | single row (idempotency) |
| FPORT-EDGE-02 | Facility user without invite | blocked empty state |
| FPORT-EDGE-03 | Shift crossing midnight | stored UTC correctly |

---

## 7. Responsive Tests

FPORT-E2E-030, FPORT-E2E-031.

---

## 8. Accessibility Tests

| ID | Requirement |
|---|---|
| FPORT-A11Y-01 | Create form inputs labeled |
| FPORT-A11Y-02 | KPI cards have headings |
| FPORT-A11Y-03 | axe on dashboard + create — no critical issues |

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
npx playwright test e2e/facility-portal
```

---

## 10. Pass Criteria

- [ ] All FPORT-E2E-* pass
- [ ] All FPORT-UT-* pass
- [ ] FPORT-AUTH-* and FPORT-EDGE-* pass
- [ ] Build health green
- [ ] PRD §14 checklist complete
