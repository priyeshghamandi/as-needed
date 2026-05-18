# Public Marketplace — Test Plan

## Module

Public Marketplace (`modules/19. Public Marketplace`)

### File layout

```
e2e/marketplace/public-marketplace-home.spec.ts
e2e/marketplace/public-marketplace-nav.spec.ts
```

## Playwright

#### PMK-E2E-001: Home loads with hero and CTAs

#### PMK-E2E-002: Browse categories navigates to `/marketplace/categories`

#### PMK-E2E-003: Search CTA navigates to `/marketplace/search`

#### PMK-E2E-004: Location chip opens modal and persists cookie

#### PMK-E2E-005: Fulfillment disclaimer visible on home and category child

#### PMK-E2E-006: Root `/` redirects to `/marketplace`

#### PMK-E2E-007: Facility user sees My staffing requests link

## Accessibility

#### PMK-A11Y-001: axe on `/marketplace`

## Build

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Pass Criteria

All PMK-* pass.
