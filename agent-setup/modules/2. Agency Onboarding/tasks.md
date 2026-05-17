# Agency Onboarding Tasks

## Module Status

PENDING

---

# Task Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Active implementation |
| READY_FOR_TEST | Awaiting QA |
| FAILED_TEST | QA issues detected |
| PASSED | Task approved |
| BLOCKED | Waiting on dependency |

---

# Tasks

| ID | Task | Status |
|---|---|---|
| ONBOARD-001 | Create onboarding route structure | PENDING |
| ONBOARD-002 | Create onboarding layout shell | PENDING |
| ONBOARD-003 | Create onboarding progress sidebar | PENDING |
| ONBOARD-004 | Implement welcome/setup overview step | PENDING |
| ONBOARD-005 | Implement agency profile setup step | PENDING |
| ONBOARD-006 | Implement staffing specialties selector | PENDING |
| ONBOARD-007 | Implement service area setup step | PENDING |
| ONBOARD-008 | Integrate Google Places autocomplete | PENDING |
| ONBOARD-009 | Implement staffing radius selector | PENDING |
| ONBOARD-010 | Persist onboarding progress | PENDING |
| ONBOARD-011 | Implement workforce setup step | PENDING |
| ONBOARD-012 | Implement healthcare professional form | PENDING |
| ONBOARD-013 | Restrict professional locations to service area | PENDING |
| ONBOARD-014 | Implement facility setup step | PENDING |
| ONBOARD-015 | Implement facility form | PENDING |
| ONBOARD-016 | Restrict facility locations to service area | PENDING |
| ONBOARD-017 | Implement onboarding skip behavior | PENDING |
| ONBOARD-018 | Implement onboarding resume behavior | PENDING |
| ONBOARD-019 | Implement onboarding completion logic | PENDING |
| ONBOARD-020 | Redirect completed onboarding users to dashboard | PENDING |
| ONBOARD-021 | Add incomplete onboarding dashboard banner | PENDING |
| ONBOARD-022 | Add onboarding authorization protection | PENDING |
| ONBOARD-023 | Add loading states | PENDING |
| ONBOARD-024 | Add error and empty states | PENDING |
| ONBOARD-025 | Validate responsive layouts | PENDING |
| ONBOARD-026 | Run lint, typecheck, and build | PENDING |
| ONBOARD-027 | Hand off onboarding module to Test Agent | PENDING |

---

# Acceptance Criteria

Module is complete only when:
- onboarding flow works end-to-end
- onboarding progress persists
- onboarding resume works
- service area restrictions enforced
- workforce setup works
- facility setup works
- authorization enforced
- onboarding completion works
- dashboard redirect works
- build passes
- responsive behavior verified

---

# Code Agent Rules

- Work only on onboarding module tasks
- Do not redesign unrelated systems
- Do not expand scope
- Update task statuses correctly
- Stop after READY_FOR_TEST

---

# Test Agent Rules

- Validate only READY_FOR_TEST tasks
- Mark FAILED_TEST with reproduction steps
- Mark PASSED only after full validation
