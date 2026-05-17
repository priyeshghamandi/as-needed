# Operations Dashboard — Test Plan

## Module

Operations Dashboard (`modules/3. Operations Dashboard`)

## 1. Test Strategy

### Objectives

Validate that all agency roles can access `/dashboard` with correct read-only visibility, KPI metrics match canonical formulas, tables are agency-scoped, onboarding banner integration works, quick actions respect role matrix, and unauthorized users are blocked.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Route access, KPI/table rendering, banner, quick actions, responsive smoke |
| Unit / Integration | Vitest | `lib/dashboard/metrics.ts`, compliance aggregate helper, API auth mocks |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

Seed per agency:

- Agency A: 3 open requests, 2 available professionals, 1 urgent shift, 2 compliance alerts, 5 activity logs
- Agency B: empty data (zero states)
- Users: `agency_owner` (complete), `agency_owner` (incomplete onboarding), `staffing_coordinator`, `recruiter`, `compliance_manager`, `provider`, `facility_user`

### File layout (required)

```
e2e/
  dashboard/
    dashboard-access.spec.ts
    dashboard-kpis.spec.ts
    dashboard-tables.spec.ts
    dashboard-banner.spec.ts
    dashboard-quick-actions.spec.ts
    dashboard-responsive.spec.ts
lib/
  dashboard/
    metrics.test.ts
    compliance-summary.test.ts
app/
  api/
    dashboard/
      summary.route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/dashboard/dashboard-access.spec.ts`

#### OPS-E2E-001: Unauthenticated user blocked

**Steps**

1. Visit `/dashboard` without session

**Expected**

- Redirect to `/login`
- `callbackUrl` includes `/dashboard`

---

#### OPS-E2E-002: Agency owner can access dashboard

**Steps**

1. Log in as seeded agency owner (onboarding complete)
2. Visit `/dashboard`

**Expected**

- Page title **Operations Dashboard** visible
- Five KPI cards visible

---

#### OPS-E2E-003: Staffing coordinator can access dashboard

**Steps**

1. Log in as `staffing_coordinator`
2. Visit `/dashboard`

**Expected**

- Dashboard loads; no onboarding banner

---

#### OPS-E2E-004: Provider cannot access dashboard

**Steps**

1. Log in as `provider`
2. Visit `/dashboard`

**Expected**

- Redirect to provider portal route (per Auth)
- No dashboard KPI content

---

#### OPS-E2E-005: Facility user cannot access dashboard

**Steps**

1. Log in as `facility_user`
2. Visit `/dashboard`

**Expected**

- Redirect to facility portal route
- No dashboard content

---

### 2.2 `e2e/dashboard/dashboard-kpis.spec.ts`

#### OPS-E2E-010: Open requests KPI matches seeded count

**Steps**

1. Log in as owner for Agency A (seed: 3 open requests)
2. Read **Open Requests** card value

**Expected**

- Displays `3`

---

#### OPS-E2E-011: Available professionals KPI

**Steps**

1. Same session
2. Read **Available Professionals** card

**Expected**

- Displays seeded available count (`2`)

---

#### OPS-E2E-012: Fill rate displays percentage

**Steps**

1. Agency A with known fill rate seed (e.g. 4/5 = 80%)
2. Read **Fill Rate** card

**Expected**

- Shows `80%` (or seeded golden value)

---

#### OPS-E2E-013: Empty agency shows zero KPIs

**Steps**

1. Log in as owner for Agency B (no requests/pros)
2. View KPI cards

**Expected**

- Open Requests `0`, Fill Rate `0%`, Available Professionals `0`, etc.

---

### 2.3 `e2e/dashboard/dashboard-tables.spec.ts`

#### OPS-E2E-020: Active requests table lists seeded rows

**Steps**

1. Log in Agency A owner
2. Inspect **Active Staffing Requests** table

**Expected**

- At least one row with facility name, status badge, progress fraction
- Row click navigates to request detail or shows disabled state with tooltip if module absent

---

#### OPS-E2E-021: Available workforce table links to profile

**Steps**

1. Log in Agency A owner
2. Click first workforce row name link

**Expected**

- Navigates to `/workforce/[id]` for that professional

---

#### OPS-E2E-022: Activity feed shows recent events

**Steps**

1. Log in Agency A owner
2. Scroll to **Recent Activity**

**Expected**

- At most 20 items
- Newest event appears first
- Relative timestamps visible

---

#### OPS-E2E-023: Empty requests table state

**Steps**

1. Log in Agency B owner
2. View active requests table

**Expected**

- Copy **No active staffing requests** visible

---

### 2.4 `e2e/dashboard/dashboard-banner.spec.ts`

#### OPS-E2E-030: Incomplete onboarding banner for owner

**Steps**

1. Log in owner with `onboarding_completed_at` null
2. Visit `/dashboard` via Save & exit flow or direct URL if guard allows

**Expected**

- Banner **Finish setting up your agency workspace** visible
- **Continue setup** links to `/onboarding`

---

#### OPS-E2E-031: Banner hidden when onboarding complete

**Steps**

1. Log in completed onboarding owner
2. Visit `/dashboard`

**Expected**

- No onboarding banner

---

#### OPS-E2E-032: Coordinator does not see onboarding banner

**Steps**

1. Log in `staffing_coordinator` for agency with incomplete onboarding (edge seed)
2. Visit `/dashboard`

**Expected**

- No onboarding banner

---

### 2.5 `e2e/dashboard/dashboard-quick-actions.spec.ts`

#### OPS-E2E-040: Coordinator sees create staffing request action

**Steps**

1. Log in coordinator
2. Inspect quick actions

**Expected**

