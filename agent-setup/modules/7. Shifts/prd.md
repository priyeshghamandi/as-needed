# Shifts PRD

## 1. Module Overview

The Shifts module manages operational shift records linked to staffing requests and facilities.

Shifts are created when a staffing request is published (Staffing Requests module) and are the anchor for assignments (Matching & Assignments module).

This module is responsible for:

- shift list at `/shifts`
- shift detail at `/shifts/[id]`
- displaying and updating `ShiftStatusEnum`
- syncing shift status with request fulfillment where applicable
- agency-scoped reads and coordinator+owner+admin writes

This module does **not** implement:

- creating staffing requests (module 6)
- sending invites or accept/decline (module 8)
- provider portal shift inbox (module 9)
- check-in/check-out UI (future; assignment timestamps exist in schema)
- automated geofence check-in

---

## 2. Goals

### Primary Goals

- Provide agency-wide visibility into all shifts with filtering by status, facility, request, and date
- Show shift detail with linked staffing request, facility, assignments summary, and timing
- Enforce `ShiftStatusEnum` transitions from `drizzle/schema.ts`
- Keep `required_count` aligned with staffing request `professionals_required` on primary shift
- Link shifts to parent request and facility records

### Secondary Goals

- Support adding additional shifts to an existing request (non-primary) from detail action
- Highlight shifts starting within 24h that are not `confirmed`
- Quick navigation to matching flow from shift detail

---

## 3. Non-Goals (MVP)

- Provider mobile check-in flow
- Payroll hours export
- Shift swap marketplace
- Calendar sync (Google/Outlook)
- Bulk shift generation across weeks
- Real-time GPS tracking

---

## 4. Primary Users

| User | Role(s) | Access |
|---|---|---|
| Agency Owner | `agency_owner` | Read/write |
| Agency Admin | `agency_admin` | Read/write |
| Staffing Coordinator | `staffing_coordinator` | Read/write |
| Recruiter | `recruiter` | Read-only |
| Compliance Manager | `compliance_manager` | Read-only |
| Provider | `provider` | No agency `/shifts` routes |
| Facility User | `facility_user` | No agency routes |

**Write roles:** `agency_owner`, `agency_admin`, `staffing_coordinator`.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Shifts** | Agency read role | `/shifts` |
| Staffing request detail **Shifts** section | Read access | `/shifts/[id]` |
| Matching flow | After invite | Return link to shift detail |
| Dashboard urgent shifts widget | Read access | `/shifts?status=open&urgent=1` (filter) |

---

## 6. User Flows

### Flow A: View shift list

1. User opens `/shifts`.
2. Sees paginated shifts with facility, request, window, fill count, status.
3. Filters by status, facility, date range.

### Flow B: View shift detail

1. User clicks row → `/shifts/[id]`.
2. Sees shift timing, type, break, facility, parent request link, assignment table (read-only summary; actions in module 8).

### Flow C: Update shift times (write role)

1. User clicks **Edit shift times** on detail.
2. Dialog with `startAt`, `endAt`, `breakMinutes`, `shiftType`.
3. Server validates; updates row; may set request `at_risk` if within 12h and unfilled.

### Flow D: Cancel shift

1. Write role clicks **Cancel shift**.
2. Confirm dialog.
3. `status` → `cancelled`; open assignments → `cancelled` (via assignment service).

### Flow E: Add secondary shift to request

1. From staffing request detail or shift detail **Add shift** (write role).
2. Form: date, start, end, shift type, required count (default 1).
3. Inserts new `shifts` row sharing `staffing_request_id`.

### Flow F: Status progression (automatic + manual)

- **open** → **matching** when first invite sent (module 8 hook)
- **matching** → **partially_filled** when some assignments confirmed
- **partially_filled** → **confirmed** when `filledCount >= required_count`
- **confirmed** → **active** when `now` between `start_at` and `end_at` (scheduled job or on-view promotion MVP)
- **active** → **completed** after `end_at` passed and assignments completed
- Any non-terminal → **cancelled** on cancel action

---

## 7. Screens and Routes

| Route | Description | Auth |
|---|---|---|
| `/shifts` | Shift list | Agency read roles |
| `/shifts/[id]` | Shift detail | Agency read roles |

### List columns

| Column | Source |
|---|---|
| Shift | Short id + `shift_type` |
| Request | `staffing_requests.title` link |
| Facility | `facilities.name` |
| Window | `start_at` – `end_at` |
| Required | `required_count` |
| Filled | Assignment count (confirmed+) |
| Status | `status` badge |
| Updated | `updated_at` |

