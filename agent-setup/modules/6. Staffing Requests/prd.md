# Staffing Requests PRD

## 1. Module Overview

The Staffing Requests module is the agency operational hub for creating, listing, and managing healthcare staffing fulfillment requests tied to facilities.

It implements the agency-side lifecycle for `staffing_requests` and the primary shift row created at request time (consumed by the Shifts module for ongoing shift management).

This module is responsible for:

- staffing request list at `/staffing-requests`
- multi-step or single-page create flow at `/staffing-requests/new`
- request detail at `/staffing-requests/[id]`
- status transitions using `StaffingRequestStatusEnum`
- agency-scoped CRUD with role-based authorization
- fulfillment progress display (assigned vs required counts)
- links to Shifts and Matching modules (read-only embeds on detail; full matching in module 8)

This module does **not** implement:

- workforce matching algorithm UI (Matching & Assignments module)
- shift assignment invites/accept-decline (Matching & Assignments + Provider Portal)
- facility portal request creation (Facility Portal module)
- notifications delivery (Notifications module)
- activity log writes beyond optional stub hooks (Activity Logs module)
- compliance verification engine (Compliance module)

---

## 2. Goals

### Primary Goals

- Enable agency coordinators, owners, and admins to create staffing requests with all fields defined in the main product PRD
- Persist requests and an initial primary `shifts` row in one atomic transaction on create
- Display operational list and detail views with accurate status badges and fulfillment metrics
- Enforce agency isolation on all reads and writes
- Support status transitions aligned with `StaffingRequestStatusEnum` in `drizzle/schema.ts`
- Redirect to request detail after successful creation

### Secondary Goals

- Allow saving create flow as `draft` before publish
- Filter and sort list by status, facility, priority, coordinator, date
- Surface at-risk indicators when fulfillment is behind schedule
- Pre-select facility when navigated from Facilities module with `?facilityId=`

---

## 3. Non-Goals (MVP)

- Facility-user-created requests in agency app (Facility Portal)
- Bulk import of requests
- Recurring/multi-day shift templates beyond one primary shift per create
- In-app messaging panel (placeholder UI only)
- Automated status changes from cron (manual + assignment-driven updates only)
- Payroll, billing, or rate fields
- AI matching suggestions (static/filtered list owned by module 8)
- Email/SMS notifications on create

---

## 4. Primary Users

| User | Role(s) | Access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read/write on agency requests |
| Agency Admin | `agency_admin` | Full read/write on agency requests |
| Staffing Coordinator | `staffing_coordinator` | Full read/write on agency requests |
| Recruiter | `recruiter` | Read-only list + detail |
| Compliance Manager | `compliance_manager` | Read-only list + detail |
| Healthcare Professional | `provider` | No access to agency staffing request routes |
| Facility User | `facility_user` | No access to agency app routes (portal module) |
| Unauthenticated | — | Redirect to `/login` |

**Write roles (create, update, cancel, status change):** `agency_owner`, `agency_admin`, `staffing_coordinator` only.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Staffing Requests** | Agency user with read access | `/staffing-requests` |
| **New staffing request** CTA | Write role | `/staffing-requests/new` |
| Dashboard quick action | Write role | `/staffing-requests/new` |
| Facilities detail **Create request** | Write role + `?facilityId=` | `/staffing-requests/new` with facility pre-selected |
| Request row click | Read access | `/staffing-requests/[id]` |
| Post-create redirect | Successful create | `/staffing-requests/[id]` |

### Post-login

No module-specific redirect. Users land per Auth rules (`/dashboard` or role portal).

---

## 6. User Flows

### Flow A: Create staffing request (happy path)

1. Coordinator opens `/staffing-requests/new`.
2. User completes create form (all fields in section 8.2).
3. Client validates with Zod; server re-validates.
4. Server transaction:
   - Insert `staffing_requests` with `status=open` (or `draft` if **Save draft**).
   - Insert primary `shifts` row: `staffing_request_id`, `facility_id`, `start_at`, `end_at`, `shift_type`, `required_count=professionals_required`, `status=open`.
5. Redirect to `/staffing-requests/[id]` with success toast.

### Flow B: Save draft

