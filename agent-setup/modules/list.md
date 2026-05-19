# Modules

## Project

Hybrid Healthcare Staffing Marketplace and Agency Operations Platform

Purpose:
A platform where customers discover eligible healthcare professionals through public category and search experiences, submit staffing requests routed to owning agencies, and agencies fulfill with confirmation or suggested alternatives—while agencies retain workforce ownership, operational control, and internal shift coordination.

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

## Foundation and agency operations

| # | Module | Purpose | Status |
|---|---|---|---|
| 1 | Auth | Authentication, sessions, roles, invites, access control | READY_FOR_TEST |
| 2 | Agency Onboarding | Agency setup wizard, service area, operational onboarding | FAILED_TEST |
| 3 | Operations Dashboard | Real-time staffing operations visibility | FAILED_TEST |
| 4 | Workforce | Healthcare professional management (agency-owned) | FAILED_TEST |
| 5 | Facilities | Facility/customer management | FAILED_TEST |
| 6 | Staffing Requests | Staffing request lifecycle (including marketplace-originated requests) | FAILED_TEST |
| 7 | Shifts | Shift creation, tracking, and fulfillment | FAILED_TEST |
| 8 | Matching & Assignments | Internal workforce matching and assignment workflows | FAILED_TEST |
| 9 | Healthcare Professional Portal | Shift acceptance and availability management | FAILED_TEST |
| 10 | Facility Portal | Customer request tracking and agency coordination (authenticated) | PENDING |
| 11 | Compliance | Credential tracking and compliance workflows | PENDING |
| 12 | Notifications & Alerts | Operational alerts and staffing notifications | PENDING |
| 13 | Activity Logs | Audit trail and operational activity tracking | PENDING |
| 14 | Settings | Agency configuration and preferences | PENDING |

## Marketplace discovery and eligibility

| # | Module | Purpose | Status |
|---|---|---|---|
| 15 | Marketplace Eligibility Rules | Opt-in visibility, geography/service-area enforcement, public eligibility gates | PENDING |
| 16 | Category Directory | Public SEO category pages and browse-by-role structure | COMPLETE |
| 17 | Professional Public Profiles | Agency-controlled opt-in public profiles with approximate availability | PENDING |
| 18 | Marketplace Search | Public search: role + location + shift need with mandatory geo filtering | PENDING |
| 19 | Public Marketplace | Public discovery shell, listings integration, Request Professional entry | PENDING |

## Marketplace request and fulfillment

| # | Module | Purpose | Status |
|---|---|---|---|
| 20 | Customer Requests | Customer selects professionals → creates staffing request | PENDING |
| 21 | Request Routing | Route staffing requests to owning agency by professional selection | PENDING |
| 22 | Agency Fulfillment Review | Agency confirms requested professional or declines with reason | PENDING |
| 23 | Alternative Suggestions | Agency proposes suggested alternative; customer approval flow | PENDING |
| 24 | Consumer Home Care | Self-serve consumers (home care) without agency invite; care site + shared customer request flow | COMPLETE |

---

# Recommended Build Order

## Phase 1: Foundation

1. Auth
2. Agency Onboarding
3. Operations Dashboard

**Before starting Phase 1:**
- Verify Auth authorization: role-based redirects, agency-scoped access (403 on cross-agency), invite flows end-to-end. Do not start Onboarding until this passes.

**After each module in Phase 1:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 1 checkpoint (before Phase 2):**
- Run full T* test suite: Auth, Onboarding, Ops Dashboard
- All must pass before Phase 2 begins

---

## Phase 2: Agency core operations

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

**End of Phase 2 checkpoint (before Phase 3):**
- Run full T* test suite for modules 4–8
- All must pass before Phase 3 begins

---

## Phase 3: Marketplace eligibility and discovery

15. Marketplace Eligibility Rules
16. Category Directory
17. Professional Public Profiles
18. Marketplace Search
19. Public Marketplace

**Dependencies:**
- Marketplace Eligibility Rules requires Workforce (4) and Agency Onboarding (2) service areas
- Professional Public Profiles requires Workforce (4) and Marketplace Eligibility Rules (15)
- Marketplace Search and Public Marketplace require Category Directory (16) and eligibility rules (15)

**After each module in Phase 3:**
- `npm run typecheck` + `npm run build` must pass
- Verify geo fail-closed: no out-of-area professionals in listings or search
- Verify opt-out professionals never appear on public routes

