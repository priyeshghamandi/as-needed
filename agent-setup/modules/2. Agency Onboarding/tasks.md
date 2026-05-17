# Agency Onboarding — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Agency Onboarding |
| Branch | `module/agency-onboarding` |
| Status | PENDING |
| Depends on | Auth (`READY_FOR_TEST` / passed) |

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
| ONBOARD-001 | Add agency onboarding columns migration (`onboarding_*`, `service_area_radius_miles`, profile fields) | PENDING | Code Agent | Drizzle migration + schema |
| ONBOARD-002 | Extend `getAgencyServiceAreaForUser` to read `service_area_radius_miles` from DB | PENDING | Code Agent | `lib/agency/service-area.ts` |
| ONBOARD-003 | Create `lib/validations/onboarding-profile.ts` Zod schema | PENDING | Code Agent | Per PRD field rules |
| ONBOARD-004 | Create `lib/validations/onboarding-service-area.ts` | PENDING | Code Agent | Radius 10–75 |
| ONBOARD-005 | Create `lib/validations/onboarding-professional.ts` | PENDING | Code Agent | Role enum + invite flag |
| ONBOARD-006 | Create `lib/validations/onboarding-facility.ts` | PENDING | Code Agent | Facility type enum |
| ONBOARD-007 | Create `lib/onboarding/progress.ts` helpers (`calculateOnboardingPercent`, `getResumeStep`) | PENDING | Code Agent | Pure functions |
| ONBOARD-008 | Implement `GET /api/onboarding` (agency-scoped state) | PENDING | Code Agent | Owner/admin only |
| ONBOARD-009 | Implement `PATCH /api/onboarding/step` generic step saver | PENDING | Code Agent | Validates `stepId` |
| ONBOARD-010 | Implement `POST /api/onboarding/complete` | PENDING | Code Agent | Sets `onboarding_completed_at` |
| ONBOARD-011 | Implement `saveOnboardingProfileAction` | PENDING | Code Agent | Updates agency profile fields |
| ONBOARD-012 | Implement `saveOnboardingServiceAreaAction` | PENDING | Code Agent | Updates `primary_service_area_*` + radius |
| ONBOARD-013 | Implement `addOnboardingProfessionalAction` | PENDING | Code Agent | Insert `healthcare_professionals` + optional invite |
| ONBOARD-014 | Implement `addOnboardingFacilityAction` | PENDING | Code Agent | Insert `facilities` + optional facility invite |
| ONBOARD-015 | Add `assertCanManageOnboarding` authorization helper | PENDING | Code Agent | `agency_owner` \| `agency_admin` |
| ONBOARD-016 | Update `getPostLoginRedirect` to send incomplete onboarding owners to `/onboarding` | PENDING | Code Agent | `lib/auth/redirects.ts` |
| ONBOARD-017 | Redirect completed owners away from `/onboarding` to `/dashboard` | PENDING | Code Agent | Server page guard |
| ONBOARD-018 | Refactor `components/onboarding-app.tsx` to 7 PRD steps (remove compliance/first-request) | PENDING | Code Agent | Align step IDs with PRD |
| ONBOARD-019 | Implement Welcome step UI + start handler | PENDING | Code Agent | `stepId=welcome` |
| ONBOARD-020 | Implement Profile step form (RHF + Zod) | PENDING | Code Agent | Specialties multi-select |
| ONBOARD-021 | Implement Service Area step with `LocationAutocomplete` + radius | PENDING | Code Agent | Pre-fill signup data |
| ONBOARD-022 | Wire Team step to `sendTeamInvitesAction` | PENDING | Code Agent | Skip behavior |
| ONBOARD-023 | Implement Professionals step list + add form | PENDING | Code Agent | Service area validation client+server |
| ONBOARD-024 | Implement Facilities step list + add form | PENDING | Code Agent | Duplicate email check |
| ONBOARD-025 | Implement Complete step summary + Go to dashboard CTA | PENDING | Code Agent | Counts from DB |
| ONBOARD-026 | Persist `onboarding_current_step` on each navigation/save | PENDING | Code Agent | |
| ONBOARD-027 | Implement Save & exit header action | PENDING | Code Agent | Navigate to `/dashboard` |
| ONBOARD-028 | Add incomplete onboarding banner component on `/dashboard` | PENDING | Code Agent | Owner/admin only |
| ONBOARD-029 | Add loading and error toasts for all server actions | PENDING | Code Agent | |
| ONBOARD-030 | Add empty states for professionals/facilities lists | PENDING | Code Agent | Per PRD copy |
| ONBOARD-031 | Enforce server-side `isWithinServiceArea` on HP/facility location | PENDING | Code Agent | Reuse `lib/places/service-area-bounds` |
| ONBOARD-032 | Block onboarding completion if required steps missing | PENDING | Code Agent | profile + service-area |
| ONBOARD-033 | Run `npm run db:migrate` and verify schema | PENDING | Code Agent | |
| ONBOARD-034 | Run `npm run lint`, `npm run typecheck`, `npm run build` | PENDING | Code Agent | |
| ONBOARD-035 | Mark module READY_FOR_TEST and hand off notes | PENDING | Code Agent | List env vars, seed steps |

