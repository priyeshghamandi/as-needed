# Category Directory — Test Plan

## Module

Category Directory (`modules/16. Category Directory`)

## 1. Test Strategy

Validate public category routes, SEO metadata, location-gated listings, eligibility integration, and empty states.

### File layout (required)

```
e2e/
  marketplace/
    category-directory.spec.ts
    category-listings-geo.spec.ts
lib/
  marketplace/
    categories.test.ts
app/
  api/
    marketplace/
      categories/
        route.test.ts
        [slug]/
          professionals/
            route.test.ts
```

---

## 2. Required Playwright E2E Tests

### `e2e/marketplace/category-directory.spec.ts`

#### CAT-E2E-001: Category index loads

**Steps:** Visit `/marketplace/categories`.

**Expected:** Seed categories visible; location banner shown.

---

#### CAT-E2E-002: Invalid slug 404

**Steps:** Visit `/marketplace/categories/invalid-role`.

**Expected:** 404.

---

#### CAT-E2E-003: Category page without location shows prompt

**Steps:** Visit `/marketplace/categories/registered-nurse` without cookie.

**Expected:** No professional cards; location CTA; `noindex` meta (if inspectable).

---

#### CAT-E2E-004: Category page with Denver location shows in-area only

**Steps:** Set location cookie Denver; seed 1 in-area RN visible, 1 out-of-area RN visible.

**Expected:** Only in-area professional on page.

---

#### CAT-E2E-005: Opt-out professional never listed

**Steps:** Seed hidden professional in area.

**Expected:** Not in DOM.

---

#### CAT-E2E-006: Request Professional redirects unauthenticated

**Steps:** Click **Request Professional** without login.

**Expected:** Redirect `/login?callbackUrl=...`.

---

### `e2e/marketplace/category-listings-geo.spec.ts`

#### CAT-E2E-007: Boston location excludes Denver-only professional

**Steps:** Set Boston cookie; load RN category.

**Expected:** Denver professional absent.

---

#### CAT-E2E-008: Empty state when zero eligible

**Steps:** Location with no coverage.

**Expected:** Empty state copy present.

---

## 3. Required Vitest Tests

### `lib/marketplace/categories.test.ts`

| ID | Case | Expected |
|---|---|---|
| CAT-UNIT-001 | Resolve slug to category | Match `role_filter` |
| CAT-UNIT-002 | Invalid slug | null |

### `app/api/marketplace/categories/[slug]/professionals/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| CAT-API-001 | No location | 400 empty |
| CAT-API-002 | Valid location | 200 array |
| CAT-API-003 | Response shape has no availability_blocks | |

---

## 4. Authorization Tests

Public read-only; no agency data leakage in API JSON (agency internal IDs optional; no coordinator notes).

---

## 5. Responsive Tests

#### CAT-RESP-001

375px: category grid single column; cards readable.

---

## 6. Accessibility Tests

#### CAT-A11Y-001

axe on category page with listings.

---

## 7. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

---

## 10. Pass Criteria

All CAT-* tests pass; geography fail-closed verified.
