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
| 2 | Agency Onboarding | Agency setup wizard and operational onboarding | PENDING |
| 3 | Operations Dashboard | Real-time staffing operations visibility | PENDING |
| 4 | Workforce | Healthcare professional management | PENDING |
| 5 | Facilities | Facility/customer management | PENDING |
| 6 | Staffing Requests | Staffing request lifecycle management | PENDING |
| 7 | Shifts | Shift creation, tracking, and fulfillment | PENDING |
| 8 | Matching & Assignments | Workforce matching and assignment workflows | PENDING |
| 9 | Healthcare Professional Portal | Shift acceptance and availability management | PENDING |
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

---

## Phase 2: Core Operations

4. Workforce
5. Facilities
6. Staffing Requests
7. Shifts
8. Matching & Assignments

---

## Phase 3: User Portals

9. Healthcare Professional Portal
10. Facility Portal

---

## Phase 4: Operational Systems

11. Compliance
12. Notifications & Alerts
13. Activity Logs
14. Settings

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