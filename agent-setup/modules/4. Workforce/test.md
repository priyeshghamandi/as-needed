# Workforce — Test Plan

## Module

Workforce (`modules/4. Workforce`)

## 1. Test Strategy

### Objectives

Validate workforce list, add/invite flow, profile read, service area enforcement, role-based write restrictions, duplicate email handling, and agency data isolation.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | List, add, profile, auth, filters, responsive |
| Unit / Integration | Vitest | Zod schemas, shift readiness, compliance aggregate, service area |
| Build | npm scripts | lint, typecheck, build, test |

### File layout (required)

```
e2e/
  workforce/
    workforce-access.spec.ts
    workforce-list.spec.ts
    workforce-add.spec.ts
    workforce-profile.spec.ts
    workforce-auth-write.spec.ts
    workforce-responsive.spec.ts
lib/
  validations/
    healthcare-professional.test.ts
  workforce/
    shift-readiness.test.ts
    list-filters.test.ts
app/
  api/
    workforce/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/workforce/workforce-access.spec.ts`

#### WORK-E2E-001: Unauthenticated blocked from `/workforce`

**Expected:** Redirect to `/login` with callbackUrl

---

#### WORK-E2E-002: Recruiter can access list

**Expected:** **Workforce** title; **Add professional** visible

---

#### WORK-E2E-003: Provider blocked

**Expected:** Redirect away; no workforce list

---

#### WORK-E2E-004: Coordinator cannot access `/workforce/new`

**Steps:** Log in coordinator; visit `/workforce/new`

**Expected:** Redirect `/workforce` + permission toast

---

### 2.2 `e2e/workforce/workforce-list.spec.ts`

#### WORK-E2E-010: List shows seeded professionals

**Expected:** Columns Name, Role, Availability visible; row count ≥ 1

---

#### WORK-E2E-011: Search by name

**Steps:** Enter partial name in search

**Expected:** Filtered rows only

---

#### WORK-E2E-012: Filter by availability

**Steps:** Set availability=available

**Expected:** Only available rows

---

#### WORK-E2E-013: Empty agency empty state

**Expected:** **No healthcare professionals yet** copy

---

### 2.3 `e2e/workforce/workforce-add.spec.ts`

#### WORK-E2E-020: Add professional inside service area

**Steps:** Fill valid form; location inside radius; submit

**Expected:** Redirect `/workforce/[id]`; success toast

---

#### WORK-E2E-021: Reject location outside service area

**Steps:** Select outside location (mock Places)

**Expected:** Submit blocked; service area message

---

#### WORK-E2E-022: Add with invite requires email

**Steps:** `sendInvite=true` without email

**Expected:** Validation error

---

#### WORK-E2E-023: Duplicate email rejected

**Steps:** Create professional with existing email

**Expected:** Field error duplicate message

---

#### WORK-E2E-024: Add without invite phone-only

**Steps:** Phone filled, no email, sendInvite=false

**Expected:** Record created; profile **Not invited**

---

### 2.4 `e2e/workforce/workforce-profile.spec.ts`

#### WORK-E2E-030: Profile displays header and sections

**Expected:** Name, role badge, contact section visible

---

#### WORK-E2E-031: Send invite from profile

**Steps:** Open professional without `user_id`; click **Send invite** (recruiter)

**Expected:** **Invite pending** badge

---

#### WORK-E2E-032: Deactivate professional

**Steps:** Owner deactivates; return to list

**Expected:** Not in default list; visible with **Show inactive**

---

#### WORK-E2E-033: Foreign agency id returns 404

**Steps:** Visit `/workforce/{other-agency-uuid}`

**Expected:** 404 page

---

### 2.5 `e2e/workforce/workforce-auth-write.spec.ts`

#### WORK-E2E-040: Coordinator sees no Add button

**Expected:** No **Add professional** on list

---

#### WORK-E2E-041: Coordinator profile has no Edit

**Expected:** No edit/deactivate controls

---

### 2.6 `e2e/workforce/workforce-responsive.spec.ts`

#### WORK-E2E-050: Mobile list cards 375px

**Expected:** No horizontal scroll; tappable rows

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/validations/healthcare-professional.test.ts`

| ID | Case | Expected |
|---|---|---|
| WORK-UT-001 | Valid minimal payload | Pass |
| WORK-UT-002 | Missing firstName | Fail |
| WORK-UT-003 | Invalid role enum | Fail |
| WORK-UT-004 | sendInvite true without email | Fail |
| WORK-UT-005 | Neither email nor phone | Fail |
| WORK-UT-006 | yearsExperience > 60 | Fail |
| WORK-UT-007 | Missing placeId on location | Fail |

---

### 3.2 `lib/workforce/shift-readiness.test.ts`

| ID | Case | Expected |
|---|---|---|
| WORK-UT-010 | available + compliance Clear + not on_shift | Ready |
| WORK-UT-011 | on_shift | Not ready |
| WORK-UT-012 | compliance Blocked | Not ready |

---

### 3.3 `lib/workforce/list-filters.test.ts`

| ID | Case | Expected |
|---|---|---|
| WORK-UT-020 | Build where clause for role filter | Correct SQL fragment/mock |
| WORK-UT-021 | compliance=blocked filter | Includes blocked professionals only |

---

### 3.4 `app/api/workforce/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| WORK-UT-030 | POST as coordinator | 403 |
| WORK-UT-031 | POST as recruiter valid body | 201 |
| WORK-UT-032 | GET list scoped to agency | No foreign rows |
| WORK-UT-033 | POST outside service area | 400 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| WORK-AUTH-01 | Coordinator POST `/api/workforce` | 403 |
| WORK-AUTH-02 | Recruiter PATCH profile | 200 |
| WORK-AUTH-03 | Agency A cannot GET agency B professional | 404 |
| WORK-AUTH-04 | Compliance manager cannot deactivate | 403 |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| WORK-VAL-01 | Service area bounds | WORK-E2E-021, WORK-UT-033 |
| WORK-VAL-02 | Email uniqueness | WORK-E2E-023 |
| WORK-VAL-03 | Professional role enum | WORK-UT-003 |
| WORK-VAL-04 | Invite email required | WORK-E2E-022, WORK-UT-004 |

---

## 6. Required Error and Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| WORK-EDGE-01 | API 500 on create | Toast; form retained |
| WORK-EDGE-02 | Invalid UUID in URL | 404 |
| WORK-EDGE-03 | Deactivated user excluded from default list | WORK-E2E-032 |
| WORK-EDGE-04 | Professional with no shifts | Last shift **No shifts yet** |
| WORK-EDGE-05 | Pending duplicate invite | Handled per Auth skip/error |

---

## 7. Responsive Tests

375px, 768px, 1280px — WORK-E2E-050 + tablet desktop table visibility.

| ID | Check |
|---|---|
| WORK-RESP-01 | Add form full-width inputs mobile |
| WORK-RESP-02 | Profile stacks single column `< lg` |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| WORK-A11Y-01 | Add form labels associated | getByLabel |
| WORK-A11Y-02 | Table headers scope col | DOM |
| WORK-A11Y-03 | Deactivate dialog focus trap | Playwright |
| WORK-A11Y-04 | axe on list + add — zero critical | axe |

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
npx vitest run lib/validations/healthcare-professional lib/workforce
npx playwright test e2e/workforce
```

---

## 10. Pass Criteria

- All WORK-E2E tests pass
- All WORK-UT tests pass
- WORK-AUTH-01–04 pass
- axe zero critical on list + add
- lint, typecheck, build pass
- PRD §14 acceptance criteria met
