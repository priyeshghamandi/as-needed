# Professional Public Profiles — Test Plan

## Module

Professional Public Profiles (`modules/17. Professional Public Profiles`)

## 1. Test Strategy

Validate public profile rendering, geo/opt-in 404 behavior, approximate availability only, agency edit flows, and API response shape.

### File layout (required)

```
e2e/
  marketplace/
    public-profile.spec.ts
    public-profile-edit.spec.ts
lib/
  marketplace/
    approximate-availability.test.ts
    public-profile.test.ts
app/
  api/
    marketplace/
      professionals/
        [publicSlug]/
          route.test.ts
    workforce/
      [id]/
        public-profile/
          route.test.ts
```

---

## 2. Required Playwright E2E Tests

### `e2e/marketplace/public-profile.spec.ts`

#### PPP-E2E-001: Valid slug renders profile

**Steps:** Set Denver location; visit visible in-area professional slug.

**Expected:** Headline, bio, availability badge; **Request Professional** visible.

---

#### PPP-E2E-002: Opt-out slug returns 404

**Steps:** Visit slug of hidden professional.

**Expected:** 404 page.

---

#### PPP-E2E-003: Wrong geo returns 404

**Steps:** Boston location; Denver-only professional slug.

**Expected:** 404.

---

#### PPP-E2E-004: No exact schedule in page

**Steps:** Inspect HTML for ISO datetime patterns from availability blocks.

**Expected:** None exposed.

---

#### PPP-E2E-005: Request Professional requires auth

**Steps:** Logged out click CTA.

**Expected:** Login redirect with callback.

---

### `e2e/marketplace/public-profile-edit.spec.ts`

#### PPP-E2E-006: Recruiter edits headline

**Steps:** Update headline on workforce tab; view public page.

**Expected:** New headline visible.

---

#### PPP-E2E-007: Coordinator cannot edit

**Steps:** Coordinator opens public profile tab.

**Expected:** Read-only; PATCH 403.

---

## 3. Required Vitest Tests

### `lib/marketplace/approximate-availability.test.ts`

| ID | Case | Expected |
|---|---|---|
| PPP-UNIT-001 | Blocks in 7 days | `likely_available` |
| PPP-UNIT-002 | No blocks, recent login | `recently_active` |
| PPP-UNIT-003 | Function output never includes times | |

### `app/api/marketplace/professionals/[publicSlug]/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| PPP-API-001 | Eligible + location | 200 public shape |
| PPP-API-002 | Ineligible | 404 |
| PPP-API-003 | No `availability_blocks` in JSON | |

---

## 4. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

---

## 10. Pass Criteria

All PPP-* tests pass; no PII leakage; no exact schedules public.
