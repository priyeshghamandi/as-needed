# Matching & Assignments PRD

## 1. Module Overview

The Matching & Assignments module connects staffing requests and shifts to healthcare professionals through invite-based assignments.

Coordinators review suggested matches, send invites (`shift_assignments.status=invited`), and track responses. Professionals accept or decline invites (provider actions implemented in Healthcare Professional Portal module 9; this module owns agency-side matching UI and server transition logic callable from both sides).

This module is responsible for:

- matching UI at `/staffing-requests/[id]/match` (dedicated route) **and/or** embedded panel on `/staffing-requests/[id]`
- querying filterable workforce candidates for a request/shift
- creating and managing `shift_assignments` rows
- `AssignmentStatusEnum` transitions: `invited` → `accepted` \| `declined`; `accepted` → `confirmed`; operational states `checked_in`, `completed`, `cancelled`, `no_show`
- updating parent `shifts` and `staffing_requests` fulfillment status via shared sync service
- agency-scoped authorization (coordinator+owner+admin write)

This module does **not** implement:

- full provider portal inbox UX (module 9) — but must expose server actions/API used by portal
- compliance auto-block (Compliance module) — show warnings only MVP
- notifications on invite (Notifications module)
- mock-only UI without persistence

---

## 2. Goals

### Primary Goals

- Show ranked/filtered list of healthcare professionals eligible for a staffing request’s shift(s)
- Allow coordinator to invite one or many professionals to a specific shift
- Prevent duplicate invites per `(shift_id, professional_id)` (unique index)
- Process accept/decline with timestamps (`responded_at`, `decline_reason`)
- Recompute shift and request status when assignment counts change
- Surface assignment state on request detail and shift detail (embedded summaries)

### Secondary Goals

- Filter matches by role, availability status, distance from facility, credentials overlap
- Bulk invite up to `required_count - filledCount` professionals
- Show decline reasons on agency match view
- Highlight compliance warnings (expired/missing credentials) without hard block MVP

---

## 3. Non-Goals (MVP)

- AI ranking / ML match scores
- Automatic invite without coordinator action
- SMS/email delivery
- Shift bidding or marketplace
- Complex availability solver (use `availability_blocks` + `availability_status` filters)
- In-app chat

---

## 4. Primary Users

| User | Role(s) | Agency matching | Accept/decline invite |
|---|---|---|---|
| Agency Owner | `agency_owner` | Write | — |
| Agency Admin | `agency_admin` | Write | — |
| Staffing Coordinator | `staffing_coordinator` | Write | — |
| Recruiter | `recruiter` | Read-only view | — |
| Compliance Manager | `compliance_manager` | Read-only | — |
| Provider | `provider` | — | Write (own assignments only, module 9 UI) |
| Facility User | `facility_user` | — | — |

**Agency write roles for invites/cancel invites:** `agency_owner`, `agency_admin`, `staffing_coordinator`.

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Request detail **Match professionals** | `/staffing-requests/[id]/match` |
| Shift detail **Match professionals** | Same route with `?shiftId=` |
| Request detail embedded **Suggested matches** panel | Inline list + invite without navigation (optional MVP) |
| Provider portal shift invite | `respondToShiftAssignmentAction` (module 9 calls module 8 service) |

---

## 6. User Flows

### Flow A: Open matching page

1. Coordinator on request in `open` or `matching` clicks **Match professionals**.
2. Navigate to `/staffing-requests/[id]/match`.
3. Page loads request summary, shift selector (if multiple shifts), match filters, candidate list.

### Flow B: Filter candidates

1. Default filters: `role` = request `role_needed`, `is_active=true`, agency scoped.
2. Optional toggles: **Available only** (`availability_status=available`), **Within service area** (facility vs professional distance), **Has required credentials** (substring match on credential types).
3. List updates (server-side query).

### Flow C: Send invite (single)

1. Coordinator clicks **Invite** on a row.
2. Server creates `shift_assignments` with `status=invited`, `invited_by_user_id`, `invited_at`.
3. Shift status → `matching` if was `open`; request → `matching`.
4. Row shows **Invited** badge; invite button disabled.

### Flow D: Bulk invite

1. Coordinator selects checkboxes (max remaining slots).
2. Clicks **Invite selected (N)**.
3. Batch insert assignments; partial failures reported per row.

### Flow E: Professional accepts (provider)

