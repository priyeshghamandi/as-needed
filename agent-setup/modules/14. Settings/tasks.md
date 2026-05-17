# Settings — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Settings |
| Branch | `module/settings` |
| Status | READY_FOR_TEST |
| Depends on | Auth (invites); Agency Onboarding (shared agency columns); Activity Logs (`logActivity`) |

---

## 2. Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent actively implementing |
| READY_FOR_TEST | Implementation complete; awaiting Test Agent |
| FAILED_TEST | Test Agent found defects; needs fix |
| PASSED | Verified and approved |
| BLOCKED | Waiting on dependency or decision |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| SET-001 | Add `agency_preferences` jsonb migration on `agencies` | READY_FOR_TEST | Code Agent | `0004_agency_preferences.sql` |
| SET-002 | Create `lib/validations/agency-profile-settings.ts` | READY_FOR_TEST | Code Agent | Align onboarding fields |
| SET-003 | Create `lib/validations/agency-service-area-settings.ts` | READY_FOR_TEST | Code Agent | Radius 10–75 |
| SET-004 | Create `lib/validations/agency-preferences.ts` | READY_FOR_TEST | Code Agent | |
| SET-005 | Create `lib/settings/assert-can-manage-settings.ts` | READY_FOR_TEST | Code Agent | Owner/admin |
| SET-006 | Create `lib/settings/assert-can-view-settings.ts` | READY_FOR_TEST | Code Agent | All agency roles |
| SET-007 | Implement `GET /api/settings` aggregated DTO | READY_FOR_TEST | Code Agent | Optional but recommended |
| SET-008 | Implement `updateAgencyProfileAction` | READY_FOR_TEST | Code Agent | + logActivity |
| SET-009 | Implement `updateAgencyServiceAreaAction` | READY_FOR_TEST | Code Agent | Places + radius |
| SET-010 | Implement `updateAgencyPreferencesAction` | READY_FOR_TEST | Code Agent | JSON merge |
| SET-011 | Create `/settings` page with tab query routing | READY_FOR_TEST | Code Agent | 4 tabs |
| SET-012 | Build Profile tab form (RHF + Zod) | READY_FOR_TEST | Code Agent | |
| SET-013 | Build Service area tab with `LocationAutocomplete` | READY_FOR_TEST | Code Agent | |
| SET-014 | Build Team tab: invite form + `sendTeamInvitesAction` | READY_FOR_TEST | Code Agent | Reuse Auth |
| SET-015 | Build active members table from `user_roles` | READY_FOR_TEST | Code Agent | |
| SET-016 | Build pending invites table + `revokeTeamInviteAction` | READY_FOR_TEST | Code Agent | Auth wrapper OK |
| SET-017 | Build Preferences tab form | READY_FOR_TEST | Code Agent | |
| SET-018 | Add read-only mode for non-admin agency roles | READY_FOR_TEST | Code Agent | Banner + disabled |
| SET-019 | Add **Settings** to agency sidebar nav | READY_FOR_TEST | Code Agent | |
| SET-020 | Middleware: block provider/facility from `/settings` | READY_FOR_TEST | Code Agent | via `path-access` |
| SET-021 | Wire `logActivity` on each successful save | READY_FOR_TEST | Code Agent | `settings.updated` |
| SET-022 | Success/error toasts per PRD | READY_FOR_TEST | Code Agent | |
| SET-023 | Unsaved changes `beforeunload` guard | READY_FOR_TEST | Code Agent | Client only |
| SET-024 | Run lint, typecheck, build | READY_FOR_TEST | Code Agent | |
| SET-025 | Mark READY_FOR_TEST | READY_FOR_TEST | Code Agent | |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| SET-T001 | `agency-profile-settings.test.ts` | PENDING | Test Agent | SET-UT-001–004 |
| SET-T002 | `agency-service-area-settings.test.ts` | PENDING | Test Agent | SET-UT-010–012 |
| SET-T003 | `agency-preferences.test.ts` | PENDING | Test Agent | SET-UT-020–022 |
| SET-T004 | `assert-can-manage-settings.test.ts` | PENDING | Test Agent | SET-UT-030–032 |
| SET-T005 | `app/api/settings/route.test.ts` | PENDING | Test Agent | SET-UT-040–041 |
| SET-T006 | `e2e/settings/settings-access.spec.ts` | PENDING | Test Agent | SET-E2E-001–003 |
| SET-T007 | `e2e/settings/settings-profile.spec.ts` | PENDING | Test Agent | SET-E2E-010–011 |
| SET-T008 | `e2e/settings/settings-service-area.spec.ts` | PENDING | Test Agent | SET-E2E-020–021 |
| SET-T009 | `e2e/settings/settings-team.spec.ts` | PENDING | Test Agent | SET-E2E-030–031 |
| SET-T010 | `e2e/settings/settings-preferences.spec.ts` | PENDING | Test Agent | SET-E2E-040 |
| SET-T011 | `e2e/settings/settings-rbac.spec.ts` | PENDING | Test Agent | SET-E2E-050–052 |
| SET-T012 | `e2e/settings/settings-responsive.spec.ts` | PENDING | Test Agent | SET-E2E-060 |
| SET-T013 | SET-AUTH and SET-EDGE tests | PENDING | Test Agent | |
| SET-T014 | axe + build health | PENDING | Test Agent | |
| SET-T015 | Verify PRD §14 | PENDING | Test Agent | |

---

## 5. Acceptance Criteria

- `/settings` with four tabs and query sync
- Owner/admin write; other agency roles read-only on sensitive tabs
- Profile, service area, preferences persist correctly
- Team invites via Auth; revoke works
- `agency_preferences` jsonb used
- Activity logged on saves
- Provider/facility blocked
- No cross-agency writes
- All SET-T* pass; lint/typecheck/build pass

---

## 6. Code Agent Rules

- Branch `module/settings` only
- Reuse Auth invite actions; no duplicate invite tables
- Reuse onboarding validation lists for specialties and service area
- Do not implement billing or user password settings
- Call `logActivity` after successful mutations
- Update task statuses after each task
- Stop at READY_FOR_TEST

---

## 7. Test Agent Rules

- Tests/fixtures only
- Mark FAILED_TEST with reproduction
- PASSED after SET-T001–T015
