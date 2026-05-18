# Customer Requests PRD

## 1. Module Overview

The Customer Requests module lets **facility customers** submit **Staffing Requests** by selecting preferred healthcare professionals from marketplace discovery—without direct hire or booking.

It implements the authenticated customer flow: request form, professional selections, staffing request creation with `source=marketplace_customer`, and customer-facing request list/detail.

This module is responsible for:

- `/customer/requests/new` — **Request Professional** form
- `/customer/requests` — customer request list
- `/customer/requests/[id]` — detail + approval states (integrates with modules 22–23)
- `staffing_request_selections` records
- triggering Request Routing (module 21) on submit

This module does **not** implement:

- agency fulfillment review UI (module 22)
- alternative suggestion creation (module 23)
- public discovery (modules 16–19)

---

## 2. Goals

### Primary Goals

- Create staffing request from marketplace cart (1–5 professionals)
- Capture facility context, Availability Window, shift need, notes
- Set initial status `open` and `fulfillment_status=pending_agency_review`
- Link `facility_id` to authenticated `facility_user`
- Show clear copy: *Your request will be reviewed by the agency coordinator*

### Secondary Goals

- Pre-fill from `?professionalId=` single selection
- Duplicate request prevention (same facility + professionals + window within 1 hour)

---

## 3. Non-Goals (MVP)

- Guest checkout without account
- Payment/deposit
- Direct messaging to professionals
- Editing selections after submit (cancel + recreate only)

---

## 4. Primary Users

| User | Role | Access |
|---|---|---|
| Facility User | `facility_user` | Full customer request routes |
| Agency users | — | No access to `/customer/*` |
| Public | — | Redirect to login |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Marketplace **Continue to Request** | `/customer/requests/new` |
| Profile **Request Professional** | `/customer/requests/new?professionalId=` |
| Customer nav **My staffing requests** | `/customer/requests` |

---

## 6. User Flows

### Flow A: Submit request from cart

1. Customer authenticated as `facility_user`.
2. Opens `/customer/requests/new` with cart from sessionStorage.
3. Reviews selected professionals (cards, removable).
4. Completes form:
   - Facility (pre-selected if single; else select)
   - Title (auto: `{role} staffing — {facility name}`)
   - Availability Window: start/end datetime
   - Shift type, professionals required count (default = selection count)
   - Notes (optional, max 2000)
5. Submits → server transaction:
   - Insert `staffing_requests` with `source=marketplace_customer`, `status=open`
   - Insert `staffing_request_selections` per professional (`selection_type=customer_preferred`)
   - Insert primary `shifts` row (same as agency create)
   - Call `routeStaffingRequest(requestId)` (module 21)
6. Clear cart; redirect `/customer/requests/[id]` with success toast.

### Flow B: Single professional from profile

1. Query `?professionalId=` loads one selection.
2. Same form; min 1 professional required.

### Flow C: Customer views request status

1. Opens `/customer/requests/[id]`.
2. Sees statuses per **Fulfillment** section (module 22/23):
   - `pending_agency_review`
   - `agency_confirmed` — awaiting customer approval
   - `alternative_proposed` — Suggested Alternative pending
   - `customer_approved` → proceeds to shift coordination
3. Actions: **Approve fulfillment**, **Reject alternative** (module 23).

---

## 7. Screens and Routes

| Route | Auth | Purpose |
|---|---|---|
| `/customer/requests` | `facility_user` | List |
| `/customer/requests/new` | `facility_user` | Create |
| `/customer/requests/[id]` | `facility_user` | Detail |
| `POST /api/customer/requests` | `facility_user` | Create |
| `GET /api/customer/requests` | `facility_user` | List |
| `GET /api/customer/requests/[id]` | `facility_user` | Detail |

---

## 8. Functional Requirements

### 8.1 `staffing_requests` extensions

| Column | Type | Notes |
|---|---|---|
| `source` | enum | `agency`, `marketplace_customer` |
| `fulfillment_status` | enum | See 8.2 |
| `customer_submitted_at` | timestamptz | |

### 8.2 `fulfillment_status` enum (customer-facing lifecycle)

| Status | Meaning |
|---|---|
| `pending_agency_review` | Routed; awaiting agency |
| `agency_confirmed` | Agency confirmed selection; customer approval needed |
| `agency_declined` | Agency declined with reason |
| `alternative_proposed` | Suggested Alternative pending customer |
| `customer_approved` | Customer approved confirm or alternative |
| `customer_rejected` | Customer rejected alternative |
| `cancelled` | Cancelled |

### 8.3 `staffing_request_selections`

| Column | Type |
|---|---|
| `id` | uuid |
| `staffing_request_id` | uuid FK |
| `healthcare_professional_id` | uuid FK |
| `agency_id` | uuid FK (owner) |
| `selection_type` | `customer_preferred` |
| `sort_order` | int |

### 8.4 Create validation

- All selected professionals must pass `isProfessionalPublicEligible` at submit time for facility location
- All selections same `role` (MVP)
- Max 5 selections
- `facility_id` must belong to customer access scope
- Availability Window required (start < end)

### 8.5 Customer list columns

| Column | Source |
|---|---|
| Title | `staffing_requests.title` |
| Status | `fulfillment_status` badge |
| Professionals | selection count |
| Availability Window | shift dates |
| Updated | `updated_at` |

### 8.6 Post-submit messaging

Display: *Agency coordinators will review your staffing request and confirm fulfillment or suggest an alternative. You will not be charged or confirmed until you approve agency fulfillment.*

---

## 9. Data Requirements

- Writes: `staffing_requests`, `shifts`, `staffing_request_selections`
- Reads: `facilities`, `healthcare_professionals`, eligibility service

### Dependencies

| Module | Dependency |
|---|---|
| Staffing Requests (6) | Base request + shift model |
| Facilities (5) | Facility scope |
| Public Marketplace (19) | Cart entry |
| Request Routing (21) | Post-create hook |

---

## 10. Marketplace Rules

1. Customer requests professionals; does not hire.
2. No instant confirmation.
3. No professional contact fields on form.
4. Selections route to owning agencies only.

---

## 11. Authorization Rules

- `facility_user` can only read/write requests for linked `facility_id`(s)
- Cross-facility access → 404
- Agency users use `/staffing-requests` not `/customer/requests`

---

## 12. UX Requirements

- Customer portal styling (aligned with Facility Portal module 10)
- Selected professionals shown as read-only cards
- Primary submit: **Submit staffing request** (not Book)

---

## 13. Error States

| State | Behavior |
|---|---|
| Empty cart | Redirect `/marketplace/search` |
| Professional no longer eligible | Remove with warning before submit |
| Duplicate request | 409 with link to existing |

---

## 14. Responsive Requirements

- Form single column mobile
- Sticky submit bar mobile

---

## 15. Acceptance Criteria

- [ ] Create request with 1–5 selections
- [ ] `source=marketplace_customer` set
- [ ] Routing invoked on success
- [ ] Customer list/detail scoped to facility
- [ ] No booking language
- [ ] Tests pass

---

## 16. Out of Scope

- Agency-side create form changes (module 6)
- Payment
