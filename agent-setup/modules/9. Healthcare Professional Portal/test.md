# Healthcare Professional Portal — Test Plan

## Module

Healthcare Professional Portal (`modules/9. Healthcare Professional Portal`)

## 1. Test Strategy

### Objectives

Validate provider-only access to `/my-shifts` and `/availability`, shift invite accept/decline with assignment status transitions, availability block CRUD with overlap rules, mobile-first responsive behavior, and zero cross-professional data leakage.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Portal routes, accept/decline, availability CRUD, auth redirects |
| Unit / Integration | Vitest | Zod schemas, overlap helpers, assignment transition guards |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

Seed users (document in `e2e/fixtures/seed.md` or test DB script):

| User | Role | Notes |
|---|---|---|
| `e2e-provider@example.com` | `provider` | Linked `healthcare_professionals.user_id` |
| `e2e-provider-unlinked@example.com` | `provider` | No HP row |
| `e2e-owner@example.com` | `agency_owner` | Agency A |
| `e2e-facility@example.com` | `facility_user` | Facility portal |

Seed data:

- Agency A with facility, staffing request, shift, assignment `invited` for provider
- Second overlapping shift + assignment for overlap tests
- 2–3 `availability_blocks` for provider

### File layout (required)

```
e2e/
  provider-portal/
    provider-access.spec.ts
    provider-shifts.spec.ts
    provider-availability.spec.ts
    provider-responsive.spec.ts
lib/
  validations/
    availability-block.test.ts
  provider/
    assignment-transitions.test.ts
    shift-overlap.test.ts
    resolve-professional.test.ts
app/
  api/
    provider/
      shifts/route.test.ts
      availability/route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/provider-portal/provider-access.spec.ts`

#### HPP-E2E-001: Unauthenticated blocked from my-shifts

**Steps**

1. Visit `/my-shifts` without session

**Expected**

- Redirect to `/login`
- `callbackUrl` includes `/my-shifts`

---

#### HPP-E2E-002: Provider lands on my-shifts after login

**Steps**

1. Log in as `e2e-provider@example.com`
2. Assert post-login URL

**Expected**

- `/my-shifts` loads
- Invites tab visible

---

#### HPP-E2E-003: Agency owner cannot access provider routes

**Steps**

1. Log in as `e2e-owner@example.com`
2. Visit `/my-shifts` and `/availability`

**Expected**

- Redirect to `/dashboard` (or unauthorized redirect per Auth)

---

#### HPP-E2E-004: Facility user cannot access provider routes

**Steps**

1. Log in as `e2e-facility@example.com`
2. Visit `/my-shifts`

**Expected**

- Redirect to `/facility/dashboard`

---

#### HPP-E2E-005: Unlinked provider sees empty state

**Steps**

1. Log in as `e2e-provider-unlinked@example.com`
2. Visit `/my-shifts`

**Expected**

- “Account not linked” (or PRD copy) visible
- No invite cards

---

### 2.2 `e2e/provider-portal/provider-shifts.spec.ts`

#### HPP-E2E-010: Invites tab lists pending invite

**Steps**

1. Log in as linked provider with seeded `invited` assignment
2. Open Invites tab

**Expected**

- Card shows facility name and shift time
- Status badge “Invited”

---

#### HPP-E2E-011: Accept shift invite

**Steps**

1. Open invite detail
2. Click **Accept shift** → confirm
3. Refresh page

**Expected**

- Toast success
- Assignment moves to Upcoming tab
- DB/API: `status = accepted`, `responded_at` set

---

#### HPP-E2E-012: Decline shift invite with reason

**Steps**

1. Seed second `invited` assignment
2. Decline with reason `schedule_conflict`

**Expected**

- Invite removed from Invites
- `status = declined`, `decline_reason` stored

---

#### HPP-E2E-013: Accept blocked on overlapping shift

**Steps**

1. Accept first assignment for overlapping time window
2. Attempt accept second overlapping invite

**Expected**

- Error message per PRD overlap copy
- Second assignment remains `invited`

---

#### HPP-E2E-014: Provider cannot accept another professional’s assignment

**Steps**

1. Call accept API/action with foreign `assignmentId` (API test or tampered form)

**Expected**

- 403 or 404
- No status change

---

### 2.3 `e2e/provider-portal/provider-availability.spec.ts`

#### HPP-E2E-020: List availability blocks

**Steps**

1. Log in as provider
2. Visit `/availability`

**Expected**

- Seeded blocks visible

---

#### HPP-E2E-021: Create availability block

**Steps**

1. Add block: tomorrow 08:00–16:00, status Available
2. Save