1. User clicks **Save draft** on create form.
2. Minimum validation: `facilityId`, `title` (auto-generated from facility + role if empty).
3. Persist `staffing_requests.status=draft`; optional shift row omitted until publish.
4. Redirect to `/staffing-requests/[id]` with draft badge.

### Flow C: Publish draft

1. User opens draft detail, clicks **Publish request**.
2. Full create validation runs; create primary shift if missing.
3. Status `draft` → `open`.

### Flow D: Start matching from detail

1. User on detail with status `open`, clicks **Start matching**.
2. Status `open` → `matching`.
3. CTA links to `/staffing-requests/[id]/match` (module 8) or embedded panel if implemented.

### Flow E: Cancel request

1. Write role clicks **Cancel request** on detail.
2. Confirm dialog; optional cancellation reason (stored in `notes` append or activity metadata).
3. Status → `cancelled`; linked shifts `status=cancelled` (via Shifts service).

### Flow F: List filtering

1. User opens `/staffing-requests`.
2. Applies filters: status, facility, priority, assigned coordinator, date range (shift start).
3. Table updates server-side (search params) or client fetch.

### Flow G: Read-only recruiter view

1. Recruiter opens list and detail.
2. No edit/cancel/create buttons rendered; API returns 403 on mutations.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/staffing-requests` | Paginated table of agency requests | Read: owner, admin, coordinator, recruiter, compliance |
| `/staffing-requests/new` | Create staffing request form | Write: owner, admin, coordinator |
| `/staffing-requests/[id]` | Request detail: summary, fulfillment, facility, shifts, actions | Read: all agency read roles; write actions: write roles |

### Layout

- Use agency app shell (sidebar from product navigation).
- Breadcrumb: `Staffing Requests` → `[Request title or ID short]`.

### Detail page sections (MVP)

| Section | Content |
|---|---|
| Header | Title, status badge, priority badge, actions (edit, cancel, start matching) |
| Fulfillment | `assignedCount / professionalsRequired` progress bar |
| Summary | Role, specialty, coordinator, created date |
| Facility | Name, type, address, contact (from `facilities`) |
| Shifts | List of linked shifts (from `shifts`); link to `/shifts/[id]` |
| Notes | Internal notes + facility instructions |
| Credentials | `required_credentials` chips |
| Matching entry | Link/button to match flow (module 8) when status allows |
| Activity | Placeholder or read from `activity_logs` if available |

---

## 8. Functional Requirements

### 8.1 List view (`/staffing-requests`)

**Table columns**

| Column | Source |
|---|---|
| Request | `title` + short id |
| Facility | `facilities.name` |
| Role | `role_needed` (display label) |
| Shift window | Primary shift `start_at`–`end_at` (agency timezone display) |
| Required | `professionals_required` |
| Filled | Count of `shift_assignments` with `status IN (accepted, confirmed, checked_in, completed)` across request shifts |
| Priority | `priority` badge |
| Status | `status` badge |
| Coordinator | `assigned_coordinator_id` → user name |
| Updated | `updated_at` relative time |

**Filters (query params)**

- `status` — one or more `StaffingRequestStatusEnum` values
- `facilityId`
- `priority` — `normal` \| `high` \| `urgent`
- `coordinatorId`
- `q` — search `title`, facility name
- `from` / `to` — ISO date range on primary shift `start_at`

**Default sort:** `updated_at DESC`.

**Empty state:** “No staffing requests yet” + **Create staffing request** CTA (write roles).

**Pagination:** 25 per page.

### 8.2 Create flow (`/staffing-requests/new`)

Single-page form (React Hook Form + Zod). All fields required unless marked optional.

| Field | UI control | DB mapping | Validation |
|---|---|---|---|
| Facility | Searchable select of agency facilities | `facility_id` | Required; must belong to `agency_id` |
| Facility unit / department | Text input | Prefix in `facility_instructions`: `Unit/Dept: {value}\n` + user text | Optional, max 120 chars |
| Request title | Text (auto-suggest) | `title` | Required, 3–200 chars; default `{facilityName} – {roleLabel}` |
| Role needed | Select | `role_needed` | Required; `ProfessionalRoleEnum` |
| Specialty | Text | `specialty` | Optional, max 120 |
| Professionals required | Number stepper | `professionals_required` | Required, integer 1–50 |
| Shift date | Date picker | Primary shift `start_at`/`end_at` date part | Required; not in past (agency TZ) |
| Start time | Time picker | Combined into `shifts.start_at` | Required |
| End time | Time picker | Combined into `shifts.end_at` | Required; must be after start (or next day if overnight) |
| Shift type | Select | `shifts.shift_type` | Optional; values: `day`, `evening`, `night`, `on_call`, `custom` |
| Priority / urgency | Select | `priority` | Required; default `normal`; values: `normal`, `high`, `urgent` |
| Required certifications | Multi-select / tags | `required_credentials` jsonb string[] | Optional; each 2–80 chars |
| Minimum years experience | Number | Appended to `notes`: `Min experience: {n} years` | Optional, 0–40 |
| Assigned coordinator | Select agency users | `assigned_coordinator_id` | Optional; default current user if coordinator |
| Internal notes | Textarea | `notes` | Optional, max 5000 |
| Facility instructions | Textarea | `facility_instructions` (after unit prefix) | Optional, max 5000 |

**Actions**

- **Create request** — validates all required fields; `status=open`; creates shift.
- **Save draft** — partial validation; `status=draft`; no shift until publish.
- **Cancel** — navigate back to list without save.

**On success:** redirect to `/staffing-requests/[id]`.

### 8.3 Detail view (`/staffing-requests/[id]`)

- Load request by `id` scoped to session `agency_id`; 404 if not found or wrong agency.
- Show all `StaffingRequestStatusEnum` values with consistent badge colors.
- **Edit** (write roles): inline or `/staffing-requests/[id]/edit` (optional sub-route; may use dialog MVP).
- Editable fields match create except shift times (edit shift via Shifts module link).
- **Start matching** visible when `status IN (open, partially_filled, at_risk)` → sets `matching`.
- **Cancel request** visible when `status NOT IN (completed, cancelled)` → sets `cancelled`.

### 8.4 Status model (`StaffingRequestStatusEnum`)

Schema values (source of truth):

| Status | Meaning | Typical entry |
|---|---|---|
| `draft` | Incomplete create | Save draft |
| `open` | Published, not actively matching | Create / publish draft |
| `matching` | Coordinator seeking professionals | Start matching |
| `partially_filled` | Some confirmed assignments, below `professionals_required` | Assignment module update |
| `confirmed` | Required count met with confirmed assignments | Assignment module update |
| `at_risk` | Operational risk (unfilled near start, multiple declines) | Manual flag or rule |
| `completed` | All linked shifts completed | Shifts module / manual |
| `cancelled` | Request cancelled | Cancel action |

**Allowed manual transitions (write roles)**

| From | To | Trigger |
|---|---|---|
| `draft` | `open` | Publish |
| `open` | `matching` | Start matching |
| `open`, `matching`, `partially_filled`, `at_risk` | `cancelled` | Cancel |
| `matching`, `partially_filled`, `at_risk` | `at_risk` | Mark at risk (optional action) |
| `confirmed` | `completed` | Mark complete (when shifts done) |

Automatic transitions from assignment counts are implemented in Matching module but **read** by this module’s detail fulfillment bar.

### 8.5 Fulfillment calculation

```
filledCount = COUNT DISTINCT professionals with shift_assignments.status IN ('accepted','confirmed','checked_in','completed') for shifts where staffing_request_id = request.id
progress = filledCount / professionals_required
```

Display: progress bar + `filledCount / professionals_required` label.

### 8.6 API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/staffing-requests` | List with filters (agency-scoped) |
| `POST` | `/api/staffing-requests` | Create request (+ primary shift) |
| `GET` | `/api/staffing-requests/[id]` | Detail with facility, shifts, counts |
| `PATCH` | `/api/staffing-requests/[id]` | Update fields / status |
| `DELETE` | — | Not supported MVP; use cancel |
| Server Action | `createStaffingRequestAction` | Create from form |
| Server Action | `updateStaffingRequestAction` | Update |
| Server Action | `transitionStaffingRequestStatusAction` | Validated status change |
| Server Action | `publishStaffingRequestDraftAction` | Draft → open |