### Detail sections

- Header: status, facility, request breadcrumb
- Timing card: start, end, break, shift type
- Fulfillment: filled / required
- Assignments table: professional name, assignment status, invited/responded times
- Actions: Edit times, Cancel shift, **Match professionals** → `/staffing-requests/[requestId]/match`
- Activity placeholder

---

## 8. Functional Requirements

### 8.1 `ShiftStatusEnum` (schema)

| Status | Meaning |
|---|---|
| `open` | Created, no invites or awaiting work |
| `matching` | Invites sent / matching in progress |
| `partially_filled` | Some slots filled |
| `confirmed` | `filledCount >= required_count` |
| `active` | Shift window in progress |
| `completed` | Shift ended, operational complete |
| `cancelled` | Shift cancelled |

### 8.2 Shift fields (`shifts` table)

| Field | Editable MVP | Notes |
|---|---|---|
| `staffing_request_id` | No | Set on create |
| `facility_id` | No | Denormalized from request |
| `start_at`, `end_at` | Yes (write roles) | Must remain valid window |
| `shift_type` | Yes | varchar 60 |
| `break_minutes` | Yes | 0–480 |
| `required_count` | Yes (secondary shifts); primary syncs from request | integer ≥ 1 |
| `status` | Via transitions | |

### 8.3 List filters

- `status` (multi)
- `facilityId`
- `staffingRequestId`
- `from` / `to` on `start_at`
- `unfilled=1` → filled < required and status not in (`completed`,`cancelled`)

### 8.4 API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/shifts` | List |
| `GET` | `/api/shifts/[id]` | Detail + assignments |
| `PATCH` | `/api/shifts/[id]` | Update times, required_count, status |
| `POST` | `/api/shifts` | Add secondary shift to request |
| Server Action | `updateShiftAction` | |
| Server Action | `cancelShiftAction` | |
| Server Action | `createSecondaryShiftAction` | |
| Server Action | `recomputeShiftStatusAction` | Called from assignment updates |

### 8.5 Relationship to staffing requests

- Primary shift: first shift created with request (module 6).
- Updating request `professionals_required` updates primary shift `required_count`.
- Request status `partially_filled` / `confirmed` should stay in sync when shift fulfillment changes (shared service in `lib/fulfillment/sync.ts`).

---

## 9. Data Requirements

Use `shifts` and `shift_assignments` from schema. No new tables.

**Assignment summary on shift detail**

Join `shift_assignments` → `healthcare_professionals` for name, role, assignment `status`.

---

## 10. Authorization Rules

Same matrix as Staffing Requests:

| Action | owner | admin | coordinator | recruiter | compliance |
|---|---|---|---|---|---|
| Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| Write | ✓ | ✓ | ✓ | ✗ | ✗ |

`assertCanManageShifts(ctx)` — alias or shared with staffing requests write helper.

---

## 11. UX Requirements

- Shift list default sort: `start_at ASC` (upcoming first).
- Urgent unfilled: row highlight when `start_at < now + 24h` and status not `confirmed`.
- Status badge colors consistent with staffing requests module.
- Detail assignment statuses use `AssignmentStatusEnum` labels.

---

## 12. Error and Empty States

| State | UI |
|---|---|
| No shifts | Empty state + link to create staffing request |
| Cancelled shift | Banner |
| Edit conflict (shift started) | Disable edit with message |
| Invalid time range | Inline validation |
| 404 shift wrong agency | Not found page |

---

## 13. Mobile/Responsive Requirements

- List cards on mobile with key fields stacked.
- Detail assignment table horizontal scroll or stacked cards.
- Sticky action bar on mobile for **Match professionals**.

---

## 14. Acceptance Criteria

- [ ] `/shifts` and `/shifts/[id]` work for agency read roles
- [ ] Write roles can edit times and cancel
- [ ] `ShiftStatusEnum` displayed and updated per rules
- [ ] Shifts always scoped to `agency_id`
- [ ] Linked request and facility data correct
- [ ] Assignment summary visible on detail
- [ ] Recruiter read-only enforced
- [ ] Cross-agency shift id blocked
- [ ] Tests in `test.md` pass

---

## 15. Out of Scope

- Assignment invite/send (module 8)
- Provider accept/decline UI (module 9)
- Notifications on shift change

---

## Dependencies

| Module | Requirement |
|---|---|
| 1 Auth | Session, agency scope |
| 5 Facilities | Facility display |
| 6 Staffing Requests | Parent request, primary shift creation |
| 4 Workforce | Professional names on assignments |

**Branch:** `module/shifts`
