# Pending Work — Module Audit

Generated from `agent-setup/modules/*/tasks.md` (module status + tasks marked **PENDING**, **FAILED_TEST**, or **BLOCKED**).  
**Do not treat `list.md` as source of truth** — it is often stale (e.g. modules 16, 19–23).

Legend:
- **Not started** — module or task still `PENDING` in `tasks.md`
- **Test / sign-off** — implementation largely done; tests, axe, or PRD §14 pending
- **Failed / gaps** — `FAILED_TEST` items needing fixes
- **Docs drift** — `tasks.md` says pending but codebase appears implemented (verify before re-implementing)

---

## Summary by module

| # | Module | `tasks.md` status | Pending summary |
|---|--------|-------------------|-----------------|
| 1 | Auth | FAILED_TEST | **AUTH-T024** lint (onboarding-app refs); 25/26 AUTH-T* passed |
| 2 | Agency Onboarding | FAILED_TEST | A11y, auth/edge tests, PRD §14; **ONBOARD-T007**, **ONBOARD-T020** failed |
| 3 | Operations Dashboard | FAILED_TEST | **OPS-010**, **015**, **016**, **019**, **024**, **025**; **OPS-T011**, **T017** |
| 4 | Workforce | FAILED_TEST | **WORK-T013** (axe), **WORK-T015** (PRD sign-off) |
| 5 | Facilities | FAILED_TEST | **FAC-T012** (axe), **FAC-T014** (PRD sign-off) |
| 6 | Staffing Requests | FAILED_TEST | **REQ-T013** (axe), **REQ-T015** (PRD sign-off) |
| 7 | Shifts | FAILED_TEST | **SHIFT-T010** (axe), **SHIFT-T011** (PRD sign-off) |
| 8 | Matching & Assignments | FAILED_TEST | **MATCH-T013** (axe) only |
| 9 | Healthcare Professional Portal | FAILED_TEST | **HPP-T013** (axe); optional **HPP-025** JWT deferred |
| 10 | Facility Portal | PENDING | **All FPORT-001–021** + **FPORT-T001–T012** (docs; partial UI in repo — see drift) |
| 11 | Compliance | PENDING | **All COMP-* + COMP-T*** in docs (likely drift — see below) |
| 12 | Notifications & Alerts | READY_FOR_TEST | **All NOTIF-T001–T014** |
| 13 | Activity Logs | READY_FOR_TEST | **All ACT-T001–T012** |
| 14 | Settings | READY_FOR_TEST | **All SET-T001–T015** |
| 15 | Marketplace Eligibility Rules | READY_FOR_TEST | **MEL-T008**, **MEL-T009** (responsive manual, axe) |
| 16 | Category Directory | COMPLETE | **CAT-T004–T006** (geo E2E, category axe, full test run) |
| 17 | Professional Public Profiles | PENDING | **All PPP-001–014**, **PPP-T001–T005** in docs (likely drift) |
| 18 | Marketplace Search | PENDING | **All MPS-*** in docs (likely drift) |
| 19 | Public Marketplace | COMPLETE | — |
| 20 | Customer Requests | COMPLETE | — |
| 21 | Request Routing | COMPLETE | — |
| 22 | Agency Fulfillment Review | COMPLETE | — |
| 23 | Alternative Suggestions | COMPLETE | — |
| 24 | Consumer Home Care | COMPLETE | **CHC-T002–T007** (tests + full CI) |

---

## 1. Auth

**Module status:** FAILED_TEST  
**Implementation:** AUTH-001–030 marked PASSED / READY_FOR_TEST.  
**Testing:** 25/26 AUTH-T* **PASSED** (2026-05-19).

### Pending

| ID | Task | Status |
|----|------|--------|
| AUTH-T024 | Run lint | FAILED_TEST — 2 ESLint errors in `components/onboarding-app.tsx` (`react-hooks/refs`); not Auth code |

### Passed (test suite)

Signup, login, logout, RBAC, invites, session, API validation, typecheck, build — covered by `lib/auth/auth-module.test.ts`, `e2e/auth/auth-flows.spec.ts`, and cross-module access E2E specs. See `modules/1. Auth/tasks.md` for per-task notes.

**Run commands**

```bash
npm run typecheck && npm run build
npx vitest run lib/auth/auth-module.test.ts lib/auth/dashboard-access.test.ts
PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test e2e/auth e2e/dashboard/dashboard-access.spec.ts e2e/onboarding/onboarding-access.spec.ts e2e/provider-portal/provider-access.spec.ts e2e/facilities/facilities-access.spec.ts
```

**Known limitations (from tasks):** JWT sessions; facility self-signup UI mock; no invite email delivery. E2E requires app on port **3001** if Docker occupies **3000**.

---

## 2. Agency Onboarding

**Module status:** FAILED_TEST

### Pending / failed