All mutations: `requireAuthContext` + `assertAgencyAccess` + `assertCanManageStaffingRequests` (owner, admin, coordinator).

---

## 9. Data Requirements

### Tables (existing — `drizzle/schema.ts`)

**`staffing_requests`**

| Column | Usage |
|---|---|
| `id` | Route param |
| `agency_id` | Scope |
| `facility_id` | Create select |
| `created_by_user_id` | Set on create |
| `assigned_coordinator_id` | Form |
| `title` | Form |
| `role_needed` | Form |
| `specialty` | Form |
| `professionals_required` | Form |
| `priority` | Form |
| `status` | Lifecycle |
| `required_credentials` | Form jsonb |
| `notes` | Internal notes + experience line |
| `facility_instructions` | Unit prefix + instructions |

**`shifts`** (primary row on create)

| Column | Usage |
|---|---|
| `staffing_request_id` | FK |
| `facility_id` | Copy from request |
| `start_at`, `end_at` | From create form |
| `shift_type` | Form |
| `required_count` | = `professionals_required` |
| `status` | Default `open` |

### Indexes

Use existing indexes on `agency_id`, `facility_id`, `status`, `assigned_coordinator_id`.

### No new tables

Do not add tables in this module unless product approves `facility_unit` column later.

---

## 10. Authorization Rules

