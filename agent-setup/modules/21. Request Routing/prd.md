# Request Routing PRD

## 1. Module Overview

The Request Routing module routes **marketplace-originated staffing requests** to the **owning agency** of each customer-selected healthcare professional.

It creates routing records, agency queue entries, and notifications—without granting agencies access to other agencies' routed slices.

This module is responsible for:

- `staffing_request_routes` table and `routeStaffingRequest()` service
- agency routed queue at `/staffing-requests/routed`
- routing status transitions
- idempotent routing on request create
- multi-agency split when selections span agencies (MVP: one request, multiple routes)

This module does **not** implement:

- agency confirm/decline UI (module 22)
- customer request form (module 20)

---

## 2. Goals

### Primary Goals

- On marketplace request create, create one route per distinct `agency_id` among selections
- Set `routing_status=routed` and notify agency coordinators
- Expose agency queue filtered to `agency_id` session scope
- Mark route `acknowledged` when coordinator opens detail

### Secondary Goals

- SLA indicator `routed_at` + `response_due_at` (default 4 business hours, display only MVP)

---

## 3. Non-Goals (MVP)

- Auto-assign coordinator round-robin
- Cross-agency unified request thread
- Webhook to external systems

---

## 4. Primary Users

| User | Access |
|---|---|
| Staffing Coordinator | Routed queue read/write |
| Agency Owner/Admin | Same |
| Recruiter | Read-only routed queue |
| Customer | No access to routed queue |
| Facility user | Sees aggregate status on customer detail only |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Customer request submit | `routeStaffingRequest(requestId)` |
| Sidebar **Routed requests** | `/staffing-requests/routed` |
| Notification link | `/staffing-requests/[id]?routeId=` |

---

## 6. User Flows

### Flow A: Single agency selection

1. Customer selects 2 professionals from Agency A.
2. `routeStaffingRequest` creates 1 `staffing_request_routes` row: `agency_id=A`, `routing_status=routed`.
3. Coordinators at Agency A see request in **Routed requests** queue.

### Flow B: Multi-agency selection

1. Customer selects professionals from Agency A and Agency B (same role).
2. Creates 2 route rows for same `staffing_request_id`.
3. Each agency sees only their route slice and their selected professionals on detail.

### Flow C: Coordinator acknowledges

1. Coordinator opens routed request detail.
2. Route `routing_status` → `acknowledged`, `acknowledged_by_user_id`, `acknowledged_at`.

---

## 7. Screens and Routes

| Route | Access | Purpose |
|---|---|---|
| `/staffing-requests/routed` | Agency read | Queue |
| `GET /api/staffing-requests/routed` | Agency | List JSON |
| `POST /api/internal/staffing-requests/[id]/route` | Internal/server | Idempotent route |

### Agency list columns

| Column | Source |
|---|---|
| Request title | staffing_requests |
| Facility | facility name |
| Selected professionals (agency) | selections filtered by agency |
| Routed at | `routed_at` |
| Routing status | badge |
| Fulfillment status | `fulfillment_status` |

---

## 8. Functional Requirements

### 8.1 `staffing_request_routes`

| Column | Type |
|---|---|
| `id` | uuid |
| `staffing_request_id` | uuid FK |
| `agency_id` | uuid FK |
| `routing_status` | enum: `pending`, `routed`, `acknowledged`, `closed` |
| `routed_at` | timestamptz |
| `acknowledged_at` | timestamptz nullable |
| `acknowledged_by_user_id` | uuid nullable |
| `response_due_at` | timestamptz nullable |
| `closed_reason` | text nullable |

Unique: (`staffing_request_id`, `agency_id`).

### 8.2 `routeStaffingRequest(requestId)`

1. Load selections with professional `agency_id`.
2. Group by agency.
3. Upsert route rows (idempotent).
4. Set `staffing_requests.fulfillment_status=pending_agency_review` if not terminal.
5. Enqueue notification stub for coordinators (Notifications module hook).

### 8.3 Agency detail view additions

On `/staffing-requests/[id]` for marketplace requests:

- Banner **Marketplace request — customer selected professionals**
- Table of selections for **this agency only**
- Link to **Review fulfillment** (module 22)

### 8.4 Authorization

- Agency users only see routes where `agency_id` matches session
- Customer sees combined status on customer detail, not route rows

---

## 9. Data Requirements

- Reads: `staffing_requests`, `staffing_request_selections`, `healthcare_professionals`
- Writes: `staffing_request_routes`

### Dependencies

| Module | Dependency |
|---|---|
| Customer Requests (20) | Trigger |
| Staffing Requests (6) | Detail page |
| Notifications (12) | Optional hook |

---

## 10. Marketplace Rules

- Route only to owning agency
- No agency can fulfill another agency's professionals
- Routing does not equal confirmation

---

## 11. Authorization Rules

| Action | Roles |
|---|---|
| View routed queue | agency roles (read) |
| Acknowledge route | owner, admin, coordinator |
| Internal route API | server-only |

---

## 12. UX Requirements

- Routed queue badge count in sidebar
- SLA overdue styling (amber) when past `response_due_at`

---

## 13. Error States

| State | Behavior |
|---|---|
| Request with zero selections | routing fails 400 |
| Re-route idempotent | no duplicate rows |

---

## 14. Responsive Requirements

- Queue table horizontal scroll mobile

---

## 15. Acceptance Criteria

- [ ] Routes created per agency on marketplace submit
- [ ] Multi-agency creates multiple routes
- [ ] Agency isolation on queue and detail
- [ ] Acknowledge transition works
- [ ] Tests pass

---

## 16. Out of Scope

- Fulfillment decision (module 22)
