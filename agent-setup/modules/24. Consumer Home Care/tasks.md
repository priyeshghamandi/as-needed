# Consumer Home Care — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Consumer Home Care |
| Branch | `module/consumer-home-care` |
| Status | COMPLETE |
| Depends on | Auth (1), Customer Requests (20), Public Marketplace (19), Request Routing (21), Marketplace Eligibility (15) |

---

## 2. Prerequisites

- Modules 20–21 implemented (customer request + routing)
- Confirm `staffing_requests.agency_id` strategy (primary agency from first selection) with team before migration

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| CHC-001 | Migration: `consumer` role enum; `facilities.site_kind`; `user_care_sites`; optional `staffing_requests.source` value `marketplace_consumer` | COMPLETE |
| CHC-002 | Auth: `registerCareAction` + `/signup/care` page | COMPLETE |
| CHC-003 | `lib/consumer/care-site.ts` — create care site on signup (Places validation) | COMPLETE |
| CHC-004 | `lib/consumer/resolve-consumer-scope.ts` + `resolveCustomerOrConsumerScope()` wrapper | COMPLETE |
| CHC-005 | Update `create-customer-request.ts` for consumer scope + `marketplace_consumer` source + primary `agency_id` rule | COMPLETE |
| CHC-006 | Auth: `consumer` post-login redirect; `path-access` + middleware for `/customer/*`, `/marketplace/*` | COMPLETE |
| CHC-007 | `GET /api/consumer/care-site` (PATCH deferred — optional MVP) | COMPLETE |
| CHC-008 | Extend `POST/GET /api/customer/requests` auth to `consumer` | COMPLETE |
| CHC-009 | Extend `loadCustomerRequestsPageContext` for consumer | COMPLETE |
| CHC-010 | `/care/onboarding` or post-signup location confirm (minimal) | COMPLETE |
| CHC-011 | Homepage + marketplace: **Find home care** / consumer signup links | COMPLETE |
| CHC-012 | `CustomerShell` / marketplace header: consumer labels (“My care requests”) | COMPLETE |
| CHC-013 | Consumer-specific copy on request form (care notes, disclaimers) | COMPLETE |
| CHC-014 | Seed E2E consumer user + care site in `scripts/seed-dashboard-e2e.ts` | COMPLETE |
| CHC-015 | lint, typecheck, build | COMPLETE |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| CHC-T001 | Vitest: scope resolver (consumer vs facility_user) | COMPLETE |
| CHC-T002 | Vitest: create request with consumer scope + primary agency_id | PENDING |
| CHC-T003 | API route tests: signup/care, customer requests as consumer | PENDING |
| CHC-T004 | E2E: consumer signup → marketplace → request → routed queue | PENDING |
| CHC-T005 | E2E: invited facility_user regression (unchanged path) | PENDING |
| CHC-T006 | E2E: consumer cannot access `/dashboard` | PENDING |
| CHC-T007 | lint, typecheck, build, test | PENDING |

---

## 5. Acceptance Criteria

- [x] Self-serve consumer home care path end-to-end per PRD
- [x] Invited facility customer path unchanged
- [ ] All CHC-T* pass (CHC-T002–T007 pending)
