# Facility Portal PRD

## 1. Module Overview

The Facility Portal module gives invited facility users (`facility_user` role) a focused interface to create staffing requests for **their facility only** and track request fulfillment status.

This module is responsible for:

- `/facility/dashboard` — operational summary for the user’s facility
- `/facility/requests` — list and detail of staffing requests for that facility
- `/facility/requests/new` — create staffing request wizard/form
- Facility scoping via resolved `facilityId` (from accepted `user_invites.facility_id` for the user)
- Agency-scoped data: all queries include `agency_id` from invite + `facility_id` match

This module does **not** implement:

- Agency-side staffing request management UI (Staffing Requests module)
- Professional matching or assignment (Matching & Assignments)
- Shift editing by facility users (read-only visibility where noted)
- Facility user invite creation (Facilities / Auth)
- Messaging platform (simple “contact coordinator” mailto/link only)
- Request cancel/update flows beyond MVP read + create (update/cancel post-MVP; see Out of Scope)

**Depends on:** Auth (facility invite + role), Facilities (facility record), Staffing Requests schema.

---

## 2. Goals

### Primary Goals

- Let facility contacts submit staffing needs without calling the agency
- Show real-time request status and fulfillment progress for their site only
- Prevent access to other facilities’ or agencies’ data
- Provide clear operational language (Staffing Request, not “job posting”)

### Secondary Goals

- Dashboard KPIs: open requests, at-risk count, upcoming coverage
- Surface assigned professionals on confirmed requests (read-only cards)
- Mobile-responsive layout (not as mobile-first as provider portal, but usable on tablet)

---

## 3. Non-Goals (MVP)

- Facility self-signup without agency invite
- Multi-facility users (one facility per account in MVP)
- Editing or cancelling requests after submit (display status only; cancel in Out of Scope future)
- Creating shifts directly (agency/coordinator creates shifts from requests)
- Billing, contracts, or rate negotiation
- Full messaging/chat
- CSV export
- Analytics dashboards

---

## 4. Primary Users

| User | Role | Access |
|---|---|---|
| Facility contact | `facility_user` | Own facility dashboard + requests |
| Agency users | agency roles | Use agency `/staffing-requests`, not facility portal |
| Provider | `provider` | No access |
| Unauthenticated | — | `/login?callbackUrl=...` |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Post-login (Auth) | `facility_user` | `/facility/dashboard` |
| Invite acceptance | Accept facility invite with `facilityId` | Session can resolve facility |
| Direct `/facility/requests` | Authenticated facility user | Request list |
| `/facility/requests/new` | Authenticated facility user | Create form |

### Facility resolution rule (MVP)

Resolve `facilityId` + `agencyId` for session user:

1. Find most recent `user_invites` where `email = user.email`, `role = facility_user`, `status = accepted`, `facility_id IS NOT NULL`.
2. If none: blocking empty state **No facility linked** (contact agency).

> Implementation note: If product requires multiple facilities per user later, add `user_facility_assignments` table; out of scope for MVP.

---

## 6. User Flows

### Flow A: Facility dashboard overview

1. User logs in → `/facility/dashboard`.
2. Header shows facility name + agency name (read-only).
3. KPI row: Open Requests, At Risk, Confirmed This Week, Upcoming Shifts (count queries scoped to `facility_id`).
4. **Active staffing requests** table (max 5, link to full list).
5. **Upcoming assigned staff** section: professionals on confirmed shifts in next 14 days (via assignments).
6. Primary CTA: **Create staffing request** → `/facility/requests/new`.

### Flow B: Create staffing request

1. User opens `/facility/requests/new`.
2. Form fields (see §8) validated client + server.
3. On submit:
   - Insert `staffing_requests` with `agency_id`, `facility_id` from context, `created_by_user_id = session.user.id`, `status = 'open'`.
   - Do not create shifts in this module (Shifts module / coordinator workflow).
4. Redirect to `/facility/requests/[id]` detail with success toast.

### Flow C: Track request list

1. User visits `/facility/requests`.
2. Table: title, role needed, status badge, professionals required/assigned counts, priority, created date, coordinator name.
3. Filters: status (multi), priority, date range (created).
4. Sort: created desc default.
5. Row click → detail route `/facility/requests/[id]` (same module).

### Flow D: Request detail and fulfillment timeline

1. Detail page shows request header + status badge.
2. **Fulfillment timeline** (visual stepper, status-derived — not separate table):

