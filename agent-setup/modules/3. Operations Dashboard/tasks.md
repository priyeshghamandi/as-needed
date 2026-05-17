# Operations Dashboard — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Operations Dashboard |
| Branch | `module/operations-dashboard` (merged via PR #3) |
| Status | **FAILED_TEST** |
| Depends on | Auth, Agency Onboarding |
| Test run | 2026-05-17 |

### Test summary (2026-05-17)

| Suite | Result |
|---|---|
| `npm run lint` | Pass (warnings only, pre-existing) |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | **18/18 passed** |
| `npm run test:e2e` | **20/21 passed** (OPS-E2E-050 failed) |
| OPS-AUTH via `dashboard-access.test.ts` | Pass |
| OPS-A11Y-05 (axe) | Not run |

### Failure reproduction

**OPS-E2E-050 (OPS-T009 / OPS-RESP-01)** — Mobile layout 375px horizontal overflow

1. `npm run db:seed:dashboard-e2e` (or `npm run test:e2e` runs seed via global setup)
2. Log in as `e2e-dash-owner-a@example.com` / `E2eTestPassword1!`
3. Open `/dashboard` at viewport 375×812
4. Observe `document.documentElement.scrollWidth` (738px) > `clientWidth` (375px)
5. **Expected (PRD §13):** no page horizontal overflow
6. **Actual:** sidebar + tables cause horizontal scroll; mobile card layout not implemented (OPS-023)

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
| OPS-001 | Create `lib/dashboard/metrics.ts` with KPI pure functions per PRD §8.2.1 | **PASSED** | Code Agent | Extended with count* helpers + Vitest |
| OPS-002 | Create `lib/dashboard/compliance-summary.ts` for row aggregate | **PASSED** | Code Agent | Extracted; used by queries |
| OPS-003 | Create `lib/dashboard/queries.ts` agency-scoped Drizzle reads | **PASSED** | Code Agent | |
| OPS-004 | Implement `GET /api/dashboard/summary` | **BLOCKED** | Code Agent | N/A — RSC uses `queries.ts` directly (PRD §7 allows) |
| OPS-005 | Implement `GET /api/dashboard/active-requests` | **BLOCKED** | Code Agent | Same as OPS-004 |
| OPS-006 | Implement `GET /api/dashboard/available-workforce` | **BLOCKED** | Code Agent | Same as OPS-004 |
| OPS-007 | Implement `GET /api/dashboard/activity` | **BLOCKED** | Code Agent | Same as OPS-004 |
| OPS-008 | Add `assertAgencyDashboardAccess` auth helper | **FAILED_TEST** | Code Agent | Middleware `canAccessPath` covers; no dedicated helper |
| OPS-009 | Create `app/(agency)/dashboard/page.tsx` server shell | **PASSED** | Code Agent | `app/dashboard/page.tsx` |
| OPS-010 | Build `DashboardKpiCards` component with skeletons | **FAILED_TEST** | Code Agent | KPIs in `OpsApp`; no skeletons |
| OPS-011 | Build `ActiveRequestsTable` read-only | **PASSED** | Code Agent | In `OpsApp` |
| OPS-012 | Build `AvailableWorkforceTable` read-only | **PASSED** | Code Agent | In `OpsApp` |
| OPS-013 | Build `RecentActivityFeed` component | **PASSED** | Code Agent | In `OpsApp`; no entity deep links |
| OPS-014 | Build `DashboardQuickActions` with role matrix | **PASSED** | Code Agent | In `OpsApp` |
| OPS-015 | Integrate `IncompleteOnboardingBanner` from onboarding module | **FAILED_TEST** | Code Agent | `OnboardingBanner` works; missing progress % and PRD copy |
| OPS-016 | Wire KPI click-through links (enabled/disabled flags) | **PENDING** | Code Agent | |
| OPS-017 | Add middleware/guard: block provider/facility_user on `/dashboard` | **PASSED** | Code Agent | `middleware.ts` + `path-access.ts` |
| OPS-018 | Implement empty states for KPI-adjacent tables | **PASSED** | Code Agent | |
| OPS-019 | Implement table → detail navigation links | **FAILED_TEST** | Code Agent | Workforce links OK; request rows not linked |
| OPS-020 | Add relative time formatting utility for Updated/Activity | **PASSED** | Code Agent | `formatRelativeTime` in `ops-app.tsx` |
| OPS-021 | Map `staffing_request_status` and `priority` to badge variants | **PASSED** | Code Agent | |
| OPS-022 | Hide reliability column below `md` breakpoint | **PASSED** | Code Agent | |
| OPS-023 | Mobile card layout for tables `< md` | **FAILED_TEST** | Code Agent | OPS-E2E-050; tables stay wide |
| OPS-024 | Handle API partial failure UI (per-section errors) | **PENDING** | Code Agent | |
| OPS-025 | Register dashboard in agency sidebar nav as active route | **FAILED_TEST** | Code Agent | Sidebar uses client state, not `Link` routes |
| OPS-026 | Run `npm run lint`, `typecheck`, `build` | **PASSED** | Code Agent | |
| OPS-027 | Mark module READY_FOR_TEST with handoff notes | **PASSED** | Code Agent | Superseded by test run |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| OPS-T001 | Create `lib/dashboard/metrics.test.ts` (OPS-UT-001–008) | **PASSED** | Test Agent | 9 tests |
| OPS-T002 | Create `lib/dashboard/compliance-summary.test.ts` (OPS-UT-010–013) | **PASSED** | Test Agent | 4 tests |
| OPS-T003 | Create `app/api/dashboard/summary.route.test.ts` (OPS-UT-020–023) | **BLOCKED** | Test Agent | Skipped — no REST routes; see `lib/auth/dashboard-access.test.ts` |
| OPS-T004 | Create `e2e/dashboard/dashboard-access.spec.ts` (OPS-E2E-001–005) | **PASSED** | Test Agent | 5/5 |
| OPS-T005 | Create `e2e/dashboard/dashboard-kpis.spec.ts` (OPS-E2E-010–013) | **PASSED** | Test Agent | Fill rate asserts 57% (seed math); PRD doc says 80% |
| OPS-T006 | Create `e2e/dashboard/dashboard-tables.spec.ts` (OPS-E2E-020–023) | **PASSED** | Test Agent | 4/4 |
| OPS-T007 | Create `e2e/dashboard/dashboard-banner.spec.ts` (OPS-E2E-030–032) | **PASSED** | Test Agent | 3/3 |
| OPS-T008 | Create `e2e/dashboard/dashboard-quick-actions.spec.ts` (OPS-E2E-040–042) | **PASSED** | Test Agent | 3/3 |
| OPS-T009 | Create `e2e/dashboard/dashboard-responsive.spec.ts` (OPS-E2E-050–051) | **FAILED_TEST** | Test Agent | OPS-E2E-050 fails (horizontal overflow) |
| OPS-T010 | Run authorization tests OPS-AUTH-01–04 | **PASSED** | Test Agent | Via unit + E2E access tests |
| OPS-T011 | Run edge cases OPS-EDGE-01–05 | **FAILED_TEST** | Test Agent | OPS-EDGE-01/02/03/04 not automated; OPS-EDGE-05 in metrics.test |
| OPS-T012 | Run axe on `/dashboard` (OPS-A11Y-05) | **PENDING** | Test Agent | `@axe-core/playwright` installed; not executed |
| OPS-T013 | Run `npm run lint` | **PASSED** | Test Agent | |
| OPS-T014 | Run `npm run typecheck` | **PASSED** | Test Agent | |
| OPS-T015 | Run `npm run build` | **PASSED** | Test Agent | |
| OPS-T016 | Run `vitest run lib/dashboard` + `playwright test e2e/dashboard` | **FAILED_TEST** | Test Agent | Unit pass; E2E 20/21 |
| OPS-T017 | Verify PRD acceptance criteria §14 | **FAILED_TEST** | Test Agent | See gaps: page title, mobile layout, banner copy |

---

## 5. Acceptance Criteria

Module is complete only when:

- [x] `/dashboard` accessible to all five agency roles; provider/facility_user blocked
- [x] Five KPIs match canonical formulas and seeded golden tests (unit tests pass; E2E fill rate seed uses 57% not 80%)
- [x] Active requests and available workforce tables are read-only and agency-scoped
- [x] Activity feed shows ≤20 events, newest first
- [x] Quick actions respect role matrix; no entity CRUD on dashboard
- [ ] Onboarding banner integration matches Agency Onboarding PRD
- [ ] Responsive behavior at 375/768/1280
- [x] Cross-agency API access returns 403 (path-access unit tests)
- [ ] All OPS-T* tests pass; lint, typecheck, build pass

---

## 6. Code Agent Rules

- Read `prd.md` and `test.md` before starting
- Work only on `module/operations-dashboard` branch
- Do not implement Staffing Requests, Shifts, or Matching UI beyond links/placeholders
- Reuse `IncompleteOnboardingBanner` and `calculateOnboardingPercent` from Agency Onboarding
- All queries must filter by session `agency_id`
- No POST/PATCH/DELETE dashboard endpoints
- Update task status after each task
- Stop at READY_FOR_TEST — do not mark PASSED

---

## 7. Test Agent Rules

- Read `test.md` before testing
- Tests and fixtures only — no production feature code
- Mark failures `FAILED_TEST` with reproduction steps
- Mark PASSED only after OPS-T001–T017 and acceptance criteria verified
- Run full build health commands

---

## 8. Test infrastructure added

```bash
npm run db:seed:dashboard-e2e   # Agencies A/B + role users
npm run test:unit               # Vitest: metrics, compliance, path access
npm run test:e2e                # Playwright: e2e/dashboard (runs migrate + seed)
```

Seed password: `E2eTestPassword1!` — see `e2e/fixtures/seed.md`.