**Expected**

- Block appears in list
- Persists after refresh

---

#### HPP-E2E-022: Edit availability block

**Steps**

1. Edit block end time
2. Save

**Expected**

- Updated times shown

---

#### HPP-E2E-023: Delete availability block

**Steps**

1. Delete a block
2. Confirm dialog

**Expected**

- Block removed from list and DB

---

#### HPP-E2E-024: Reject overlapping block create

**Steps**

1. Create block overlapping existing

**Expected**

- Validation error displayed
- No duplicate row inserted

---

### 2.4 `e2e/provider-portal/provider-responsive.spec.ts`

#### HPP-E2E-030: Mobile viewport my-shifts

**Steps**

1. Set viewport 375×812
2. Visit `/my-shifts` with invite

**Expected**

- No horizontal scroll
- Sticky/footer actions visible without clipping

---

#### HPP-E2E-031: Mobile viewport availability form

**Steps**

1. Open add availability dialog on mobile

**Expected**

- Form fields usable; submit reachable

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/validations/availability-block.test.ts`

| ID | Case | Expected |
|---|---|---|
| HPP-UT-001 | Valid block | Pass |
| HPP-UT-002 | endAt before startAt | Fail |
| HPP-UT-003 | Duration < 30 min | Fail |
| HPP-UT-004 | Duration > 14 days | Fail |
| HPP-UT-005 | notes > 500 chars | Fail |
| HPP-UT-006 | status `on_shift` on create | Fail |

### 3.2 `lib/provider/shift-overlap.test.ts`

| ID | Case | Expected |
|---|---|---|
| HPP-UT-010 | Non-overlapping shifts | false |
| HPP-UT-011 | Partial overlap | true |
| HPP-UT-012 | Adjacent end=start | false |

### 3.3 `lib/provider/assignment-transitions.test.ts`

| ID | Case | Expected |
|---|---|---|
| HPP-UT-020 | invited → accepted | allowed |
| HPP-UT-021 | invited → declined | allowed |
| HPP-UT-022 | confirmed → accepted | denied |
| HPP-UT-023 | declined → accepted | denied |

### 3.4 `lib/provider/resolve-professional.test.ts`

| ID | Case | Expected |
|---|---|---|
| HPP-UT-030 | user with HP link | returns professionalId |
| HPP-UT-031 | user without link | null / error |

### 3.5 API route tests (mocked auth)

| ID | Case | Expected |
|---|---|---|
| HPP-UT-040 | GET shifts as provider | 200 scoped list |
| HPP-UT-041 | GET shifts as agency_owner | 403 |
| HPP-UT-042 | POST availability as provider | 201 |
| HPP-UT-043 | PATCH others’ block id | 403 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| HPP-AUTH-01 | Provider reads own assignments only | Pass |
| HPP-AUTH-02 | Provider mutates other professional’s block | 403 |
| HPP-AUTH-03 | agency_admin POST acceptShiftAssignmentAction | 403 |
| HPP-AUTH-04 | facility_user GET /api/provider/shifts | 403 |

---

## 5. Required Validation Tests

Covered by HPP-UT-001–006 and E2E HPP-E2E-024.

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| HPP-EDGE-01 | Accept cancelled shift assignment | Error |
| HPP-EDGE-02 | Double accept same assignment | Idempotent success |
| HPP-EDGE-03 | Decline already declined | Error |
| HPP-EDGE-04 | Create block 91 days in past | Rejected |
| HPP-EDGE-05 | Invite for shift already started | UI expired; accept disabled |

---

## 7. Responsive Tests

- HPP-E2E-030, HPP-E2E-031
- Manual optional: 320px width screenshot review

---

## 8. Accessibility Tests

| ID | Requirement |
|---|---|
| HPP-A11Y-01 | Invite accept/decline buttons have accessible names |
| HPP-A11Y-02 | Tab list for Invites/Upcoming/Past uses `role="tablist"` |
| HPP-A11Y-03 | Availability form fields have associated labels |
| HPP-A11Y-04 | Run axe on `/my-shifts` and `/availability` — no critical violations |

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
npx playwright test e2e/provider-portal
```

If scripts missing, Test Agent documents gap.

---

## 10. Pass Criteria

Module testing passes when:

- [ ] All HPP-E2E-* specs pass
- [ ] All HPP-UT-* unit tests pass
- [ ] HPP-AUTH-* verified
- [ ] HPP-EDGE-* verified
- [ ] HPP-A11Y-* satisfied
- [ ] lint, typecheck, build pass
- [ ] PRD section 14 acceptance criteria checklist signed off
