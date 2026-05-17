# Compliance — Test Plan

## Module

Compliance (`modules/11. Compliance`)

## 1. Test Strategy

### Objectives

Validate `/compliance` route protection for compliance_manager/owner/admin, credentials table list/filters, CRUD and status transitions on `credentials` using `CredentialStatusEnum`, agency isolation, and KPI accuracy.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Access, verify/reject, create, filters |
| Unit / Integration | Vitest | Zod, status transitions, agency scope |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

| User | Role |
|---|---|
| `e2e-compliance@example.com` | `compliance_manager` |
| `e2e-owner@example.com` | `agency_owner` |
| `e2e-coordinator@example.com` | `staffing_coordinator` |
| `e2e-provider@example.com` | `provider` |

Seed Agency A:

- 2 professionals
- Credentials: 1 `pending_review`, 1 `verified`, 1 `expiring_soon`, 1 `expired`, 1 `rejected`
- Agency B: 1 credential (isolation test)

### File layout

```
e2e/
  compliance/
    compliance-access.spec.ts
    compliance-table.spec.ts
    compliance-actions.spec.ts
lib/
  validations/
    credential.test.ts
  compliance/
    credential-transitions.test.ts
    compliance-auth.test.ts
app/
  api/
    compliance/
      credentials/route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `compliance-access.spec.ts`

#### COMP-E2E-001: Unauthenticated redirect

Visit `/compliance` → `/login` with callback.

#### COMP-E2E-002: Compliance manager access

Login `e2e-compliance@example.com` → `/compliance` loads table.

#### COMP-E2E-003: Agency owner access

Login owner → `/compliance` loads.

#### COMP-E2E-004: Coordinator denied

Login coordinator → visit `/compliance` → redirect `/dashboard`.

#### COMP-E2E-005: Provider denied

Login provider → redirect `/my-shifts`.

---

### 2.2 `compliance-table.spec.ts`

#### COMP-E2E-010: Default table shows credentials

Compliance manager → table has ≥1 row; columns visible.

#### COMP-E2E-011: Status filter pending

Filter `pending_review` → only pending rows.

#### COMP-E2E-012: Search by professional name

Search partial name → matching rows only.

#### COMP-E2E-013: KPI cards match counts

Compare KPI pending count to filtered table count (seed-dependent).

#### COMP-E2E-014: Expiry preset next 30 days

Filter → includes credential expiring within 30 days.

---

### 2.3 `compliance-actions.spec.ts`

#### COMP-E2E-020: Verify pending credential

Open pending row → **Verify** → badge Verified; refresh persists.

**DB**

- `status = verified`
- `verified_at` not null
- `verified_by_user_id` = actor

---

#### COMP-E2E-021: Reject with reason

Reject pending → enter reason → status Rejected; `review_notes` set if migration applied.

---

#### COMP-E2E-022: Create credential

Add credential for professional → appears as Pending review.

---

#### COMP-E2E-023: Edit credential name

Edit row → save → updated in table.

---

#### COMP-E2E-024: Delete credential with confirm

Delete → confirm → row removed.

---

#### COMP-E2E-025: Cross-agency credential 404

Request detail API/page for Agency B credential id while logged into Agency A → not found.

---

#### COMP-E2E-026: Manual mark expired

Change status via action dropdown to Expired → badge updates.

---

## 3. Required Unit/Integration Tests

### `credential.test.ts`

| ID | Case | Expected |
|---|---|---|
| COMP-UT-001 | valid create payload | pass |
| COMP-UT-002 | expires before issued | fail |
| COMP-UT-003 | name empty | fail |
| COMP-UT-004 | invalid documentUrl | fail |

### `credential-transitions.test.ts`

| ID | Case | Expected |
|---|---|---|
| COMP-UT-010 | pending → verified | allowed |
| COMP-UT-011 | pending → rejected | allowed |
| COMP-UT-012 | verified → pending via reopen | allowed |
| COMP-UT-013 | rejected → verified direct | denied |
| COMP-UT-014 | expired → verified without pending | denied |

### `compliance-auth.test.ts`

| ID | Case | Expected |
|---|---|---|
| COMP-UT-020 | assertComplianceWriteRole compliance_manager | pass |
| COMP-UT-021 | assertComplianceWriteRole recruiter | fail |
| COMP-UT-022 | professionalId wrong agency | fail |

### API route tests

| ID | Case | Expected |
|---|---|---|
| COMP-UT-030 | GET list scoped to agency | 200 |
| COMP-UT-031 | POST verify as coordinator | 403 |
| COMP-UT-032 | GET credential other agency | 404 |

---

## 4. Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| COMP-AUTH-01 | compliance_manager verify | 200 |
| COMP-AUTH-02 | agency_admin create | 200 |
| COMP-AUTH-03 | staffing_coordinator verify | 403 |
| COMP-AUTH-04 | provider list API | 403 |

---

## 5. Validation Tests

COMP-UT-001–004, COMP-E2E-022 field validation.

---

## 6. Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| COMP-EDGE-01 | Verify already verified | error message |
| COMP-EDGE-02 | Reject without reason | validation fail |
| COMP-EDGE-03 | Create for inactive professional | 400/404 |
| COMP-EDGE-04 | Computed expiring badge (COMP-040) | shows warning when within 30d |

---

## 7. Responsive Tests

| ID | Test |
|---|---|
| COMP-E2E-030 | 1280px table layout no broken header |
| COMP-E2E-031 | 375px filter sheet opens and applies |

---

## 8. Accessibility Tests

| ID | Requirement |
|---|---|
| COMP-A11Y-01 | Table headers associated with cells |
| COMP-A11Y-02 | Verify/Reject buttons named |
| COMP-A11Y-03 | axe on `/compliance` — no critical violations |

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
npx playwright test e2e/compliance
```

---

## 10. Pass Criteria

- [ ] All COMP-E2E-* pass
- [ ] All COMP-UT-* pass
- [ ] COMP-AUTH-* and COMP-EDGE-* pass
- [ ] Migration `review_notes` applied if COMP-MIG-01 in scope
- [ ] Build health green
- [ ] PRD §14 complete
