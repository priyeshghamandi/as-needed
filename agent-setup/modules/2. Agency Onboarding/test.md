# Agency Onboarding — Test Plan

## Module

Agency Onboarding (`modules/2. Agency Onboarding`)

## 1. Test Strategy

### Objectives

Validate that agency owners and admins can complete the post-signup onboarding wizard, persist progress, enforce service-area geographic constraints, seed workforce/facility records, send team invites, and complete onboarding with correct redirects and authorization.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Wizard flows, route protection, redirects, responsive smoke |
| Unit / Integration | Vitest | Zod schemas, service-area distance checks, progress calculation, API handler auth |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

Use isolated test agencies via:

- Playwright: programmatic signup fixture or seeded DB user `e2e-owner@example.com` with known password
- Vitest: in-memory mocks for `isWithinServiceArea` inputs; DB integration tests optional with test database

### File layout (required)

```
e2e/
  onboarding/
    onboarding-access.spec.ts
    onboarding-wizard.spec.ts
    onboarding-persistence.spec.ts
    onboarding-responsive.spec.ts
lib/
  validations/
    onboarding-profile.test.ts
    onboarding-service-area.test.ts
    onboarding-professional.test.ts
    onboarding-facility.test.ts
  onboarding/
    progress.test.ts
  places/
    service-area-bounds.test.ts   # extend if not present
app/
  api/
    onboarding/
      route.test.ts               # optional integration with mocked auth
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/onboarding/onboarding-access.spec.ts`

#### ONB-E2E-001: Unauthenticated user blocked from onboarding

**Steps**

1. Visit `/onboarding` without session

**Expected**

- Redirect to `/login`
- `callbackUrl` query includes `/onboarding`

---

#### ONB-E2E-002: Agency owner can access onboarding after signup

**Steps**

1. Complete agency signup at `/signup` with valid data
2. Assert URL is `/onboarding`

**Expected**

- Welcome step visible
- Progress shows step 1 of 7

---

#### ONB-E2E-003: Provider cannot access onboarding

**Steps**

1. Log in as seeded `provider` test user
2. Visit `/onboarding`

**Expected**

- Redirect away from onboarding (provider portal route per Auth)
- No onboarding wizard content

---

#### ONB-E2E-004: Facility user cannot access onboarding

**Steps**

1. Log in as seeded `facility_user`
2. Visit `/onboarding`

**Expected**

- Redirect to facility portal area
- No onboarding wizard content

---

#### ONB-E2E-005: Completed onboarding redirects to dashboard

**Steps**

1. Log in as agency owner with `onboarding_completed_at` set (seed)
2. Visit `/onboarding`

**Expected**

- Redirect to `/dashboard`

---

### 2.2 `e2e/onboarding/onboarding-wizard.spec.ts`

#### ONB-E2E-010: Welcome → profile navigation

**Steps**

1. Log in as incomplete onboarding owner
2. Click **Start setup**

**Expected**

- Profile step visible
- `onboarding_current_step` updated (verify via API or UI indicator)

---

#### ONB-E2E-011: Profile step validation

**Steps**

1. On profile step, submit with empty required fields
2. Fill valid data and continue

**Expected**

- Inline validation errors on required fields
- Continue disabled until valid
- Successful advance to service area step

---

#### ONB-E2E-012: Service area radius validation

**Steps**

1. On service area step, set radius below minimum (9)
2. Set radius above maximum (76)
3. Set valid radius (50) and continue

**Expected**

- Errors for out-of-range values
- Valid radius saves and advances

---

#### ONB-E2E-013: Team step skip

**Steps**

1. Reach team step
2. Click **Skip for now**

**Expected**

- Advances to professionals step
- No invite required

---

#### ONB-E2E-014: Add healthcare professional in service area

**Steps**

1. On professionals step, add valid professional with location inside service area
2. Submit

**Expected**

- Professional appears in list
- No validation error

---

#### ONB-E2E-015: Reject professional outside service area

**Steps**

1. Attempt to add professional with location far outside agency radius (mock or test coordinate)

**Expected**

- Error message matches out-of-service-area copy
- No new professional row created

---

#### ONB-E2E-016: Duplicate professional email rejected

**Steps**

1. Add professional with `hp-a@test.com`
2. Add another with same email

**Expected**

