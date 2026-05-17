# Modules

## Project

Healthcare Staffing Operations Platform

Purpose:
A SaaS platform for healthcare staffing agencies to coordinate workforce availability, fulfill staffing requests, manage shifts, and operate staffing workflows in real time.

---

# Module Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Module not started |
| IN_PROGRESS | Active implementation |
| READY_FOR_TEST | Awaiting testing |
| FAILED_TEST | Test failures detected |
| PASSED | Module completed and validated |
| BLOCKED | Waiting on dependency |

---

# Core Modules

| # | Module | Purpose | Status |
|---|---|---|---|
| 1 | Auth | Authentication, sessions, roles, invites, access control | READY_FOR_TEST |
| 2 | Agency Onboarding | Agency setup wizard and operational onboarding | FAILED_TEST |
| 3 | Operations Dashboard | Real-time staffing operations visibility | FAILED_TEST |
| 4 | Workforce | Healthcare professional management | FAILED_TEST |
| 5 | Facilities | Facility/customer management | FAILED_TEST |
| 6 | Staffing Requests | Staffing request lifecycle management | FAILED_TEST |
| 7 | Shifts | Shift creation, tracking, and fulfillment | FAILED_TEST |
| 8 | Matching & Assignments | Workforce matching and assignment workflows | FAILED_TEST |
| 9 | Healthcare Professional Portal | Shift acceptance and availability management | FAILED_TEST |
| 10 | Facility Portal | Facility staffing request and tracking portal | PENDING |
| 11 | Compliance | Credential tracking and compliance workflows | PENDING |
| 12 | Notifications & Alerts | Operational alerts and staffing notifications | PENDING |
| 13 | Activity Logs | Audit trail and operational activity tracking | PENDING |
| 14 | Settings | Agency configuration and preferences | PENDING |

---

# Recommended Build Order

## Phase 1: Foundation

1. Auth
2. Agency Onboarding
3. Operations Dashboard

**Before starting Phase 1:**
- Verify Auth authorization is correct: role-based redirects, agency-scoped access (403 on cross-agency), invite flows end-to-end. Do not start Onboarding until this passes.

**After each module in Phase 1:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 1 checkpoint (before starting Phase 2):**
- Run full T* test suite: Auth (T001–T026), Onboarding (T001–T020), Ops Dashboard (T*)
- All must pass before Phase 2 begins

---

## Phase 2: Core Operations

4. Workforce
5. Facilities
6. Staffing Requests
7. Shifts
8. Matching & Assignments

**Module seam checks (mandatory before starting each):**
- Before Staffing Requests (6): confirm Facilities (5) CRUD persists and is queryable
- Before Shifts (7): confirm Staffing Requests (6) creates and status-transitions correctly
- Before Matching (8): confirm Shifts (7) open/confirmed state and Workforce (4) availability queries work

**After each module in Phase 2:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 2 checkpoint (before starting Phase 3):**
- Run full T* test suite for modules 4–8
- All must pass before Phase 3 begins

---

## Phase 3: User Portals

9. Healthcare Professional Portal
10. Facility Portal

**After each module in Phase 3:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 3 checkpoint (before starting Phase 4):**
- Run full T* test suite for modules 9–10
- All must pass before Phase 4 begins

---

## Phase 4: Operational Systems

11. Compliance
12. Notifications & Alerts
13. Activity Logs
14. Settings

**After each module in Phase 4:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 4 checkpoint (MVP complete):**
- Run full T* test suite for modules 11–14
- Run a full end-to-end pass of the complete user journey (agency signup → onboard → create request → match → shift → complete)
- Fix all failures before declaring MVP ready

---

# MVP Scope

Modules required for MVP launch:

- Auth
- Agency Onboarding
- Operations Dashboard
- Workforce
- Facilities
- Staffing Requests
- Shifts
- Matching & Assignments
- Healthcare Professional Portal
- Notifications & Alerts
- Compliance

---

# Post-MVP Modules (Future)

Not included in current MVP:

- Payroll
- Billing & invoicing
- Marketplace discovery
- AI scheduling optimization
- Credential verification integrations
- Mobile native apps
- Analytics suite
- Calendar sync
- Messaging platform
- Vendor management integrations

---

# Engineering Rules

## Module Isolation

Each module must contain:

```text
prd.md
test.md
tasks.md