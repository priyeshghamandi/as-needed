# Facilities — Test Plan

## Module

Facilities (`modules/5. Facilities`)

## 1. Test Strategy

### Objectives

Validate facility list, add with invite, detail view, `FacilityTypeEnum` handling, service area rules, contact email uniqueness, role-based write access, and agency isolation.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | List, add, detail, auth, filters |
| Unit / Integration | Vitest | Zod, service area, type labels, API auth |
| Build | npm scripts | lint, typecheck, build, test |

### File layout (required)

```
e2e/
  facilities/
    facilities-access.spec.ts
    facilities-list.spec.ts
    facilities-add.spec.ts
    facilities-detail.spec.ts
    facilities-auth-write.spec.ts
    facilities-responsive.spec.ts
lib/
  validations/
    facility.test.ts
  facilities/
    type-labels.test.ts
app/
  api/
    facilities/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/facilities/facilities-access.spec.ts`

#### FAC-E2E-001: Unauthenticated blocked from `/facilities`

**Expected:** Redirect `/login` with callbackUrl

---

#### FAC-E2E-002: Coordinator can access list

**Expected:** **Facilities** title; **Add facility** visible

---

#### FAC-E2E-003: Facility user blocked from agency facilities

**Expected:** Redirect to facility portal; no agency list

---

#### FAC-E2E-004: Recruiter cannot access `/facilities/new`

**Expected:** Redirect `/facilities` + permission toast

---

### 2.2 `e2e/facilities/facilities-list.spec.ts`

#### FAC-E2E-010: List shows seeded facilities

**Expected:** Name, Type, Location columns; count ≥ 1

---

#### FAC-E2E-011: Filter by facility type

**Steps:** Filter type=hospital

**Expected:** Only hospital rows

---

#### FAC-E2E-012: Search by facility name

**Expected:** Filtered results

---

#### FAC-E2E-013: Empty state

**Expected:** **No facilities yet** for empty agency seed

---

### 2.3 `e2e/facilities/facilities-add.spec.ts`

#### FAC-E2E-020: Add facility inside service area with invite

**Steps:** Valid form; inviteContact=true; inside radius

**Expected:** Redirect `/facilities/[id]`; **Invite pending** or equivalent

---

#### FAC-E2E-021: Reject outside service area

**Expected:** Service area error; no row created

---

#### FAC-E2E-022: Duplicate contact email rejected

**Expected:** Duplicate message

---

#### FAC-E2E-023: All facility types selectable

**Steps:** Submit once per enum value (can be unit-tested; spot-check hospital + other in E2E)

**Expected:** Saved `type` matches selection

---

#### FAC-E2E-024: Add without invite

**Steps:** inviteContact=false

**Expected:** Facility created; **Invite contact** CTA on profile

---

### 2.4 `e2e/facilities/facilities-detail.spec.ts`

#### FAC-E2E-030: Detail shows contact and address

**Expected:** Sections visible per PRD

---

#### FAC-E2E-031: Coordinator edits contact

**Steps:** Edit phone; save

**Expected:** Updated value on reload

---

#### FAC-E2E-032: Resend invite

**Steps:** Click **Resend invite** on not-accepted facility

**Expected:** Success toast; pending invite remains

---

#### FAC-E2E-033: Foreign facility id 404

**Expected:** 404 page

---

### 2.5 `e2e/facilities/facilities-auth-write.spec.ts`

#### FAC-E2E-040: Recruiter no Add button

**Expected:** No **Add facility**

---

#### FAC-E2E-041: Recruiter no Edit on detail

**Expected:** Read-only detail

---

#### FAC-E2E-042: Owner can create

**Expected:** Full write path

---

### 2.6 `e2e/facilities/facilities-responsive.spec.ts`

#### FAC-E2E-050: Mobile list 375px

**Expected:** Card layout; no horizontal scroll

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/validations/facility.test.ts`

| ID | Case | Expected |
|---|---|---|
| FAC-UT-001 | Valid facility payload | Pass |
| FAC-UT-002 | Missing name | Fail |
| FAC-UT-003 | Invalid type enum | Fail |
| FAC-UT-004 | Invalid contact email | Fail |
| FAC-UT-005 | Missing placeId | Fail |
| FAC-UT-006 | notes > 2000 chars | Fail |

---

### 3.2 `lib/facilities/type-labels.test.ts`

| ID | Case | Expected |
|---|---|---|
| FAC-UT-010 | Each FacilityTypeEnum has label | 6 labels |
| FAC-UT-011 | Unknown type fallback | **Other** or safe default |

---

### 3.3 `app/api/facilities/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| FAC-UT-020 | POST as recruiter | 403 |
| FAC-UT-021 | POST as coordinator valid | 201 |
| FAC-UT-022 | POST outside service area | 400 |
| FAC-UT-023 | GET list agency scoped | No foreign facilities |
| FAC-UT-024 | POST duplicate contact_email | 409 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| FAC-AUTH-01 | Recruiter POST `/api/facilities` | 403 |
| FAC-AUTH-02 | Coordinator PATCH facility | 200 |
| FAC-AUTH-03 | Agency A cannot read agency B facility | 404 |
| FAC-AUTH-04 | Compliance manager cannot invite | 403 |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| FAC-VAL-01 | Service area | FAC-E2E-021, FAC-UT-022 |
| FAC-VAL-02 | contact_email unique | FAC-E2E-022, FAC-UT-024 |
| FAC-VAL-03 | FacilityTypeEnum only | FAC-E2E-023, FAC-UT-003 |
| FAC-VAL-04 | placeId required | FAC-UT-005 |

---

## 6. Required Error and Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| FAC-EDGE-01 | API failure on create | Toast; form retained |
| FAC-EDGE-02 | Invalid UUID | 404 |
| FAC-EDGE-03 | Open requests count zero | Displays **0** |
| FAC-EDGE-04 | Invite duplicate pending | Auth skip/error behavior |
| FAC-EDGE-05 | Optional address lines null | Still saves |

---

## 7. Responsive Tests

375px, 768px, 1280px — FAC-E2E-050.

| ID | Check |
|---|---|
| FAC-RESP-01 | Add form mobile full width |
| FAC-RESP-02 | Open requests column hidden `< md` |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| FAC-A11Y-01 | Form labels on add facility | getByLabel |
| FAC-A11Y-02 | Type select accessible name | getByRole combobox |
| FAC-A11Y-03 | axe list + add — zero critical | axe |

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Fallback:

```bash
npx vitest run lib/validations/facility lib/facilities
npx playwright test e2e/facilities
```

---

## 10. Pass Criteria

- All FAC-E2E tests pass
- All FAC-UT tests pass
- FAC-AUTH-01–04 pass
- axe zero critical on list + add
- lint, typecheck, build pass
- PRD §14 satisfied
