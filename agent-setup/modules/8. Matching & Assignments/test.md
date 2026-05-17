# Matching & Assignments — Test Plan

## Module

Matching & Assignments (`modules/8. Matching & Assignments`)

## 1. Test Strategy

### Objectives

Validate matching candidate queries, invite creation, bulk invite, assignment status transitions (agency and provider), fulfillment sync, authorization, and agency isolation.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Match page, invite, embedded panel, provider accept/decline |
| Unit / Integration | Vitest | Filters, transitions, sync, permissions |
| Build | npm scripts | lint, typecheck, build, test |

### File layout

```
e2e/
  matching/
    matching-access.spec.ts
    matching-invite.spec.ts
    matching-assignment-response.spec.ts
    matching-embedded.spec.ts
    matching-responsive.spec.ts
lib/
  matching/
    filters.test.ts
    candidate-query.test.ts
  assignments/
    status-transitions.test.ts
    fulfillment-sync.test.ts
  auth/
    assignment-permissions.test.ts
app/
  api/
    shift-assignments/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `matching-access.spec.ts`

#### MATCH-E2E-001: Unauthenticated blocked from match route

**Steps:** Visit `/staffing-requests/{id}/match` without session.

**Expected:** Redirect `/login`.

---

#### MATCH-E2E-002: Provider cannot access agency match page

**Steps:** Login as provider; visit match URL.

**Expected:** Redirect to provider portal; no candidate table.

---

#### MATCH-E2E-003: Coordinator can access match page

**Expected:** Request header, shift selector, candidate list or empty state.

---

#### MATCH-E2E-004: Recruiter read-only cannot invite

**Steps:** Login recruiter; visit match page.

**Expected:** No invite buttons or API POST returns 403.

---

### 2.2 `matching-invite.spec.ts`

#### MATCH-E2E-010: Candidate list shows workforce

**Steps:** Seed 3 professionals matching role; open match page.

**Expected:** At least 3 rows with name and role.

---

#### MATCH-E2E-011: Filter available only

**Steps:** Toggle **Available only**.

**Expected:** Unavailable professionals hidden.

---

#### MATCH-E2E-012: Send single invite

**Steps:** Click **Invite** on available professional.

**Expected:** Row shows Invited; assignment row in invites section; shift status Matching.

---

#### MATCH-E2E-013: Duplicate invite blocked

**Steps:** Invite same professional again.

**Expected:** Toast error; single DB row.

---

#### MATCH-E2E-014: Bulk invite

**Steps:** Select 2 professionals; **Invite selected**.

**Expected:** 2 assignments `invited`; toast success count 2.

---

#### MATCH-E2E-015: Cancel invite

**Steps:** Cancel an `invited` assignment.

**Expected:** Status cancelled; can invite again.

---

#### MATCH-E2E-016: Cannot invite when shift full

**Steps:** Seed confirmed assignments equal to `required_count`; try invite.

**Expected:** Invite disabled or error.

---

### 2.3 `matching-assignment-response.spec.ts`

#### MATCH-E2E-020: Provider accepts invite

**Steps:**

1. Coordinator invites provider-linked professional
2. Login as that provider
3. Accept invite in provider portal (or test harness page)

**Expected:** Assignment `accepted` or `confirmed`; request shows partial/confirmed fulfillment.

---

#### MATCH-E2E-021: Provider declines with reason

**Steps:** Decline with reason "Schedule conflict".

**Expected:** `declined`; reason visible on agency match assignments list.

---

#### MATCH-E2E-022: Provider cannot accept another's assignment

**Steps:** Provider B attempts respond API for Provider A assignment.

**Expected:** 403.

---

#### MATCH-E2E-023: Coordinator confirms accepted assignment

**Steps:** With `autoConfirmOnAccept=false` seed; accept then coordinator **Confirm**.

**Expected:** `confirmed`; `confirmed_at` set.

---

### 2.4 `matching-embedded.spec.ts`

#### MATCH-E2E-030: Embedded panel on request detail

**Steps:** Open `/staffing-requests/[id]`.

**Expected:** Suggested matches section with ≤5 rows and **View all** link.

---

#### MATCH-E2E-031: View all navigates to match route

**Expected:** `/staffing-requests/[id]/match`.

---

### 2.5 `matching-responsive.spec.ts`

#### MATCH-E2E-040: Mobile match table 375px scroll

#### MATCH-E2E-041: Desktop 1280px full layout

---

## 3. Required Unit/Integration Tests

### `lib/matching/filters.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-001 | Role filter excludes wrong role | filtered out |
| MATCH-UT-002 | Available filter | only available |
| MATCH-UT-003 | Exclude already invited | not in list |
| MATCH-UT-004 | Credentials filter partial match | warning flag |

