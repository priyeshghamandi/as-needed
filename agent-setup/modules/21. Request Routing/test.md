# Request Routing — Test Plan

## Module

Request Routing (`modules/21. Request Routing`)

### File layout

```
e2e/request-routing/routed-queue.spec.ts
e2e/request-routing/multi-agency-routing.spec.ts
lib/request-routing/route-staffing-request.test.ts
app/api/staffing-requests/routed/route.test.ts
```

## Playwright

#### RTR-E2E-001: Submit customer request creates routed queue item for Agency A

#### RTR-E2E-002: Multi-agency selections create two routes; Agency A queue shows 1 professional

#### RTR-E2E-003: Agency B cannot see Agency A route in queue

#### RTR-E2E-004: Acknowledge route updates status

#### RTR-E2E-005: Idempotent re-route no duplicates

## Vitest

| ID | Case |
|---|---|
| RTR-UNIT-001 | Group selections by agency |
| RTR-UNIT-002 | Unique constraint handling |
| RTR-API-001 | Routed list scoped by agency_id |

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All RTR-* pass.
