# Marketplace Search — Test Plan

## Module

Marketplace Search (`modules/18. Marketplace Search`)

### File layout

```
e2e/marketplace/marketplace-search.spec.ts
e2e/marketplace/marketplace-search-cart.spec.ts
lib/marketplace/search-params.test.ts
lib/marketplace/search-ranking.test.ts
app/api/marketplace/search/route.test.ts
```

## Playwright

#### MPS-E2E-001: Submit without location blocked

#### MPS-E2E-002: Search returns only eligible professionals

#### MPS-E2E-003: Geo exclusion Boston vs Denver

#### MPS-E2E-004: Select max 5 enforced

#### MPS-E2E-005: Continue to Request requires login

#### MPS-E2E-006: URL query params restore form state

## Vitest

| ID | Case |
|---|---|
| MPS-UNIT-001 | Parse query params |
| MPS-UNIT-002 | needEnd before needStart fails |
| MPS-API-001 | No location → 400 |
| MPS-API-002 | Response excludes availability_blocks |

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All MPS-* pass; fail-closed geography verified.