---

## 4. Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| ONBOARD-T001 | Create `lib/validations/onboarding-profile.test.ts` (ONB-UT-001–005) | PENDING | Test Agent | Vitest |
| ONBOARD-T002 | Create `lib/validations/onboarding-service-area.test.ts` (ONB-UT-010–013) | PENDING | Test Agent | |
| ONBOARD-T003 | Create `lib/validations/onboarding-professional.test.ts` (ONB-UT-020–023) | PENDING | Test Agent | |
| ONBOARD-T004 | Create `lib/validations/onboarding-facility.test.ts` (ONB-UT-030–032) | PENDING | Test Agent | |
| ONBOARD-T005 | Extend `lib/places/service-area-bounds.test.ts` (ONB-UT-040–043) | PENDING | Test Agent | |
| ONBOARD-T006 | Create `lib/onboarding/progress.test.ts` (ONB-UT-050–052) | PENDING | Test Agent | |
| ONBOARD-T007 | Create `app/api/onboarding/route.test.ts` (ONB-UT-060–063) | PENDING | Test Agent | Mock auth context |
| ONBOARD-T008 | Create `e2e/onboarding/onboarding-access.spec.ts` (ONB-E2E-001–005) | PENDING | Test Agent | Playwright |
| ONBOARD-T009 | Create `e2e/onboarding/onboarding-wizard.spec.ts` (ONB-E2E-010–019, 022) | PENDING | Test Agent | |
| ONBOARD-T010 | Create `e2e/onboarding/onboarding-persistence.spec.ts` (ONB-E2E-020–021) | PENDING | Test Agent | |
| ONBOARD-T011 | Create `e2e/onboarding/onboarding-responsive.spec.ts` (ONB-E2E-030–032) | PENDING | Test Agent | |
| ONBOARD-T012 | Add Playwright keyboard/a11y checks (ONB-A11Y-03) | PENDING | Test Agent | |
| ONBOARD-T013 | Run axe on welcome + profile steps (ONB-A11Y-05) | PENDING | Test Agent | |
| ONBOARD-T014 | Run authorization tests ONB-AUTH-01–03 | PENDING | Test Agent | |
| ONBOARD-T015 | Run edge case tests ONB-EDGE-01–06 | PENDING | Test Agent | |
| ONBOARD-T016 | Run `npm run lint` | PENDING | Test Agent | |
| ONBOARD-T017 | Run `npm run typecheck` | PENDING | Test Agent | |
| ONBOARD-T018 | Run `npm run build` | PENDING | Test Agent | |
| ONBOARD-T019 | Run `npm test` or `vitest run` + `playwright test e2e/onboarding` | PENDING | Test Agent | |
| ONBOARD-T020 | Verify PRD acceptance criteria section 14 | PENDING | Test Agent | Checklist sign-off |

---

## 5. Acceptance Criteria

Module is complete only when:

- Agency owner signup still redirects to `/onboarding` (Auth unchanged)
- Seven-step wizard matches `prd.md` (no compliance/first-request steps)
- Profile and service area steps are required; team/professionals/facilities skippable
- Service area radius stored and used for location validation
- Healthcare professionals and facilities created agency-scoped
- Team invites work via Auth `sendTeamInvitesAction`
- Onboarding progress persists across refresh
- Save & exit and dashboard banner work for incomplete onboarding
- Completion sets `onboarding_completed_at` and hides banner
- Completed users cannot re-enter wizard (redirect to dashboard)
- `provider` and `facility_user` cannot access `/onboarding`
- Cross-agency onboarding API access returns 403
- All ONBOARD-T* tests pass
- Lint, typecheck, and build pass

---

## 6. Code Agent Rules

- Read `prd.md` and `test.md` before starting
- Work only on `module/agency-onboarding` branch
- Do not implement Compliance or Staffing Request features inside onboarding
- Do not modify Auth module behavior except post-login redirect hook (ONBOARD-016)
- Reuse existing components: `LocationAutocomplete`, `sendTeamInvitesAction`, `service-area-bounds`
- Do not create duplicate invite systems
- All operational writes must include `agency_id` from session context
- Update task status in this file after each task
- Stop after marking module `READY_FOR_TEST` — do not mark PASSED

---

## 7. Test Agent Rules

- Read `test.md` before testing
- Do not write production feature code (tests and test fixtures only)
- Mark failed tasks `FAILED_TEST` with exact reproduction steps
- Mark `PASSED` only after ONBOARD-T001–T020 and acceptance criteria verified
- Run full build health commands even if Code Agent already ran them
- File defects against specific ONBOARD-* implementation tasks when possible
