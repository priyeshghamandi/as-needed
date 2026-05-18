# Alternative Suggestions PRD

## 1. Module Overview

The Alternative Suggestions module allows agencies to propose a **Suggested Alternative** healthcare professional when the customer’s preferred selection cannot be fulfilled—requiring explicit **customer approval** before coordination continues.

This module implements `suggested_alternatives` and approval flows on agency and customer surfaces.

This module is responsible for:

- agency UI to propose alternative (same agency, geo-eligible, marketplace-visible or internal)
- customer UI to review, approve, or reject alternative
- status transitions: `alternative_proposed` → `customer_approved` | `customer_rejected`
- audit trail and selection linkage

This module does **not** implement:

- initial agency confirm of original selection (module 22)
- matching algorithm (manual picker MVP)

---

## 2. Goals

### Primary Goals

- Coordinator proposes one alternative per declined/unavailable selection (MVP)
- Alternative must be same `role` and same `agency_id`
- Alternative must pass geography eligibility for facility location
- Customer **Approve suggested alternative** or **Reject** with optional reason
- On approve: update fulfillment to proceed; record `selection_type=suggested_alternative`

### Secondary Goals

- Show side-by-side comparison: requested vs suggested professional (public-safe fields)
- Allow agency to withdraw pending alternative before customer acts

---

## 3. Non-Goals (MVP)

- Multiple alternatives ranked list
- Customer counter-suggestion
- Auto-suggest ML

---

## 4. Primary Users

| User | Access |
|---|---|
| Staffing Coordinator | Create/withdraw alternative |
| Customer (`facility_user`) | Approve/reject |
| Agency read roles | View state |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Fulfillment page **Suggest alternative** | Modal workflow |
| Customer request detail pending alternative | Approval card |
| Email/notification deep link | Customer detail |

---

## 6. User Flows

### Flow A: Agency suggests alternative

1. Coordinator on `/staffing-requests/[id]/fulfillment` clicks **Suggest alternative** for declined/unavailable selection.
2. Opens picker: searchable list of **same agency** professionals (role match, geo eligible).
3. Selects professional + message to customer (max 500 chars).
4. Server creates `suggested_alternatives` row `status=pending_customer`.
5. `fulfillment_status=alternative_proposed`.
6. Customer notified.

### Flow B: Customer approves

1. Customer opens `/customer/requests/[id]`.
2. Sees **Suggested Alternative** card: original vs alternative profiles (public fields).
3. Clicks **Approve suggested alternative**.
4. Server: `suggested_alternatives.status=approved`, adds/updates `staffing_request_selections` with `selection_type=suggested_alternative`, `fulfillment_status=customer_approved`.
5. Agency can proceed to assignment workflow.

### Flow C: Customer rejects

1. Customer clicks **Reject** with optional reason.
2. `suggested_alternatives.status=rejected`; `fulfillment_status=customer_rejected`.
3. Agency may propose new alternative or customer cancels request.

### Flow D: Agency withdraws pending alternative

1. Coordinator **Withdraw suggestion** before customer acts.
2. Status `withdrawn`; `fulfillment_status` returns to `agency_declined` or `pending_agency_review` per rules.

---

## 7. Screens and Routes

| Route | Method | Purpose |
|---|---|---|
| `POST /api/staffing-requests/[id]/alternatives` | Agency write | Create |
| `DELETE /api/staffing-requests/[id]/alternatives/[altId]` | Agency write | Withdraw |
| `POST /api/customer/requests/[id]/alternatives/[altId]/approve` | Customer | Approve |
| `POST /api/customer/requests/[id]/alternatives/[altId]/reject` | Customer | Reject |

---

## 8. Functional Requirements

### 8.1 `suggested_alternatives`

| Column | Type |
|---|---|
| `id` | uuid |
| `staffing_request_id` | uuid |
| `staffing_request_route_id` | uuid |
| `agency_id` | uuid |
| `original_professional_id` | uuid |
| `suggested_professional_id` | uuid |
| `message_to_customer` | text max 500 |
| `status` | `pending_customer`, `approved`, `rejected`, `withdrawn` |
| `proposed_by_user_id` | uuid |
| `proposed_at` | timestamptz |
| `resolved_at` | timestamptz nullable |
| `customer_rejection_reason` | text nullable |

### 8.2 Picker rules

- Same `agency_id` as route
- Same `role` as request
- `is_active=true`
- Geo eligible for facility (eligibility service)
- MVP: alternative need not be marketplace-visible if internal bench professional

### 8.3 Customer comparison card

| Field | Original | Suggested |
|---|---|---|
| Display name | yes | yes |
| Role | yes | yes |
| Approximate availability | yes | yes |
| Agency message | — | coordinator message |

### 8.4 Status transitions

| From | Action | To |
|---|---|---|
| `agency_declined` or pending review | propose alt | `alternative_proposed` |
| `alternative_proposed` | customer approve | `customer_approved` |
| `alternative_proposed` | customer reject | `customer_rejected` |
| `alternative_proposed` | agency withdraw | prior state per matrix in `lib/fulfillment/alternative-status.ts` |

### 8.5 Constraints

- Only one `pending_customer` alternative per original professional (MVP)
- Cannot suggest professional already in customer selections

---

## 9. Data Requirements

- Writes: `suggested_alternatives`, updates selections + `fulfillment_status`
- Integrates with module 22 reviews

### Dependencies

| Module | Dependency |
|---|---|
| Agency Fulfillment Review (22) | Entry from decline |
| Customer Requests (20) | Customer approval UI |
| Marketplace Eligibility Rules (15) | Geo check |

---

## 10. Marketplace Rules

- Suggested Alternative is agency-proposed, customer-approved—never auto-applied
- Not a replacement marketplace search for customer in MVP (agency picks)
- Terminology: **Suggested Alternative** only

---

## 11. Authorization Rules

| Action | Roles |
|---|---|
| Propose/withdraw | owner, admin, coordinator (agency scoped) |
| Approve/reject | `facility_user` facility scoped |
| View | agency read roles + customer owner |

---

## 12. UX Requirements

- Customer card emphasizes coordinator message
- Reject uses confirm dialog
- No language: "We swapped your booking"

---

## 13. Error States

| State | Behavior |
|---|---|
| Suggest ineligible professional | 400 |
| Approve expired/withdrawn | 409 |
| Duplicate pending alternative | 409 |

---

## 14. Responsive Requirements

- Comparison card stacks on mobile

---

## 15. Acceptance Criteria

- [ ] Agency can propose, customer can approve/reject
- [ ] Geo and agency rules enforced
- [ ] Status transitions correct
- [ ] Selection row created on approve
- [ ] Tests pass

---

## 16. Out of Scope

- Multiple competing alternatives
- Customer-initiated alternative search