**End of Phase 3 checkpoint (before Phase 4):**
- Run full T* test suite for modules 15–19
- Manual pass: browse category → search → view public profile (in-area only)

---

## Phase 4: Marketplace request and agency fulfillment

20. Customer Requests
21. Request Routing
22. Agency Fulfillment Review
23. Alternative Suggestions
24. Consumer Home Care

**Dependencies:**
- Customer Requests requires Public Marketplace (19), Staffing Requests (6), Facilities (5)
- Request Routing requires Customer Requests (20) and Workforce agency ownership model
- Agency Fulfillment Review requires Request Routing (21) and Staffing Requests (6)
- Alternative Suggestions requires Agency Fulfillment Review (22)
- Consumer Home Care requires Customer Requests (20), Request Routing (21), Auth (1), Public Marketplace (19); extends Auth with `consumer` role and care site model

**After each module in Phase 4:**
- `npm run typecheck` + `npm run build` must pass
- Walk golden path: Request Professional → routed to agency → confirm or suggest alternative → customer approves

**End of Phase 4 checkpoint (before Phase 5):**
- Run full T* test suite for modules 20–24
- Confirm no direct customer ↔ professional messaging was introduced
- Confirm invited `facility_user` path still works after Consumer Home Care (24)

---

## Phase 5: User portals

9. Healthcare Professional Portal
10. Facility Portal

**After each module in Phase 5:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 5 checkpoint (before Phase 6):**
- Run full T* test suite for modules 9–10
- All must pass before Phase 6 begins

---

## Phase 6: Operational systems

11. Compliance
12. Notifications & Alerts
13. Activity Logs
14. Settings

**After each module in Phase 6:**
- `npm run typecheck` + `npm run build` must pass
- Walk the golden path for that module manually

**End of Phase 6 checkpoint (MVP complete):**
- Run full T* test suite for modules 11–14
- Run end-to-end hybrid journey:
  - agency signup → onboard → add workforce → enable marketplace opt-in
  - public search → select professional → Request Professional
  - request routes to agency → confirm or suggest alternative → customer approves → shift confirmed
- Fix all failures before declaring MVP ready

---

# MVP Scope

Modules required for MVP launch:

**Foundation and operations**
- Auth
- Agency Onboarding
- Operations Dashboard
- Workforce
- Facilities
- Staffing Requests
- Shifts
- Matching & Assignments
- Healthcare Professional Portal
- Facility Portal
- Notifications & Alerts
- Compliance

**Marketplace**
- Marketplace Eligibility Rules
- Category Directory
- Professional Public Profiles
- Marketplace Search
- Public Marketplace
- Customer Requests
- Request Routing
- Agency Fulfillment Review
- Alternative Suggestions
- Consumer Home Care

---

# Post-MVP Modules (Future)

Not included in current MVP:

- Payroll
- Billing & invoicing
- Direct customer ↔ professional messaging
- Consumer payments or insurance intake
- AI scheduling optimization
- Credential verification integrations
- Mobile native apps
- Analytics suite
- Calendar sync
- Multi-agency professional sharing / float pools
- Vendor management integrations
- Advanced multi-region service areas

---

# Engineering Rules

## Module Isolation

Each module must contain:

```text
prd.md
test.md
tasks.md
```

Each module is implementation-focused and production-oriented:

- clear boundaries between public discovery and agency operations
- no cross-module leakage of exact availability to public surfaces
- agency ownership and fulfillment authority preserved in all flows
- geography and opt-in rules enforced at module boundaries
- customer flows terminate in staffing requests, not direct hire or booking

## Marketplace module principles

- **Marketplace Eligibility Rules**: single source of truth for opt-in and geo eligibility checks used by discovery modules
- **Public modules** (15–19): read-only public data; no agency ops mutations
- **Request modules** (20–21): create and route staffing requests only
- **Fulfillment modules** (22–23): agency actions and customer approval; integrate with Staffing Requests and Shifts
- **Consumer Home Care** (24): self-serve `consumer` role and care site; reuses customer request routes (20) and routing (21); does not replace invite-only facility users (10)

## Terminology (enforced across modules)

Use:
- Request Professional
- Staffing Request
- Fulfillment
- Suggested Alternative

Avoid:
- Booking / Book Now
- Hire / Direct Hire
- Open marketplace / gig language