| Step | Shown when |
|---|---|
| Request Submitted | always |
| Matching Started | `status` in matching, partially_filled, confirmed, completed, at_risk |
| Professionals Contacted | `status` in partially_filled, confirmed, completed, at_risk OR assignments exist |
| Shift Assigned | ≥1 assignment `accepted|confirmed|...` |
| Confirmed | `status = confirmed` |
| Shift Active | any linked shift `active` |
| Completed | `status = completed` |

3. **Assigned professionals** cards (if any): name, role, shift time, assignment status; compliance badge if all required credentials verified (read-only join).
4. **Coordinator** block: name, email from `assigned_coordinator_id` or agency default copy if null.

### Flow E: Unauthorized facility access attempt

1. User tampers `requestId` belonging to another facility.
2. Server returns 404 (not 403, to avoid enumeration).

---

## 7. Screens or Pages

### Routes

| Route | Description | Auth |
|---|---|---|
| `/facility/dashboard` | KPIs + snippets | `facility_user` |
| `/facility/requests` | Filterable list | `facility_user` |
| `/facility/requests/new` | Create form | `facility_user` |
| `/facility/requests/[id]` | Detail + timeline | `facility_user` |

### Navigation (facility shell)

- Dashboard
- Requests
- (Settings/messages out of scope)

---

## 8. Functional Requirements

IDs use prefix **FPORT-###**.

### 8.1 Route guards (FPORT-001–FPORT-004)

- **FPORT-001:** Unauthenticated users redirected to login with callback.
- **FPORT-002:** Only `facility_user` accesses `/facility/*`.
- **FPORT-003:** Agency users visiting `/facility/dashboard` redirect to `/dashboard`.
- **FPORT-004:** Providers redirect to `/my-shifts`.

### 8.2 Dashboard (FPORT-010–FPORT-016)

- **FPORT-010:** KPI **Open Requests**: count `staffing_requests` where `facility_id = X` and `status IN ('open','matching','partially_filled','at_risk')`.
- **FPORT-011:** KPI **At Risk**: count where `status = 'at_risk'`.
- **FPORT-012:** KPI **Confirmed This Week**: `status = 'confirmed'` and `updated_at` in current calendar week (agency TZ: facility state → America/New_York fallback).
- **FPORT-013:** KPI **Upcoming Shifts**: count `shifts` for facility where `start_at` between now and now+14d and `status` not in `cancelled,completed`.
- **FPORT-014:** Active requests table columns: title, role, status, created.
- **FPORT-015:** Upcoming staff cards from shifts/assignments in next 14 days.
- **FPORT-016:** Empty KPIs show `0`, not hidden.

### 8.3 Create request (FPORT-020–FPORT-032)

**Form fields → `staffing_requests`:**

| Field | Column | Rules |
|---|---|---|
| Title | `title` | Required; 3–200 chars |
| Role needed | `role_needed` | Required; `ProfessionalRoleEnum` |
| Specialty | `specialty` | Optional; max 120 |
| Professionals required | `professionals_required` | Required; int 1–50 |
| Shift date | used to set first shift* | Required date (local) |
| Start time | `shifts.start_at`* | Required |
| End time | `shifts.end_at`* | Required; end > start |
| Priority | `priority` | `normal`, `urgent`, `critical` (stored as varchar) |
| Notes | `notes` | Optional; max 2000 |
| Facility instructions | `facility_instructions` | Optional; max 2000 |

\* **MVP shift creation on submit:** When facility creates request, also insert one `shifts` row linked to request (minimal fulfillment tracking). `start_at`/`end_at` = combined date+time in facility timezone → UTC. `agency_id`, `facility_id` copied from request. `status = 'open'`. Document as FPORT-028 (required for timeline/shift KPIs).

- **FPORT-020:** `createFacilityStaffingRequestAction` validates facility scope.
- **FPORT-021:** `created_by_user_id` set to current user.
- **FPORT-022:** Default `status = 'open'`.
- **FPORT-023:** `assigned_coordinator_id` null (agency assigns later).
- **FPORT-024:** Reject create if facility user has no resolved `facilityId`.
- **FPORT-025:** Title auto-suggest optional: `"{role} coverage - {facilityName}"` prefill editable.
- **FPORT-026:** `required_credentials` null on facility-created requests (agency adds later).
- **FPORT-027:** Zod schema `facilityStaffingRequestSchema` in `lib/validations/facility-staffing-request.ts`.
- **FPORT-028:** Create companion `shifts` row per above.
- **FPORT-029:** Activity log entry deferred to Activity Logs module.
- **FPORT-030:** Success redirect to detail page.
- **FPORT-031:** Duplicate rapid double-submit prevented via idempotency key header or disable button 2s.
- **FPORT-032:** Facility cannot set `agency_id` or `facility_id` via client payload.