- **Create staffing request** visible (enabled or disabled per module flag)

---

#### OPS-E2E-041: Recruiter does not see create staffing request

**Steps**

1. Log in recruiter
2. Inspect quick actions

**Expected**

- **Create staffing request** not visible
- **Add healthcare professional** visible

---

#### OPS-E2E-042: Compliance manager limited quick actions

**Steps**

1. Log in `compliance_manager`
2. Inspect quick actions

**Expected**

- No **Add healthcare professional** or **Add facility**
- **View workforce** / **View facilities** visible

---

### 2.6 `e2e/dashboard/dashboard-responsive.spec.ts`

#### OPS-E2E-050: Mobile layout 375px

**Steps**

1. Set viewport 375×812
2. Log in owner; visit `/dashboard`

**Expected**

- KPI cards readable without page horizontal scroll
- Tables render as cards or scroll within container

---

#### OPS-E2E-051: Desktop layout 1280px

**Steps**

1. Set viewport 1280×800
2. Visit `/dashboard`

**Expected**

- Requests and workforce tables side-by-side (`lg` layout)

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/dashboard/metrics.test.ts`

| ID | Case | Expected |
|---|---|---|
| OPS-UT-001 | `countOpenRequests` with mixed statuses | Counts only open, matching, partially_filled, at_risk |
| OPS-UT-002 | `countOpenRequests` empty | `0` |
| OPS-UT-003 | `calculateFillRate` 4 filled of 5 required | `80` |
| OPS-UT-004 | `calculateFillRate` no requests | `0` |
| OPS-UT-005 | `calculateFillRate` caps filled per request at `professionals_required` | Correct cap |
| OPS-UT-006 | `countAvailableProfessionals` filters inactive | Excludes `is_active=false` |
| OPS-UT-007 | `countUrgentShifts` within 24h window | Matches boundary (inclusive/exclusive per implementation doc) |
| OPS-UT-008 | `countComplianceAlerts` statuses | Counts expiring_soon, expired, pending_review |

---

### 3.2 `lib/dashboard/compliance-summary.test.ts`

| ID | Case | Expected |
|---|---|---|
| OPS-UT-010 | All verified credentials | `Clear` |
| OPS-UT-011 | One expired | `Blocked` |
| OPS-UT-012 | One expiring_soon, none expired | `Attention` |
| OPS-UT-013 | No credentials | `Clear` |

---

### 3.3 `app/api/dashboard/summary.route.test.ts`

| ID | Case | Expected |
|---|---|---|
| OPS-UT-020 | GET without session | `401` |
| OPS-UT-021 | GET as provider | `403` |
| OPS-UT-022 | GET as agency owner | `200` + KPI payload keys |
| OPS-UT-023 | Mock agency A cannot read agency B data | `403` or empty scoped payload |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| OPS-AUTH-01 | `provider` GET `/api/dashboard/summary` | `403` |
| OPS-AUTH-02 | Owner agency A summary never includes agency B counts | Isolation |
| OPS-AUTH-03 | Recruiter quick actions exclude create request | UI/E2E OPS-E2E-041 |
| OPS-AUTH-04 | No POST/PATCH/DELETE on `/api/dashboard/*` | `405` or route not found |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| OPS-VAL-01 | KPI integer non-negative | OPS-UT-001–008 |
| OPS-VAL-02 | Fill rate 0–100 | OPS-UT-003–005 |
| OPS-VAL-03 | Activity feed limit 20 | OPS-E2E-022 + unit |

---

## 6. Required Error and Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| OPS-EDGE-01 | API summary 500 | KPI cards show **—**; page does not crash |
| OPS-EDGE-02 | Partial table failure | Inline error on failed section only |
| OPS-EDGE-03 | Professional with null city/state | Location column **—** |
| OPS-EDGE-04 | Request with null coordinator | **Unassigned** |
| OPS-EDGE-05 | Fill rate with zero `professionals_required` rows excluded | No divide-by-zero |

---

## 7. Responsive Tests

Viewports: 375px, 768px, 1280px — OPS-E2E-050, OPS-E2E-051.

| ID | Check |
|---|---|
| OPS-RESP-01 | Quick action buttons min height 44px on mobile |
| OPS-RESP-02 | KPI row scroll snap optional; no clipped labels |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| OPS-A11Y-01 | KPI cards have accessible names (not just raw numbers) | `getByRole('region')` or labelled headings |
| OPS-A11Y-02 | Tables use `<table>` semantics or equivalent grid roles | DOM inspection |
| OPS-A11Y-03 | Banner CTA keyboard activatable | Playwright keyboard |
| OPS-A11Y-04 | Focus order: banner → KPIs → tables → activity | Manual |
| OPS-A11Y-05 | axe on `/dashboard` — zero critical violations | `@axe-core/playwright` |

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
npx vitest run lib/dashboard
npx playwright test e2e/dashboard
```

---

## 10. Pass Criteria

The Operations Dashboard module passes testing only when:

- All OPS-E2E tests in `e2e/dashboard/` pass
- All OPS-UT tests pass
- OPS-AUTH-01–04 pass
- Responsive smokes OPS-E2E-050–051 pass
- No critical axe violations on `/dashboard`
- `npm run lint`, `typecheck`, `build` exit 0
- PRD acceptance criteria §14 satisfied
- No cross-agency data in API tests

---

## Test Agent Handoff Checklist

- [ ] Seed agencies A (populated) and B (empty)
- [ ] Seed all agency role users with passwords
- [ ] Seed incomplete onboarding owner for banner tests
- [ ] Document disabled quick-action behavior when Staffing Requests route absent
- [ ] File `FAILED_TEST` on `tasks.md` with reproduction steps