- Second submit fails with duplicate message

---

#### ONB-E2E-017: Facilities step skip

**Steps**

1. Skip facilities step

**Expected**

- Lands on completion step

---

#### ONB-E2E-018: Complete onboarding redirects to dashboard

**Steps**

1. Complete required steps (profile, service area)
2. Skip optional steps or add data
3. On complete step, click **Go to dashboard**

**Expected**

- URL `/dashboard`
- Incomplete onboarding banner not visible

---

#### ONB-E2E-019: Dashboard banner links to onboarding

**Steps**

1. Log in as owner with incomplete onboarding
2. Visit `/dashboard`
3. Click **Continue setup**

**Expected**

- Navigates to `/onboarding`
- Resumes at saved step (not welcome if progress exists)

---

### 2.3 `e2e/onboarding/onboarding-persistence.spec.ts`

#### ONB-E2E-020: Progress survives refresh

**Steps**

1. Advance to `professionals` step and save
2. Reload page

**Expected**

- Still on professionals step
- Previously entered list data visible

---

#### ONB-E2E-021: Save and exit persists state

**Steps**

1. Advance to `facilities` step
2. Click **Save & exit**
3. Navigate to `/dashboard`
4. Return via banner CTA

**Expected**

- Opens at `facilities` step

---

### 2.4 `e2e/onboarding/onboarding-responsive.spec.ts`

#### ONB-E2E-030: Mobile layout smoke (375px)

**Steps**

1. Set viewport 375×812
2. Walk welcome → profile → service area

**Expected**

- No horizontal scroll on `document.documentElement`
- Primary CTA visible without overlap
- Progress indicator usable

---

#### ONB-E2E-031: Tablet layout smoke (768px)

**Steps**

1. Set viewport 768×1024
2. Open professionals step with list

**Expected**

- Form and list readable; no clipped buttons

---

#### ONB-E2E-032: Desktop layout smoke (1280px)

**Steps**

1. Set viewport 1280×800
2. Open welcome step

**Expected**

- Two-column hero layout renders per design

---

## 3. Required Unit and Integration Tests (Vitest)

### 3.1 `lib/validations/onboarding-profile.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-001 | Valid profile payload | Passes schema |
| ONB-UT-002 | Missing `staffingSpecialties` | Fails |
| ONB-UT-003 | More than 8 specialties | Fails |
| ONB-UT-004 | Invalid `operationalContactEmail` | Fails |
| ONB-UT-005 | Invalid optional `website` URL | Fails |

---

### 3.2 `lib/validations/onboarding-service-area.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-010 | Valid service area + radius 50 | Passes |
| ONB-UT-011 | Radius 9 | Fails |
| ONB-UT-012 | Radius 76 | Fails |
| ONB-UT-013 | Missing `placeId` | Fails |

---

### 3.3 `lib/validations/onboarding-professional.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-020 | Valid professional | Passes |
| ONB-UT-021 | `sendInvite` true without email | Fails |
| ONB-UT-022 | Missing both email and phone | Fails |
| ONB-UT-023 | Invalid role enum | Fails |

---

### 3.4 `lib/validations/onboarding-facility.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-030 | Valid facility | Passes |
| ONB-UT-031 | Invalid facility type | Fails |
| ONB-UT-032 | Invalid contact email | Fails |

---

### 3.5 `lib/places/service-area-bounds.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-040 | Point at center | `isWithinServiceArea` true |
| ONB-UT-041 | Point just inside radius | true |
| ONB-UT-042 | Point outside radius | false |
| ONB-UT-043 | `distanceMiles` known pair | Matches expected within tolerance |

---

### 3.6 `lib/onboarding/progress.test.ts`

| ID | Case | Expected |
|---|---|---|
| ONB-UT-050 | `calculateOnboardingPercent` with profile+service-area only | 100 after completion action |
| ONB-UT-051 | Skipped optional steps still allow 100% on complete | true |
| ONB-UT-052 | `getResumeStep` returns last incomplete required step | correct `stepId` |

---

### 3.7 `app/api/onboarding/route.test.ts` (integration, mocked auth)

| ID | Case | Expected |
|---|---|---|
| ONB-UT-060 | GET without session | 401 |
| ONB-UT-061 | GET as provider | 403 |
| ONB-UT-062 | GET as agency owner | 200 + agency onboarding payload |
| ONB-UT-063 | PATCH with wrong `agencyId` | 403 |