1. Provider opens invite in portal (module 9).
2. Clicks **Accept**.
3. `status`: `invited` → `accepted`; `responded_at` set.
4. Sync: if `filledCount < required_count` → shift `partially_filled`, request `partially_filled`; if met → `confirmed`.
5. Optional auto-transition `accepted` → `confirmed` when coordinator policy `autoConfirmOnAccept=true` (MVP default: **true** for simplicity).

### Flow F: Professional declines (provider)

1. Provider clicks **Decline**; optional reason required (min 3 chars).
2. `status` → `declined`; `decline_reason` saved.
3. Request may move to `at_risk` if `filledCount=0` and shift starts within 24h.

### Flow G: Coordinator cancels invite

1. On match page, **Cancel invite** for `invited` assignment.
2. `status` → `cancelled`; `cancellation_reason` optional.

### Flow H: Coordinator confirms assignment manually

1. For `accepted` assignment, coordinator clicks **Confirm**.
2. `status` → `confirmed`; `confirmed_at` set.
3. Recompute fulfillment.

### Flow I: Embedded panel (optional)

1. On `/staffing-requests/[id]`, collapsed **Suggested matches** shows top 5 candidates.
2. **View all** → full match route.

---

## 7. Screens and Routes

| Route | Description |
|---|---|
| `/staffing-requests/[id]/match` | Full matching workspace |
| `/staffing-requests/[id]` | Embedded suggested matches panel (recommended) |

### Match page layout

| Region | Content |
|---|---|
| Header | Request title, status, fulfillment `filled/required`, back link |
| Shift selector | Tabs or select for each `shifts` row on request; default `shiftId` query or primary shift |
| Filters | Role, availability, distance, credentials |
| Candidate table | Name, role, specialty, location, availability badge, compliance warning, assignment status, actions |
| Bulk bar | Selected count, Invite selected |
| Existing invites | Sidebar or bottom table: professional, status, invited at, responded at, actions |

### Candidate table columns

| Column | Source |
|---|---|
| Professional | `first_name` + `last_name` |
| Role | `role` |
| Specialty | `specialty` |
| Location | city, state |
| Availability | `availability_status` badge |
| Compliance | Warning if any credential `expired` or missing required type |
| Match status | Existing assignment status or — |
| Actions | Invite / Cancel invite / Confirm |

---

## 8. Functional Requirements

### 8.1 Matching query rules

Base query: `healthcare_professionals` where `agency_id = session.agency_id` AND `is_active = true`.

| Filter | Rule |
|---|---|
| Role | `role = staffing_requests.role_needed` (default on) |
| Available | `availability_status = 'available'` |
| Service area | Distance professional ↔ facility ≤ agency `service_area_radius_miles` |
| Credentials | If `required_credentials` non-empty, professional has verified credential `type` matching each required (MVP: case-insensitive type match) |
| Exclude | Professionals with assignment on same shift in `invited, accepted, confirmed, checked_in` |

Sort MVP: `reliability_score DESC`, then distance ASC.

### 8.2 Invite rules

- Target shift must belong to request and agency.
- Cannot exceed `required_count - filledCount` confirmed-equivalent assignments unless override flag (owner only) — MVP: hard block.
- Unique `(shift_id, professional_id)` — return 409 if duplicate.
- Sets `invited_by_user_id` to current user.

### 8.3 `AssignmentStatusEnum` transitions

Schema values: `invited`, `accepted`, `declined`, `confirmed`, `checked_in`, `completed`, `cancelled`, `no_show`.

| From | To | Actor | Notes |
|---|---|---|---|
| — | `invited` | Coordinator | Create assignment |
| `invited` | `accepted` | Provider | Accept invite |
| `invited` | `declined` | Provider | Decline + reason |
| `invited` | `cancelled` | Coordinator | Cancel invite |
| `accepted` | `confirmed` | Coordinator or auto | `confirmed_at` set |
| `accepted` | `declined` | — | Not allowed |
| `confirmed` | `checked_in` | Coordinator | Future ops; optional MVP button |
| `checked_in` | `completed` | Coordinator / time | End of shift |
| `confirmed` | `cancelled` | Coordinator | Pre-shift cancel |
| `*` | `no_show` | Coordinator | Post start |

**Provider-only transitions:** `invited` → `accepted` \| `declined` on own `professional_id` linked to session user.

### 8.4 Fulfillment sync (required)

After any assignment mutation, call `syncFulfillmentForRequest(staffingRequestId)`:

1. Count assignments across all request shifts where status ∈ `accepted`, `confirmed`, `checked_in`, `completed` (unique professionals).
2. Update each shift `status` via `recomputeShiftStatus`.
3. Update request status:
   - `0` filled → keep `matching` or `open`
   - `0 < filled < required` → `partially_filled`
   - `filled >= required` → `confirmed`
   - If shift starts < 24h and `filled < required` → `at_risk`

