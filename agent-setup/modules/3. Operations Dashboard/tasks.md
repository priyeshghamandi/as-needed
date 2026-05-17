# Operations Dashboard — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Operations Dashboard |
| Branch | `module/operations-dashboard` |
| Status | PENDING |
| Depends on | Auth, Agency Onboarding |

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
| OPS-001 | Create `lib/dashboard/metrics.ts` with KPI pure functions per PRD §8.2.1 | PENDING | Code Agent | Vitest target |
| OPS-002 | Create `lib/dashboard/compliance-summary.ts` for row aggregate | PENDING | Code Agent | Clear / Attention / Blocked |
| OPS-003 | Create `lib/dashboard/queries.ts` agency-scoped Drizzle reads | PENDING | Code Agent | All tables in PRD §9.1 |
| OPS-004 | Implement `GET /api/dashboard/summary` | PENDING | Code Agent | Returns KPI payload |
| OPS-005 | Implement `GET /api/dashboard/active-requests` | PENDING | Code Agent | Limit 10, status filter |
| OPS-006 | Implement `GET /api/dashboard/available-workforce` | PENDING | Code Agent | Limit 10, available filter |
| OPS-007 | Implement `GET /api/dashboard/activity` | PENDING | Code Agent | Limit 20 |
| OPS-008 | Add `assertAgencyDashboardAccess` auth helper | PENDING | Code Agent | Agency roles only |
| OPS-009 | Create `app/(agency)/dashboard/page.tsx` server shell | PENDING | Code Agent | Layout + metadata |
| OPS-010 | Build `DashboardKpiCards` component with skeletons | PENDING | Code Agent | Five cards |
| OPS-011 | Build `ActiveRequestsTable` read-only | PENDING | Code Agent | Columns per PRD §8.3 |
| OPS-012 | Build `AvailableWorkforceTable` read-only | PENDING | Code Agent | Columns per PRD §8.4 |
| OPS-013 | Build `RecentActivityFeed` component | PENDING | Code Agent | Map actions to copy + links |
| OPS-014 | Build `DashboardQuickActions` with role matrix | PENDING | Code Agent | PRD §8.6 |
| OPS-015 | Integrate `IncompleteOnboardingBanner` from onboarding module | PENDING | Code Agent | Owner/admin only |
| OPS-016 | Wire KPI click-through links (enabled/disabled flags) | PENDING | Code Agent | Feature flags per dependent module |
| OPS-017 | Add middleware/guard: block provider/facility_user on `/dashboard` | PENDING | Code Agent | Align Auth redirects |
| OPS-018 | Implement empty states for KPI-adjacent tables | PENDING | Code Agent | PRD copy |
| OPS-019 | Implement table → detail navigation links | PENDING | Code Agent | workforce + requests |
| OPS-020 | Add relative time formatting utility for Updated/Activity | PENDING | Code Agent | Reuse if exists |
| OPS-021 | Map `staffing_request_status` and `priority` to badge variants | PENDING | Code Agent | Shared badge component |
| OPS-022 | Hide reliability column below `md` breakpoint | PENDING | Code Agent | Responsive §13 |
| OPS-023 | Mobile card layout for tables `< md` | PENDING | Code Agent | |
| OPS-024 | Handle API partial failure UI (per-section errors) | PENDING | Code Agent | OPS-EDGE-02 |
| OPS-025 | Register dashboard in agency sidebar nav as active route | PENDING | Code Agent | |
| OPS-026 | Run `npm run lint`, `typecheck`, `build` | PENDING | Code Agent | |
| OPS-027 | Mark module READY_FOR_TEST with handoff notes | PENDING | Code Agent | Seed instructions |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| OPS-T001 | Create `lib/dashboard/metrics.test.ts` (OPS-UT-001–008) | PENDING | Test Agent | Vitest |
| OPS-T002 | Create `lib/dashboard/compliance-summary.test.ts` (OPS-UT-010–013) | PENDING | Test Agent | |
| OPS-T003 | Create `app/api/dashboard/summary.route.test.ts` (OPS-UT-020–023) | PENDING | Test Agent | Mock auth |
| OPS-T004 | Create `e2e/dashboard/dashboard-access.spec.ts` (OPS-E2E-001–005) | PENDING | Test Agent | Playwright |
| OPS-T005 | Create `e2e/dashboard/dashboard-kpis.spec.ts` (OPS-E2E-010–013) | PENDING | Test Agent | |
| OPS-T006 | Create `e2e/dashboard/dashboard-tables.spec.ts` (OPS-E2E-020–023) | PENDING | Test Agent | |
| OPS-T007 | Create `e2e/dashboard/dashboard-banner.spec.ts` (OPS-E2E-030–032) | PENDING | Test Agent | |
| OPS-T008 | Create `e2e/dashboard/dashboard-quick-actions.spec.ts` (OPS-E2E-040–042) | PENDING | Test Agent | |
| OPS-T009 | Create `e2e/dashboard/dashboard-responsive.spec.ts` (OPS-E2E-050–051) | PENDING | Test Agent | |
| OPS-T010 | Run authorization tests OPS-AUTH-01–04 | PENDING | Test Agent | |
| OPS-T011 | Run edge cases OPS-EDGE-01–05 | PENDING | Test Agent | |
| OPS-T012 | Run axe on `/dashboard` (OPS-A11Y-05) | PENDING | Test Agent | |
| OPS-T013 | Run `npm run lint` | PENDING | Test Agent | |
| OPS-T014 | Run `npm run typecheck` | PENDING | Test Agent | |
| OPS-T015 | Run `npm run build` | PENDING | Test Agent | |
| OPS-T016 | Run `vitest run lib/dashboard` + `playwright test e2e/dashboard` | PENDING | Test Agent | |
| OPS-T017 | Verify PRD acceptance criteria §14 | PENDING | Test Agent | Sign-off |

---

## 5. Acceptance Criteria

Module is complete only when:

- `/dashboard` accessible to all five agency roles; provider/facility_user blocked
- Five KPIs match canonical formulas and seeded golden tests
- Active requests and available workforce tables are read-only and agency-scoped
- Activity feed shows ≤20 events, newest first
- Quick actions respect role matrix; no entity CRUD on dashboard
- Onboarding banner integration matches Agency Onboarding PRD
- Responsive behavior at 375/768/1280
- Cross-agency API access returns 403
- All OPS-T* tests pass; lint, typecheck, build pass

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
