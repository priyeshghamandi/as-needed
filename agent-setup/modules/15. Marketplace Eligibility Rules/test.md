# Marketplace Eligibility Rules — Test Plan

## Module

Marketplace Eligibility Rules (`modules/15. Marketplace Eligibility Rules`)

## 1. Test Strategy

### Objectives

Validate opt-in visibility toggles, geography fail-closed filtering, compliance blocks, shared eligibility library contracts, agency authorization, and bulk actions.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Workforce marketplace tab, toggle flows, blocked states |
| Unit / Integration | Vitest | Eligibility math, geo checks, filter queries, API auth |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

- Agency A: service area Denver 75mi; 3 professionals (in-area visible, in-area hidden, out-of-area)
- Agency B: 1 visible professional (cross-agency isolation)
- Customer context: Denver lat/lng vs Boston lat/lng
- Compliance: one professional with expired required credential

### File layout (required)

```
e2e/
  marketplace-eligibility/
    marketplace-visibility-access.spec.ts
    marketplace-visibility-toggle.spec.ts
lib/
  marketplace/
    eligibility.test.ts
    geo-eligibility.test.ts
    visibility-checklist.test.ts
  auth/
    marketplace-visibility-permissions.test.ts
app/
  api/
    workforce/
      [id]/
        marketplace-visibility/
          route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/marketplace-eligibility/marketplace-visibility-access.spec.ts`

#### MEL-E2E-001: Provider cannot access marketplace visibility tab

**Steps:** Login as `provider`; visit `/workforce/[id]?tab=marketplace`.

**Expected:** Redirect to provider portal; no toggle.

---

#### MEL-E2E-002: Coordinator read-only

**Steps:** Login as `staffing_coordinator`; open marketplace tab.

**Expected:** Checklist visible; toggle disabled/hidden; no PATCH success.

---

#### MEL-E2E-003: Cross-agency workforce ID

**Steps:** Agency A user PATCH visibility for Agency B professional ID.

**Expected:** 404.

---

### 2.2 `e2e/marketplace-eligibility/marketplace-visibility-toggle.spec.ts`

#### MEL-E2E-004: Enable visibility happy path

**Steps:** Recruiter enables visible professional meeting checklist.

**Expected:** Toggle ON; badge **Marketplace visible**; activity log entry.

---

#### MEL-E2E-005: Enable blocked by incomplete profile

**Steps:** Attempt enable on professional missing required public fields.

**Expected:** 400; toggle remains OFF; error message on checklist item.

---

#### MEL-E2E-006: Disable visibility removes from eligibility query

**Steps:** Enable then disable; call search API fixture or internal test page.

**Expected:** Professional excluded from eligible set.

---

#### MEL-E2E-007: Compliance block UI

**Steps:** Seed expired credential; open marketplace tab.

**Expected:** **Blocked — compliance** banner; toggle disabled.

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/marketplace/eligibility.test.ts`

| ID | Case | Expected |
|---|---|---|
| MEL-UNIT-001 | `getEligibleProfessionals` with valid Denver customer | Returns in-area visible only |
| MEL-UNIT-002 | Missing customer location | Empty array |
| MEL-UNIT-003 | Opt-out professional | Excluded |
| MEL-UNIT-004 | `visibility_blocked_reason` set | Excluded |
| MEL-UNIT-005 | Boston customer vs Denver professional | Excluded |
| MEL-UNIT-006 | Returns no `availability_blocks` fields | Public-safe shape only |

### 3.2 `lib/marketplace/geo-eligibility.test.ts`

| ID | Case | Expected |
|---|---|---|
| MEL-GEO-001 | Distance within radius | `true` |
| MEL-GEO-002 | Distance outside radius | `false` |
| MEL-GEO-003 | Null lat/lng | `false` |

### 3.3 `lib/marketplace/visibility-checklist.test.ts`

| ID | Case | Expected |
|---|---|---|
| MEL-CHK-001 | All rules pass | `canEnable=true` |
| MEL-CHK-002 | Out of service area | `canEnable=false` + reason |

### 3.4 `app/api/workforce/[id]/marketplace-visibility/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| MEL-API-001 | PATCH by recruiter | 200 |
| MEL-API-002 | PATCH by coordinator | 403 |
| MEL-API-003 | Unauthenticated | 401 |

---

## 4. Authorization Tests

- MEL-E2E-002, MEL-E2E-003, MEL-API-002 cover role and agency scope.

---

## 5. Validation Tests

- Checklist failures return structured errors
- Bulk toggle rejects >50 IDs

---

## 6. Error/Edge Case Tests

| ID | Case | Expected |
|---|---|---|
| MEL-EDGE-001 | Agency without service area | Enable blocked |
| MEL-EDGE-002 | Inactive professional | Cannot enable |
| MEL-EDGE-003 | Duplicate enable (idempotent) | 200 no duplicate rows |

---

## 7. Responsive Tests

#### MEL-RESP-001

**Steps:** View marketplace tab at 375px width.

**Expected:** Checklist stacks; CTA reachable.

---

## 8. Accessibility Tests

#### MEL-A11Y-001

**Steps:** axe on marketplace tab (enabled state).

**Expected:** No critical violations; toggle has accessible name.

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

---

## 10. Pass Criteria

- All MEL-* tests implemented and passing
- Eligibility library used as documented; no duplicate geo logic in downstream modules
- Fail-closed geography verified
