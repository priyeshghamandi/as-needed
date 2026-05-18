# Agency Fulfillment Review — Test Plan

## Module

Agency Fulfillment Review (`modules/22. Agency Fulfillment Review`)

### File layout

```
e2e/fulfillment/agency-fulfillment-confirm.spec.ts
e2e/fulfillment/agency-fulfillment-decline.spec.ts
e2e/fulfillment/customer-approve-fulfillment.spec.ts
lib/fulfillment/fulfillment-status.test.ts
app/api/staffing-requests/[id]/fulfillment/confirm/route.test.ts
```

## Playwright

#### AFR-E2E-001: Coordinator confirms → customer sees Approve fulfillment

#### AFR-E2E-002: Customer approves → status customer_approved

#### AFR-E2E-003: Decline requires reason

#### AFR-E2E-004: Recruiter cannot confirm (403)

#### AFR-E2E-005: Cross-agency fulfillment page 404

#### AFR-E2E-006: Copy does not say "Booked"

## Vitest

| ID | Case |
|---|---|
| AFR-UNIT-001 | Status transition pending → agency_confirmed → customer_approved |
| AFR-UNIT-002 | Invalid transition rejected |

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All AFR-* pass.