| ID | Task | Status |
|----|------|--------|
| ONBOARD-T007 | `app/api/onboarding/route.test.ts` | FAILED_TEST |
| ONBOARD-T012 | Keyboard/a11y (ONB-A11Y-03) | PENDING |
| ONBOARD-T013 | axe welcome + profile (ONB-A11Y-05) | PENDING |
| ONBOARD-T014 | Authorization ONB-AUTH-01–03 | PENDING |
| ONBOARD-T015 | Edge cases ONB-EDGE-01–06 | PENDING |
| ONBOARD-T020 | PRD §14 acceptance | FAILED_TEST |

---

## 3. Operations Dashboard

**Module status:** FAILED_TEST

### Implementation gaps

| ID | Task | Status |
|----|------|--------|
| OPS-008 | `assertAgencyDashboardAccess` dedicated helper | FAILED_TEST |
| OPS-010 | KPI skeletons | FAILED_TEST |
| OPS-015 | Onboarding banner copy/progress % | FAILED_TEST |
| OPS-016 | KPI click-through links | PENDING |
| OPS-019 | Request row → detail links | FAILED_TEST |
| OPS-024 | Per-section partial failure UI | PENDING |
| OPS-025 | Sidebar `Link` routes vs client state | FAILED_TEST |

### Testing gaps

| ID | Task | Status |
|----|------|--------|
| OPS-T011 | Edge cases OPS-EDGE-01–04 | FAILED_TEST |
| OPS-T012 | axe `/dashboard` | PENDING |
| OPS-T017 | PRD §14 sign-off | FAILED_TEST |

**Note:** OPS-004–007 marked BLOCKED (RSC path; no REST routes) — intentional per PRD.

---

## 4. Workforce

**Module status:** FAILED_TEST

| ID | Task | Status |
|----|------|--------|
| WORK-T013 | axe list + add pages | FAILED_TEST |
| WORK-T015 | PRD §14 sign-off | FAILED_TEST |

---

## 5. Facilities

**Module status:** FAILED_TEST

| ID | Task | Status |
|----|------|--------|
| FAC-T012 | axe list + add | FAILED_TEST |
| FAC-T014 | PRD §14 sign-off | FAILED_TEST |

---

## 6. Staffing Requests

**Module status:** FAILED_TEST

| ID | Task | Status |
|----|------|--------|
| REQ-T013 | axe list + create | FAILED_TEST |
| REQ-T015 | PRD §14 sign-off | FAILED_TEST |

---

## 7. Shifts

**Module status:** FAILED_TEST

| ID | Task | Status |
|----|------|--------|
| SHIFT-T010 | axe + build health | FAILED_TEST |
| SHIFT-T011 | PRD acceptance sign-off | FAILED_TEST |

---

## 8. Matching & Assignments

**Module status:** FAILED_TEST (implementation otherwise PASSED)

| ID | Task | Status |
|----|------|--------|
| MATCH-T013 | axe (MATCH-A11Y) | FAILED_TEST |

---

## 9. Healthcare Professional Portal

**Module status:** FAILED_TEST

| ID | Task | Status |
|----|------|--------|
| HPP-025 | Optional JWT `professionalId` on session | PENDING (deferred) |
| HPP-T013 | Accessibility / axe | FAILED_TEST |

---

## 10. Facility Portal

**Module status:** PENDING (all implementation tasks PENDING in `tasks.md`)

### Pending per tasks.md

- **FPORT-001–021:** resolve facility scope, validations, APIs, `/facility/*` pages, timeline UI, auth, lint/build
- **FPORT-T001–T012:** seed, unit/API/E2E, RBAC, axe, PRD sign-off

### Docs drift

Repo has `app/facility/dashboard`, `app/facility/requests`, `app/facility/page.tsx` but **no** `e2e/facility/`. Reconcile `tasks.md` with codebase before starting net-new work.

---

## 11. Compliance

**Module status:** PENDING (all COMP-* PENDING in `tasks.md`)

### Pending per tasks.md

- **COMP-MIG-01** through **COMP-024:** full module (migration, lib, APIs, UI, sidebar, READY_FOR_TEST)
- **COMP-T001–T012:** all tests

### Docs drift

Repo has `app/compliance/page.tsx`, `lib/compliance/*`, tests under `lib/compliance/`. **`tasks.md` is outdated** — treat as **test/sign-off audit needed**, not greenfield build.

---

## 12. Notifications & Alerts

**Module status:** READY_FOR_TEST (implementation READY_FOR_TEST)

### Pending

| ID | Task |
|----|------|
| NOTIF-T001–T014 | Unit, API, E2E (access, inbox, read state, toast/banner, responsive), NOTIF-AUTH/EDGE, axe, build health, PRD §14 |

---

## 13. Activity Logs

**Module status:** READY_FOR_TEST

### Pending