### 8.5 API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/staffing-requests/[id]/matches` | Candidate list + filters |
| `GET` | `/api/staffing-requests/[id]/assignments` | Existing assignments |
| `POST` | `/api/shifts/[shiftId]/assignments` | Create invite |
| `POST` | `/api/shifts/[shiftId]/assignments/bulk` | Bulk invite |
| `PATCH` | `/api/shift-assignments/[id]` | Status transitions |
| Server Action | `inviteProfessionalToShiftAction` | |
| Server Action | `bulkInviteProfessionalsAction` | |
| Server Action | `cancelShiftAssignmentAction` | |
| Server Action | `confirmShiftAssignmentAction` | |
| Server Action | `respondToShiftAssignmentAction` | Provider accept/decline |
| Server Action | `getMatchCandidatesAction` | |

### 8.6 Embedded vs dedicated route

**Required:** dedicated `/staffing-requests/[id]/match`.

**Recommended:** embedded top-5 panel on request detail reusing `getMatchCandidatesAction` with `limit=5`.

Implementation may ship embedded panel in same module branch if timeboxed.

---

## 9. Data Requirements

### `shift_assignments`

| Column | Usage |
|---|---|
| `shift_id` | Target shift |
| `professional_id` | Invitee |
| `invited_by_user_id` | Coordinator |
| `status` | Lifecycle |
| `invited_at`, `responded_at`, `confirmed_at` | Timestamps |
| `decline_reason`, `cancellation_reason` | Text |

### Related reads

- `shifts`, `staffing_requests`, `facilities`, `healthcare_professionals`, `credentials`

No new tables.

---

## 10. Authorization Rules

| Action | owner | admin | coordinator | recruiter | provider |
|---|---|---|---|---|---|
| View match page / candidates | ✓ | ✓ | ✓ | ✓ | ✗ |
| Send/cancel/confirm invites | ✓ | ✓ | ✓ | ✗ | ✗ |
| Accept/decline own invite | ✗ | ✗ | ✗ | ✗ | ✓ (own) |

- Provider `respondToShiftAssignmentAction` must verify `healthcare_professionals.user_id = session.userId`.
- Cross-agency assignment id → 403/404.

Helpers:

- `assertCanManageAssignments(ctx)`
- `assertProviderOwnsAssignment(ctx, assignmentId)`

---

## 11. UX Requirements

- Match page feels operational: dense table, clear status chips.
- Invited rows visually distinct (blue); accepted (green); declined (muted).
- Compliance warning icon with tooltip listing missing/expired types.
- Disable invite when shift `cancelled` or request `cancelled`.
- Confirm destructive cancel invite dialog.
- Bulk invite shows progress toast with success/fail counts.

---

## 12. Error and Empty States

| State | UI |
|---|---|
| No candidates | “No matching professionals” + adjust filters |
| All slots filled | Disable invite; banner “Fully confirmed” |
| Duplicate invite | Toast “Already invited” |
| Provider decline | Show reason on assignments list |
| Shift cancelled | Match page read-only banner |
| API failure | Retry on candidate list |

---

## 13. Mobile/Responsive Requirements

- Match table horizontal scroll on mobile.
- Sticky shift selector on match page.
- Provider accept/decline (module 9) mobile-first; agency match desktop-first acceptable.

---

## 14. Acceptance Criteria

- [ ] `/staffing-requests/[id]/match` loads candidates with filters
- [ ] Coordinator can invite and cancel invites
- [ ] Duplicate invite prevented
- [ ] Provider accept/decline updates assignment and syncs request/shift status
- [ ] `AssignmentStatusEnum` transitions enforced server-side
- [ ] Fulfillment counts accurate on request and shift
- [ ] Recruiter read-only cannot invite
- [ ] Cross-agency assignment access blocked
- [ ] Embedded panel OR match route documented as shipped
- [ ] Tests pass per `test.md`

---

## 15. Out of Scope

- Notification delivery on invite
- Provider portal pages (module 9)
- Credential verification workflow (module 11)
- Activity log entries (module 13)

---

## Dependencies

| Module | Requirement |
|---|---|
| 1 Auth | Roles, provider user link |
| 4 Workforce | `healthcare_professionals` data |
| 5 Facilities | Facility location for distance filter |
| 6 Staffing Requests | Parent request, statuses |
| 7 Shifts | Shift rows, shift status sync |

**Branch:** `module/matching-assignments`