### `lib/matching/candidate-query.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-010 | Sort by reliability desc | order correct |
| MATCH-UT-011 | Distance sort tie-break | nearer first |

### `lib/assignments/status-transitions.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-020 | invited → accepted | allowed |
| MATCH-UT-021 | invited → declined | allowed |
| MATCH-UT-022 | declined → accepted | denied |
| MATCH-UT-023 | invited → cancelled (coordinator) | allowed |
| MATCH-UT-024 | accepted → confirmed | allowed |

### `lib/assignments/fulfillment-sync.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-030 | 1 accept of 2 required | request partially_filled |
| MATCH-UT-031 | 2 confirm of 2 | request confirmed, shift confirmed |
| MATCH-UT-032 | All declined, shift <24h | request at_risk |

### `lib/auth/assignment-permissions.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-040 | coordinator can invite | true |
| MATCH-UT-041 | provider owns assignment | true |
| MATCH-UT-042 | provider wrong assignment | false |

### `app/api/shift-assignments/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| MATCH-UT-050 | POST invite no session | 401 |
| MATCH-UT-051 | POST invite recruiter | 403 |
| MATCH-UT-052 | PATCH accept as provider | 200 |
| MATCH-UT-053 | Cross-agency assignment GET | 403 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| MATCH-AUTH-01 | Recruiter POST invite | 403 |
| MATCH-AUTH-02 | Coordinator POST invite | 201 |
| MATCH-AUTH-03 | Provider accept own | 200 |
| MATCH-AUTH-04 | Provider accept other | 403 |
| MATCH-AUTH-05 | Cross-agency match API | 403/404 |

---

## 5. Required Validation Tests

| ID | Area | Covered by |
|---|---|---|
| MATCH-VAL-01 | Decline reason min length | MATCH-E2E-021 |
| MATCH-VAL-02 | Bulk invite max slots | MATCH-E2E-014, MATCH-E2E-016 |
| MATCH-VAL-03 | shiftId belongs to request | integration |

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| MATCH-EDGE-01 | Invite on cancelled shift | 409/blocked |
| MATCH-EDGE-02 | Partial bulk failure | report per row |
| MATCH-EDGE-03 | Empty candidate pool | empty state |
| MATCH-EDGE-04 | Concurrent double invite | one wins unique index |

---

## 7. Responsive Tests

MATCH-E2E-040–041; MATCH-RESP-01 sticky shift selector mobile.

---

## 8. Accessibility Tests

| ID | Requirement |
|---|---|
| MATCH-A11Y-01 | Invite buttons have accessible names |
| MATCH-A11Y-02 | Compliance warning has text alternative |
| MATCH-A11Y-03 | axe match page zero critical |

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
npx vitest run lib/matching lib/assignments
npx playwright test e2e/matching
```

---

## 10. Pass Criteria

- All MATCH-E2E tests pass
- All MATCH-UT and MATCH-AUTH pass
- Fulfillment sync tests pass
- Build health exits 0
- PRD section 14 satisfied
- Provider accept/decline path verified (portal or test route)

---

## Test Agent Handoff Checklist

- [ ] Seed: agency, request, shift, 3+ professionals, provider user linked to professional
- [ ] Seed credentials for credential filter tests
- [ ] Document provider portal route for MATCH-E2E-020–021 if module 9 not ready (use API test + minimal `/provider/invites` stub)