| Action | owner | admin | coordinator | recruiter | compliance | provider | facility |
|---|---|---|---|---|---|---|---|
| List / detail read | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create / update / cancel / status | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

- Cross-agency `id` access → 403 or 404 (no enumeration).
- `facility_id` on create must belong to same `agency_id`.
- `assigned_coordinator_id` must be agency user with role in (`agency_owner`, `agency_admin`, `staffing_coordinator`).

Helper: `assertCanManageStaffingRequests(ctx)` in `lib/auth/permissions.ts`.

---

## 11. UX Requirements

- Operational B2B tone; status badges use consistent color map across modules.
- Priority: `normal` (neutral), `high` (amber), `urgent` (red).
- Create form: grouped sections — **Facility & role**, **Shift timing**, **Requirements**, **Assignment & notes**.
- List row click navigates to detail; action menu for quick cancel (write roles).
- Loading skeletons on list and detail.
- Optimistic UI disabled for status changes (wait for server).

---

## 12. Error and Empty States

| State | UI |
|---|---|
| No requests | Empty table + CTA |
| No facilities | Block create; link to `/facilities` add flow |
| Invalid shift window | Inline field errors |
| Facility outside agency | “Facility not found” |
| Draft publish validation fail | Highlight missing fields |
| Cancelled request | Banner “This request was cancelled” |
| At risk | Warning banner with reason chips |
| API 403 | Toast “You don’t have permission” |
| API 404 | “Request not found” page |

---

## 13. Mobile/Responsive Requirements

- List: card stack on `<768px` instead of table (or horizontal scroll table with sticky first column).
- Create form: single column; sticky footer with primary CTA.
- Detail: sections stack vertically; actions in overflow menu on mobile.
- Touch targets ≥ 44px.

---

## 14. Acceptance Criteria

- [ ] `/staffing-requests` lists only current agency requests with correct columns
- [ ] Write roles can create request with all PRD fields persisted correctly
- [ ] Create creates one primary `shifts` row with correct timestamps
- [ ] Redirect to `/staffing-requests/[id]` after create
- [ ] `StaffingRequestStatusEnum` values display and transition per rules
- [ ] Draft save and publish works
- [ ] Recruiter and compliance_manager can read but not mutate (403)
- [ ] Provider and facility_user cannot access routes
- [ ] Cross-agency request id returns 404/403
- [ ] Fulfillment progress reflects assignment counts
- [ ] Lint, typecheck, build, tests pass per `test.md`

---

## 15. Out of Scope

- Matching UI and invites (module 8)
- Shift list page enhancements beyond link-out (module 7)
- Facility portal create request
- Notifications on status change
- Full activity log integration
- Compliance auto-check against credentials

---

## Dependencies

| Module | Requirement |
|---|---|
| 1 Auth | Sessions, roles, agency scope, route protection |
| 2 Agency Onboarding | Agency exists, onboarding complete for owners |
| 4 Workforce | Professionals exist for fulfillment display (optional at create) |
| 5 Facilities | `facilities` records for facility select |

**Branch:** `module/staffing-requests`
