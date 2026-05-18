# Agency Fulfillment Review PRD

## 1. Module Overview

The Agency Fulfillment Review module gives agency coordinators **fulfillment authority** over marketplace staffing requests: **confirm** customer-selected professionals or **decline** with reason—triggering customer approval before shift coordination proceeds.

This module implements `fulfillment_reviews` and the agency UI at `/staffing-requests/[id]/fulfillment`.

This module is responsible for:

- agency fulfillment review panel on staffing request detail
- confirm/decline actions per agency route
- updating `fulfillment_status` on staffing request
- customer notification hook when agency confirms (awaiting customer approval)

This module does **not** implement:

- Suggested Alternative creation (module 23) — links to it
- shift assignment invites (Matching & Assignments)
- customer request form (module 20)

---

## 2. Goals

### Primary Goals

- Coordinator confirms requested professional(s) for their agency slice → `fulfillment_status=agency_confirmed`
- Coordinator declines with required reason → `agency_declined`
- Customer must approve agency confirmation before `customer_approved` (integrated customer UI)
- Audit trail via `fulfillment_reviews` rows

### Secondary Goals

- Partial confirm when multiple selections (confirm subset, decline others with reason)
- Display customer notes and Availability Window prominently

---

## 3. Non-Goals (MVP)

- Auto-confirm without coordinator action
- Legal e-signature
- In-app customer ↔ professional chat

---

## 4. Primary Users

| User | Role | Access |
|---|---|---|
| Staffing Coordinator | write | Review + confirm/decline |
| Agency Owner/Admin | write | Same |
| Recruiter | read-only | View review state |
| Customer | — | Approve via customer detail (module 20/23) |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Routed request detail **Review fulfillment** | `/staffing-requests/[id]/fulfillment` |
| Routed queue row action | Same |

---

## 6. User Flows

### Flow A: Agency confirms selection

1. Coordinator opens fulfillment page for marketplace request (agency-scoped).
2. Reviews customer-selected professionals (agency slice only).
3. Clicks **Confirm fulfillment** for professional(s).
4. Server inserts `fulfillment_reviews` (`decision=confirmed`, `healthcare_professional_id`).
5. Sets `fulfillment_status=agency_confirmed` on request (if all agency routes resolved).
6. Customer sees **Approve fulfillment** on `/customer/requests/[id]`.

### Flow B: Agency declines

1. Coordinator clicks **Decline fulfillment**.
2. Modal: reason required (enum + notes): `unavailable`, `credentials`, `scheduling_conflict`, `other`.
3. `fulfillment_reviews.decision=declined`; `fulfillment_status=agency_declined`.
4. Customer notified; option to wait for **Suggested Alternative** (module 23) or cancel request.

### Flow C: Customer approves confirmation

1. Customer clicks **Approve fulfillment** on customer detail.
2. `fulfillment_status=customer_approved`.
3. Agency can proceed to Matching & Assignments / shift invites (existing modules).

---

## 7. Screens and Routes

| Route | Access | Purpose |
|---|---|---|
| `/staffing-requests/[id]/fulfillment` | Agency write | Review UI |
| `POST /api/staffing-requests/[id]/fulfillment/confirm` | Coordinator+ | Confirm |
| `POST /api/staffing-requests/[id]/fulfillment/decline` | Coordinator+ | Decline |
| `POST /api/customer/requests/[id]/approve-fulfillment` | `facility_user` | Customer approve |

---

## 8. Functional Requirements

### 8.1 `fulfillment_reviews`

| Column | Type |
|---|---|
| `id` | uuid |
| `staffing_request_id` | uuid |
| `staffing_request_route_id` | uuid |
| `agency_id` | uuid |
| `healthcare_professional_id` | uuid nullable |
| `decision` | `confirmed`, `declined` |
| `decline_reason` | enum nullable |
| `decline_notes` | text max 500 |
| `reviewed_by_user_id` | uuid |
| `reviewed_at` | timestamptz |

### 8.2 Confirm rules

- Can only confirm professionals in agency's selections
- Professional must still be `is_active` and agency-employed
- Cannot confirm if compliance block active (warning + block)

### 8.3 Decline rules

- `decline_reason` required
- At least one declined review allowed per route; if all selections declined, status `agency_declined`

### 8.4 Customer approval

- Only when `fulfillment_status=agency_confirmed`
- Sets `customer_approved_at`, transitions to `customer_approved`
- Does not auto-create shift assignment (Matching module)

### 8.5 Agency fulfillment page UI

Sections:

1. Request summary (facility, Availability Window, notes)
2. Customer-selected professionals table (agency slice)
3. Actions per row: **Confirm** | **Decline**
4. Link **Suggest alternative** → module 23 flow
5. History of `fulfillment_reviews`

---

## 9. Data Requirements

- Writes: `fulfillment_reviews`, updates `staffing_requests.fulfillment_status`
- Reads: selections, routes, professionals

### Dependencies

| Module | Dependency |
|---|---|
| Request Routing (21) | Routes |
| Customer Requests (20) | Request + customer approval surface |
| Alternative Suggestions (23) | Decline → alternative path |

---

## 10. Marketplace Rules

- Agency has fulfillment authority; customer does not self-confirm shifts
- Confirm is not instant shift confirmation
- No direct customer-professional messaging on this screen

---

## 11. Authorization Rules

| Action | Roles |
|---|---|
| Confirm/decline | owner, admin, coordinator |
| Customer approve | `facility_user` scoped to facility |
| Cross-agency route | 404 |

---

## 12. UX Requirements

- Operational SaaS styling
- Clear distinction: **Confirm fulfillment** vs **Confirm shift** (shift happens later)
- Decline modal with reason codes

---

## 13. Error States

| State | Behavior |
|---|---|
| Confirm ineligible professional | 400 |
| Customer approve wrong status | 409 |
| Already reviewed | 409 idempotent message |

---

## 14. Responsive Requirements

- Table scroll mobile; actions in overflow menu

---

## 15. Acceptance Criteria

- [ ] Agency confirm/decline with audit rows
- [ ] Customer approval transitions status
- [ ] Agency scope enforced
- [ ] Tests pass

---

## 16. Out of Scope

- Alternative suggestion UI (module 23)
- Assignment invites