---

## 4. Required Authorization Tests

Covered by ONB-E2E-001 through ONB-E2E-005 and ONB-UT-060–063.

Additional manual/automated checks:

| ID | Scenario | Expected |
|---|---|---|
| ONB-AUTH-01 | `staffing_coordinator` PATCH `/api/onboarding/step` | 403 |
| ONB-AUTH-02 | Owner agency A cannot read agency B onboarding | 403 |
| ONB-AUTH-03 | `sendTeamInvitesAction` as recruiter | Error / forbidden |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| ONB-VAL-01 | Profile required fields | ONB-E2E-011, ONB-UT-001–005 |
| ONB-VAL-02 | Service area radius bounds | ONB-E2E-012, ONB-UT-010–013 |
| ONB-VAL-03 | Geographic autocomplete only | ONB-UT-013, manual E2E |
| ONB-VAL-04 | HP duplicate email | ONB-E2E-016 |
| ONB-VAL-05 | Facility duplicate contact email | Vitest + E2E (add ONB-E2E-022) |

#### ONB-E2E-022: Duplicate facility contact email rejected

**Steps**

1. Add facility with `facility-a@test.com`
2. Add second facility with same contact email

**Expected**

- Second submit fails with duplicate message

---

## 6. Required Error and Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| ONB-EDGE-01 | API failure on save | Toast error; form state retained |
| ONB-EDGE-02 | Complete without profile | Blocked with missing-step message |
| ONB-EDGE-03 | Complete without service area | Blocked |
| ONB-EDGE-04 | Team invite invalid email | Row error, other rows unaffected |
| ONB-EDGE-05 | Empty professionals list + skip | Completion allowed |
| ONB-EDGE-06 | Empty facilities list + skip | Completion allowed |

Implement ONB-EDGE-01–03 in Playwright; ONB-EDGE-04 in E2E or action unit test.

---

## 7. Responsive Tests

Required viewports:

- 375px (mobile)
- 768px (tablet)
- 1280px (desktop)

Covered by ONB-E2E-030 through ONB-E2E-032.

Additional check:

| ID | Check |
|---|---|
| ONB-RESP-01 | Touch targets ≥ 44px on primary CTAs (mobile) |
| ONB-RESP-02 | Progress labels truncate gracefully without overlap |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| ONB-A11Y-01 | All form inputs have associated labels | Playwright `getByLabel` locators |
| ONB-A11Y-02 | Step progress announced to screen readers (`nav` + `aria-current`) | Manual or axe |
| ONB-A11Y-03 | Keyboard: Tab through profile form and activate Continue | Playwright keyboard test |
| ONB-A11Y-04 | Validation errors linked via `aria-describedby` | DOM inspection |
| ONB-A11Y-05 | Focus visible on interactive elements | Visual / axe |

Minimum automated gate: run `@axe-core/playwright` on `/onboarding` welcome and profile steps — zero critical violations.

---

## 9. Build Health Checks

Run before marking module PASSED:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

If `npm test` does not exist, run:

```bash
npx vitest run
npx playwright test e2e/onboarding
```

Document any missing scripts in the module handoff notes.

---

## 10. Pass Criteria

The Agency Onboarding module passes testing only when:

- All ONB-E2E tests in `e2e/onboarding/` pass in CI
- All ONB-UT tests pass under Vitest
- Authorization scenarios ONB-AUTH-01–03 pass
- Responsive smokes ONB-E2E-030–032 pass
- Accessibility: no critical axe violations on welcome + profile steps
- `npm run lint` exits 0 (warnings documented if pre-existing)
- `npm run typecheck` exits 0
- `npm run build` exits 0
- No cross-agency data leakage in onboarding API tests
- PRD acceptance criteria in `prd.md` section 14 are satisfied

---

## Test Agent Handoff Checklist

- [ ] Seed users: `agency_owner` (incomplete), `agency_owner` (complete), `provider`, `facility_user`
- [ ] Configure `NEXT_PUBLIC_APP_URL` for invite URL assertions
- [ ] Run Playwright headed once to validate Google Places test stub/mocks
- [ ] File `FAILED_TEST` tasks in `tasks.md` with reproduction steps
