# Compliance — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Compliance |
| Branch | `module/compliance` |
| Status | PENDING |
| Depends on | Auth, Workforce |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent actively implementing |
| READY_FOR_TEST | Implementation complete; awaiting Test Agent |
| FAILED_TEST | Test Agent found defects; needs fix |
| PASSED | Verified and approved |
| BLOCKED | Waiting on dependency |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| COMP-MIG-01 | Add `credentials.review_notes` text nullable migration | PENDING | Code Agent | Drizzle + SQL |
| COMP-001 | Create `lib/validations/credential.ts` Zod schema | PENDING | Code Agent | COMP-045–047 |
| COMP-002 | Create `lib/compliance/credential-transitions.ts` | PENDING | Code Agent | COMP-030–034 |
| COMP-003 | Create `lib/compliance/compliance-auth.ts` assert write role | PENDING | Code Agent | manager/owner/admin |
| COMP-004 | Create `lib/compliance/expiry-display.ts` computed badge | PENDING | Code Agent | COMP-040 |
| COMP-005 | Implement `GET /api/compliance/credentials` | PENDING | Code Agent | Filters + KPIs |
| COMP-006 | Implement `GET /api/compliance/credentials/[id]` | PENDING | Code Agent | |
| COMP-007 | Implement `createCredentialAction` | PENDING | Code Agent | COMP-042–049 |
| COMP-008 | Implement `updateCredentialAction` | PENDING | Code Agent | |
| COMP-009 | Implement `verifyCredentialAction` | PENDING | Code Agent | Sets verifier fields |
| COMP-010 | Implement `rejectCredentialAction` | PENDING | Code Agent | review_notes |
| COMP-011 | Implement `updateCredentialStatusAction` | PENDING | Code Agent | Manual statuses |
| COMP-012 | Implement `deleteCredentialAction` | PENDING | Code Agent | Confirm in UI |
| COMP-013 | Build `app/(agency)/compliance/page.tsx` | PENDING | Code Agent | |
| COMP-014 | Build `CredentialsTable` with sorting | PENDING | Code Agent | shadcn Table |
| COMP-015 | Build `ComplianceKpiCards` | PENDING | Code Agent | COMP-018 |
| COMP-016 | Build filter toolbar (status, professional, expiry, search) | PENDING | Code Agent | |
| COMP-017 | Build `CredentialDetailSheet` | PENDING | Code Agent | |
| COMP-018 | Build `AddCredentialDialog` with professional combobox | PENDING | Code Agent | |
| COMP-019 | Build `RejectCredentialDialog` | PENDING | Code Agent | Reason required |
| COMP-020 | Build status badge mapper COMP-060 | PENDING | Code Agent | |
| COMP-021 | Route guard middleware/page check COMP-001–004 | PENDING | Code Agent | |
| COMP-022 | Add Compliance link to agency sidebar (authorized roles) | PENDING | Code Agent | |
| COMP-023 | Run lint, typecheck, build | PENDING | Code Agent | |
| COMP-024 | Mark READY_FOR_TEST | PENDING | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| COMP-T001 | Seed credentials across statuses + Agency B row | PENDING | Test Agent | |
| COMP-T002 | `credential.test.ts` COMP-UT-001–004 | PENDING | Test Agent | |
| COMP-T003 | `credential-transitions.test.ts` COMP-UT-010–014 | PENDING | Test Agent | |
| COMP-T004 | `compliance-auth.test.ts` COMP-UT-020–022 | PENDING | Test Agent | |
| COMP-T005 | API tests COMP-UT-030–032 | PENDING | Test Agent | |
| COMP-T006 | `compliance-access.spec.ts` COMP-E2E-001–005 | PENDING | Test Agent | |
| COMP-T007 | `compliance-table.spec.ts` COMP-E2E-010–014 | PENDING | Test Agent | |
| COMP-T008 | `compliance-actions.spec.ts` COMP-E2E-020–026 | PENDING | Test Agent | |
| COMP-T009 | Responsive COMP-E2E-030–031 | PENDING | Test Agent | |
| COMP-T010 | COMP-AUTH + COMP-EDGE | PENDING | Test Agent | |
| COMP-T011 | COMP-A11Y checks | PENDING | Test Agent | |
| COMP-T012 | Build health + PRD sign-off | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- `/compliance` for compliance_manager, agency_owner, agency_admin only
- Full credentials table with filters and KPIs
- Verify/reject/create/update/delete on `credentials` table
- `CredentialStatusEnum` respected
- Agency isolation enforced
- All COMP-T* pass; build green

---

## 6. Code Agent Rules

- Branch `module/compliance` only
- Use existing `CredentialTable` schema; minimal migration for `review_notes` only
- Do not build provider upload UI
- Do not grant coordinator access in MVP
- Update task table as work progresses

---

## 7. Test Agent Rules

- Read `test.md` first
- Mark PASSED only after COMP-T001–T012