| ID | Task |
|----|------|
| ACT-T001–T012 | Unit (`log-activity`, `format-action`, `entity-route`, API), E2E (access, dashboard, entity panel, responsive), ACT-AUTH/EDGE, axe on dashboard feed, build health, PRD §14 |

**Note:** ACT-016 deferred (settings save integration).

---

## 14. Settings

**Module status:** READY_FOR_TEST

### Pending

| ID | Task |
|----|------|
| SET-T001–T015 | Unit, API, E2E (access, profile, service area, team, preferences, RBAC, responsive), SET-AUTH/EDGE, axe, PRD §14 |

---

## 15. Marketplace Eligibility Rules

**Module status:** READY_FOR_TEST (MEL-001–016 PASSED)

### Pending

| ID | Task | Status |
|----|------|--------|
| MEL-T008 | Responsive MEL-RESP-001 | PENDING (manual) |
| MEL-T009 | axe MEL-A11Y-001 | PENDING |

---

## 16. Category Directory

**Module status:** COMPLETE (implementation)

### Pending

| ID | Task |
|----|------|
| CAT-T004 | `e2e/marketplace/category-listings-geo.spec.ts` (not in repo) |
| CAT-T005 | Responsive + axe on category index/slug pages |
| CAT-T006 | Full `test:unit:category-directory` + `test:e2e:category-directory` sign-off |

---

## 17. Professional Public Profiles

**Module status:** PENDING (all tasks PENDING in `tasks.md`)

### Pending per tasks.md

- **PPP-001–014:** migration, public profile loader/API/page, workforce edit, OG, CTAs
- **PPP-T001–T005:** unit, API, E2E, build

### Docs drift

Repo has `app/marketplace/professionals/[publicSlug]/page.tsx`, `lib/marketplace/public-profile.ts`, `professional_marketplace_profiles` migration. **Reconcile `tasks.md` before treating as not started.**

---

## 18. Marketplace Search

**Module status:** PENDING (all tasks PENDING in `tasks.md`)

### Pending per tasks.md

- **MPS-001–011:** search params, API, ranking, page, form, cart, URL sync, CTA, empty states, build
- **MPS-T001–T004:** tests

### Docs drift

Repo has `app/marketplace/search/page.tsx`, `lib/marketplace/search-params.ts`, `search-results.ts`, cart integration. **Reconcile `tasks.md` before treating as not started.**

---

## 19–23. Marketplace request & fulfillment

| Module | Status in `tasks.md` | Pending |
|--------|----------------------|---------|
| 19 Public Marketplace | COMPLETE | None in tasks |
| 20 Customer Requests | COMPLETE | None in tasks |
| 21 Request Routing | COMPLETE | None in tasks |
| 22 Agency Fulfillment Review | COMPLETE | None in tasks |
| 23 Alternative Suggestions | COMPLETE | None in tasks |

---

## 24. Consumer Home Care

**Module status:** COMPLETE (CHC-001–015)

### Pending

| ID | Task |
|----|------|
| CHC-T002 | Vitest: create request + consumer scope + primary `agency_id` |
| CHC-T003 | API tests: signup/care, customer requests as consumer |
| CHC-T004 | E2E: consumer signup → marketplace → request → routed queue |
| CHC-T005 | E2E: facility_user regression |
| CHC-T006 | E2E: consumer cannot access `/dashboard` |
| CHC-T007 | lint, typecheck, build, test |

---

## Cross-cutting themes (recurring pending)

1. **Accessibility (axe)** — Onboarding, Dashboard, Workforce, Facilities, Staffing Requests, Shifts, Matching, Provider Portal, Eligibility, Category Directory (category pages), Settings/Notifications/Activity (when tested).
2. **PRD §14 sign-off** — Failed or blocked on axe for modules 2–7.
3. **READY_FOR_TEST modules (12–14)** — Implementation marked done; **entire Test Agent task lists still PENDING**.
4. **Auth test suite** — **25/26 AUTH-T* passed**; **AUTH-T024** blocked by onboarding-app ESLint errors.
5. **Stale module docs** — **10 Facility Portal**, **11 Compliance**, **17 Public Profiles**, **18 Search** need `tasks.md` sync with repo; **list.md** module table needs update for 15–24.

---

## Suggested priority (product, not enforced)

1. Sync **tasks.md** for modules 11, 17, 18 (and 10) after codebase audit.
2. Close **Auth** lint blocker (**AUTH-T024** / onboarding-app refs) then mark module complete.
3. Finish **FAILED_TEST** polish on Phase 1–2 ops modules (2–7, 3).
4. Run **READY_FOR_TEST** test passes: Notifications, Activity Logs, Settings.
5. Marketplace tests: **16** geo E2E; **24** consumer E2E; **15** axe.
6. **Facility Portal** — confirm scope vs existing `/facility/*` routes.

---

*Last updated: Auth module test run 2026-05-19 (25/26 AUTH-T* passed).*
