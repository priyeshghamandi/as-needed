# Customer Requests — Test Plan

## Module

Customer Requests (`modules/20. Customer Requests`)

### File layout

```
e2e/customer-requests/customer-requests-access.spec.ts
e2e/customer-requests/customer-requests-create.spec.ts
e2e/customer-requests/customer-requests-list.spec.ts
lib/customer-requests/create-customer-request.test.ts
lib/validations/customer-request.test.ts
app/api/customer/requests/route.test.ts
```

## Playwright

#### CRQ-E2E-001: Unauthenticated `/customer/requests/new` → login

#### CRQ-E2E-002: Agency user cannot access customer routes

#### CRQ-E2E-003: Create request from cart (2 professionals)

**Expected:** Redirect detail; `staffing_request_selections` count 2; `source=marketplace_customer`

#### CRQ-E2E-004: Ineligible professional at submit → error

#### CRQ-E2E-005: Cross-facility request ID → 404

#### CRQ-E2E-006: Submit button copy not "Book"

## Vitest

| ID | Case |
|---|---|
| CRQ-UNIT-001 | Validation schema max 5 selections |
| CRQ-UNIT-002 | Same role enforcement |
| CRQ-API-001 | POST creates request + selections |
| CRQ-API-002 | facility_user scope |

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All CRQ-* pass.
