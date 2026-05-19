# Consumer Home Care — Test Plan

## Module

Consumer Home Care (`modules/24. Consumer Home Care`)

### File layout

```
e2e/consumer-home-care/consumer-signup-request.spec.ts
e2e/consumer-home-care/consumer-multi-agency-routing.spec.ts
e2e/consumer-home-care/facility-user-regression.spec.ts
e2e/consumer-home-care/consumer-access-denied.spec.ts
lib/consumer/resolve-consumer-scope.test.ts
lib/customer-requests/create-consumer-request.test.ts
app/api/auth/signup/care/route.test.ts
```

---

## Playwright

#### CHC-E2E-001: Consumer signup → marketplace with location

1. Open `/signup/care`
2. Complete signup with valid address (or seed Places mock)
3. Expect redirect to marketplace or care requests
4. Location chip shows care site city/state

#### CHC-E2E-002: Consumer submits request from marketplace cart

1. Log in as seeded consumer (or complete CHC-E2E-001)
2. Add marketplace professional(s) to cart
3. Submit `/customer/requests/new`
4. Expect detail page; `source` marketplace_consumer (or documented discriminator)
5. Agency coordinator sees request in **Routed requests**

#### CHC-E2E-003: Multi-agency selection routes both agencies

1. Consumer cart: professionals from Agency A and Agency B (seeded geo-eligible)
2. Submit request
3. Both agencies’ coordinators see routed entry (isolated browser contexts)

#### CHC-E2E-004: Consumer approves agency-confirmed fulfillment

1. After agency confirms (module 22 flow), consumer sees approve CTA on detail
2. Approve → `customer_approved`

#### CHC-E2E-005: Invited facility_user regression

1. Log in as `e2e-dash-facility@example.com` (existing seed)
2. Submit customer request via marketplace cart
3. Expect unchanged behavior (invite scope)

#### CHC-E2E-006: Consumer denied agency routes

1. Log in as consumer
2. `GET /dashboard` → redirect or 403 per auth rules

#### CHC-E2E-007: Unauthenticated cannot POST customer request

1. `POST /api/customer/requests` without session → 401

#### CHC-E2E-008: Homepage Find home care → signup

1. `/` → link **Find home care** → `/signup/care`

#### CHC-E2E-009: Copy — no Book/Hire on consumer request path

1. Consumer request form and buttons use Request / Staffing language only

---

## Vitest

| ID | Case |
|---|---|
| CHC-UNIT-001 | `resolveConsumerScope` returns care site for consumer role |
| CHC-UNIT-002 | `resolveConsumerScope` fails without care site |
| CHC-UNIT-003 | `resolveCustomerFacilityScope` unchanged for facility_user |
| CHC-UNIT-004 | Create request sets `agency_id` = first selection’s agency |
| CHC-UNIT-005 | Create request rejects wrong `facilityId` for consumer |
| CHC-API-001 | Signup care creates user + role + care site link |
| CHC-API-002 | POST customer requests forbidden for agency coordinator |

---

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
npm run test:e2e:consumer-home-care
```

(Add `test:e2e:consumer-home-care` script when implementing.)

---

## Pass Criteria

All CHC-* pass; facility_user marketplace tests (module 20) still pass.
