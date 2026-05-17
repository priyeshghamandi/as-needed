# Settings — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Settings |
| Branch | `module/settings` |
| Status | PENDING |
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
| SET-001 | Add `agency_preferences` jsonb migration on `agencies` | PENDING | Code Agent | If not exists |
| SET-002 | Create `lib/validations/agency-profile-settings.ts` | PENDING | Code Agent | Align onboarding fields |
| SET-003 | Create `lib/validations/agency-service-area-settings.ts` | PENDING | Code Agent | Radius 10–75 |
| SET-004 | Create `lib/validations/agency-preferences.ts` | PENDING | Code Agent | |
| SET-005 | Create `lib/settings/assert-can-manage-settings.ts` | PENDING | Code Agent | Owner/admin |
| SET-006 | Create `lib/settings/assert-can-view-settings.ts` | PENDING | Code Agent | All agency roles |
| SET-007 | Implement `GET /api/settings` aggregated DTO | PENDING | Code Agent | Optional but recommended |
| SET-008 | Implement `updateAgencyProfileAction` | PENDING | Code Agent | + logActivity |
| SET-009 | Implement `updateAgencyServiceAreaAction` | PENDING | Code Agent | Places + radius |
| SET-010 | Implement `updateAgencyPreferencesAction` | PENDING | Code Agent | JSON merge |
| SET-011 | Create `/settings` page with tab query routing | PENDING | Code Agent | 4 tabs |
| SET-012 | Build Profile tab form (RHF + Zod) | PENDING | Code Agent | |
| SET-013 | Build Service area tab with `LocationAutocomplete` | PENDING | Code Agent | |
| SET-014 | Build Team tab: invite form + `sendTeamInvitesAction` | PENDING | Code Agent | Reuse Auth |
| SET-015 | Build active members table from `user_roles` | PENDING | Code Agent | |
| SET-016 | Build pending invites table + `revokeTeamInviteAction` | PENDING | Code Agent | Auth wrapper OK |
| SET-017 | Build Preferences tab form | PENDING | Code Agent | |
| SET-018 | Add read-only mode for non-admin agency roles | PENDING | Code Agent | Banner + disabled |
| SET-019 | Add **Settings** to agency sidebar nav | PENDING | Code Agent | |
| SET-020 | Middleware: block provider/facility from `/settings` | PENDING | Code Agent | |
| SET-021 | Wire `logActivity` on each successful save | PENDING | Code Agent | `settings.updated` |
| SET-022 | Success/error toasts per PRD | PENDING | Code Agent | |
| SET-023 | Unsaved changes `beforeunload` guard | PENDING | Code Agent | Client only |
| SET-024 | Run lint, typecheck, build | PENDING | Code Agent | |
| SET-025 | Mark READY_FOR_TEST | PENDING | Code Agent | |

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