### 8.4 Request list (FPORT-040–FPORT-045)

- **FPORT-040:** List only `staffing_requests.facility_id = resolvedFacilityId`.
- **FPORT-041:** Pagination: 20 per page default.
- **FPORT-042:** Status filter maps to `StaffingRequestStatusEnum`.
- **FPORT-043:** Search by title substring (case-insensitive).
- **FPORT-044:** Show `assignedCount` = assignments on related shifts with status not `declined|cancelled`.
- **FPORT-045:** Export not in MVP.

### 8.5 Request detail (FPORT-050–FPORT-055)

- **FPORT-050:** Load request only if `facility_id` matches.
- **FPORT-051:** Timeline component derives steps from request + shifts + assignments (no fake manual steps).
- **FPORT-052:** Show read-only shift summary (start/end, shift status).
- **FPORT-053:** Assigned professional cards join `healthcare_professionals` + `shift_assignments`.
- **FPORT-054:** **Contact coordinator** = `mailto:` link if email present.
- **FPORT-055:** Cancel/update buttons hidden in MVP (future).

### 8.6 API surface

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/facility/context` | facility + agency names |
| `GET` | `/api/facility/dashboard` | KPI payload |
| `GET` | `/api/facility/requests` | List with filters |
| `GET` | `/api/facility/requests/[id]` | Detail |
| `POST` | `createFacilityStaffingRequestAction` | Create request + shift |

---

## 9. Data Requirements

### Tables

| Table | Usage |
|---|---|
| `facilities` | Name, location display |
| `agencies` | Agency name in header |
| `staffing_requests` | CRUD (create + read) |
| `shifts` | Created on facility submit; read on detail |
| `shift_assignments` | Assigned count / cards |
| `healthcare_professionals` | Assigned staff display |
| `user_invites` | Resolve facilityId |
| `users` | Coordinator display |

No new tables in MVP.

---

## 10. Authorization Rules

| Action | facility_user | agency roles | provider |
|---|---|---|---|
| View own facility dashboard | Yes | No | No |
| Create request for own facility | Yes | No | No |
| View other facility requests | No | No | No |
| Agency manage all requests | No | Yes (different routes) | No |

All queries: `WHERE facility_id = :resolvedFacilityId AND agency_id = :resolvedAgencyId`.

---

## 11. UX Requirements

- Clean B2B cards for KPIs (4-up on desktop, 2×2 on mobile)
- Status badges aligned with `StaffingRequestStatusEnum` labels
- Priority badges: normal (secondary), urgent (warning), critical (destructive)
- Create form: single page, not multi-step wizard (MVP)
- Use operational copy per docs.md language rules

---

## 12. Error and Empty States

| State | Behavior |
|---|---|
| No facility linked | Full-page message; block create |
| No requests | Empty table + CTA create |
| Create validation error | Inline field errors |
| 404 detail | “Request not found” |
| Coordinator unassigned | “Your agency will assign a coordinator shortly.” |

---

## 13. Mobile/Responsive Requirements

- **FPORT-070:** Dashboard KPI grid 2 columns on `< md`, 4 on `≥ md`.
- **FPORT-071:** Requests table becomes card list on `< md`.
- **FPORT-072:** Create form single column on mobile.
- **FPORT-073:** Playwright smoke 768×1024 and 1280×800.

---

## 14. Acceptance Criteria

- [ ] Facility user login → `/facility/dashboard`.
- [ ] Dashboard KPIs and snippets scoped to one facility.
- [ ] Create request at `/facility/requests/new` persists `staffing_requests` + `shifts`.
- [ ] List and detail only show own facility requests.
- [ ] Tampered request ID returns 404.
- [ ] Agency/provider cannot access `/facility/*`.
- [ ] Responsive layout per FPORT-070–072.
- [ ] All FAC tests in `test.md` pass.

---

## 15. Out of Scope

- Facility request edit/cancel
- Shift creation by agency (already exists elsewhere) — facility only creates initial shift on submit per FPORT-028
- Notifications on status change
- Assigned staff messaging
- Multi-facility account switching

---

## Branch

`module/facility-portal`
