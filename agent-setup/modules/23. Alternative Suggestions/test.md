# Alternative Suggestions — Test Plan

## Module

Alternative Suggestions (`modules/23. Alternative Suggestions`)

### File layout

```
e2e/alternatives/suggest-alternative.spec.ts
e2e/alternatives/customer-approve-alternative.spec.ts
e2e/alternatives/customer-reject-alternative.spec.ts
lib/fulfillment/alternative-status.test.ts
app/api/staffing-requests/[id]/alternatives/route.test.ts
```

## Playwright

#### ALT-E2E-001: Coordinator proposes alternative → customer sees card

#### ALT-E2E-002: Customer approves → fulfillment_status customer_approved + selection type suggested_alternative

#### ALT-E2E-003: Customer reject → customer_rejected

#### ALT-E2E-004: Cannot suggest out-of-area professional

#### ALT-E2E-005: Cannot suggest professional from other agency

#### ALT-E2E-006: Agency withdraw pending alternative

#### ALT-E2E-007: UI uses "Suggested Alternative" label not "Replacement booking"

## Vitest

| ID | Case |
|---|---|
| ALT-UNIT-001 | One pending per original enforcement |
| ALT-UNIT-002 | Status transition matrix |

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All ALT-* pass.
