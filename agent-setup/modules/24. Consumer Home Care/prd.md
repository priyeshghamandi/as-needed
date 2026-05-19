# Consumer Home Care PRD

## 1. Module Overview

The Consumer Home Care module enables **individuals and families** to use the public marketplace **without a pre-existing agency relationship** on AsNeeded.

Consumers self-sign up, register a **care site** (home address and care context), browse geo-eligible professionals across **all agencies** on the platform, and submit **Staffing Requests** using the same fulfillment model as facility customers (modules 20–23).

This module is responsible for:

- consumer self-signup and session (`consumer` role)
- `care_sites` (or consumer-scoped facility records) linked to the user
- `resolveConsumerCareScope()` for request/marketplace auth (no `user_invites` required)
- consumer onboarding UI (`/signup/care`, `/care/onboarding` or equivalent)
- homepage and marketplace entry: **Find home care**
- extending Customer Requests (20) create/list/detail APIs and pages for `consumer` role
- `staffing_requests.source = marketplace_consumer` and routing via module 21

This module does **not** implement:

- direct hire, in-app payments, or customer ↔ professional messaging (global non-goals)
- agency self-signup changes (module 2)
- replacing invited **facility_user** flows (module 10 Facility Portal remains invite-only)
- professional self-signup (still invite-only)

---

## 2. Goals

### Primary Goals

- A consumer can sign up with email/password and home location without an agency invite
- On signup, create a **care site** tied to the user (type `consumer_home`)
- Consumer can set marketplace location from care site address (shared location cookie pattern)
- Consumer can browse marketplace search/categories and add professionals to cart
- Consumer can submit staffing request at `/customer/requests/new` (shared UI with facility customers)
- Request routes to **owning agencies** of selected professionals (module 21), not to a single pre-selected agency
- Consumer sees request status and can approve fulfillment / suggested alternatives (modules 22–23)

### Secondary Goals

- Care-specific copy on signup and request form (home care, visit window, care notes)
- Link from public homepage **Find home care** → consumer signup
- Marketplace header shows **Sign in** / **My care requests** for consumers
- Duplicate-request and geo-eligibility rules same as module 20

---

## 3. Non-Goals (MVP)

- Guest checkout (account required before submit)
- Consumer creating requests without selecting at least one professional
- Agency picker (“choose your agency first”) — agency is implied by professional selection
- Multiple care sites per consumer (one care site per account in MVP)
- Medicare/insurance intake, clinical assessments, or payment
- Lead-only form without marketplace browse (post-MVP)
- Consumers accessing agency operations routes (`/dashboard`, `/staffing-requests`, etc.)

---

## 4. Primary Users

| User | Role | Access |
|---|---|---|
| Consumer (home care) | `consumer` | `/customer/*`, marketplace, care onboarding |
| Invited facility contact | `facility_user` | Unchanged: invite-only, `/customer/*` or `/facility/*` per module 10 |
| Agency users | agency roles | Routed queue only; no consumer PII beyond request |
| Public | — | Browse only until signup |

### Distinction: `consumer` vs `facility_user`

| Aspect | `facility_user` | `consumer` |
|---|---|---|
| Onboarding | Agency invite + `user_invites.facility_id` | Self-signup |
| Facility/care site | Agency-created `facilities` row | Platform-created care site on signup |
| Agency link before browse | Effectively yes (invite from agency) | **No** — discovers any eligible agency via marketplace |
| Request UI | `/customer/requests/*` | Same routes (shared) |
| Facility portal | `/facility/*` optional | **No** access |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Homepage **Find home care** | `/signup/care` |
| Marketplace (logged out) **Request care** CTA | `/signup/care?callbackUrl=...` |
| Post-signup | `/care/onboarding` or `/marketplace` with location set |
| Marketplace cart → **Continue to request** | `/customer/requests/new` |
| Nav **My care requests** | `/customer/requests` |
| Post-login redirect (`consumer`) | `/customer/requests` or `/marketplace` |

---

## 6. User Flows

### Flow A: Consumer signup and care site creation

1. User opens `/signup/care`.
2. Submits: name, email, password, phone (optional), **home address** (Places autocomplete).
3. Server:
   - Creates `users` row
   - Creates `user_roles` with `role = consumer`, `agency_id = NULL` (or platform marketplace agency id — see 8.1)
   - Creates `care_sites` row (or `facilities` with `site_kind = consumer_home`) with lat/lng, placeId, display name
   - Creates `user_care_sites` link `user_id` ↔ `care_site_id`
4. Session established; redirect to `/marketplace` with location cookie seeded from care site.
5. Display one-time explainer: staffing is **agency-coordinated**, not direct hire.

### Flow B: Discover and request (no prior agency relationship)

1. Consumer sets/confirms location (care site address).
2. Browses `/marketplace/search` or categories; sees professionals from **any** eligible agency in area.
3. Adds 1–5 professionals to cart (same role).
4. **Continue to request** → `/customer/requests/new`.
5. Form pre-fills care site; fields: availability window, role, notes (care context), optional shift type.
6. Submit → `createConsumerStaffingRequest()`:
   - `staffing_requests.source = marketplace_consumer`
   - `facility_id` = care site id (FK compatibility)
   - `agency_id` on request = **primary agency** (see 8.3)
   - Selections per professional with each pro’s `agency_id`
   - `routeStaffingRequest(requestId)` notifies each owning agency
7. Redirect `/customer/requests/[id]`.

### Flow C: Fulfillment (unchanged semantics)

1. Agencies receive routed request (module 21).
2. Coordinator confirms or declines; may propose **Suggested Alternative** (module 23).
3. Consumer approves/rejects on `/customer/requests/[id]` (same as `facility_user`).

### Flow D: Invited facility user (unchanged)

1. Agency invites `facility_user` → existing module 5/10 path.
2. `resolveCustomerFacilityScope()` via invite — **not** replaced by consumer scope resolver.

---

## 7. Screens and Routes

| Route | Auth | Purpose |
|---|---|---|
| `/signup/care` | Public | Consumer signup |
| `/care/onboarding` | `consumer` | Optional profile/address confirm |
| `/customer/requests` | `consumer` \| `facility_user` | List (shared) |
| `/customer/requests/new` | `consumer` \| `facility_user` | Create (shared) |
| `/customer/requests/[id]` | `consumer` \| `facility_user` | Detail (shared) |
| `POST /api/auth/signup/care` | Public | Signup handler |
| `GET /api/consumer/care-site` | `consumer` | Current care site |
| `PATCH /api/consumer/care-site` | `consumer` | Update address (optional MVP) |

Extend existing:

| Route | Change |
|---|---|
| `POST /api/customer/requests` | Accept `consumer` scope via `resolveCustomerOrConsumerScope()` |
| Marketplace layout | Consumer session nav + sign out |
| `middleware` / `path-access` | Allow `consumer` on `/customer/*`, `/marketplace/*` |

---

## 8. Functional Requirements

### 8.1 Role: `consumer`

- Add `consumer` to role enum (Drizzle + Auth).
- `consumer` is **not** an agency-scoped role (`agency_id` null on `user_roles`).
- Post-login redirect: `/customer/requests` or `/marketplace` (product choice in implementation).

Optional MVP pattern: attach consumers to a **platform marketplace agency** record used only as FK placeholder for `staffing_requests.agency_id` when a single agency id is required by schema. Prefer documenting explicit **primary agency** rule in 8.3 instead of hiding all consumers under one fake agency without product clarity.

### 8.2 Care site data model

**Option A (recommended):** extend `facilities` table

| Column | Type | Notes |
|---|---|---|
| `site_kind` | enum | `organization`, `consumer_home` (default `organization`) |
| `created_by_user_id` | uuid nullable | Set for consumer-created sites |
| existing address/lat/lng | | From Places |

Plus `user_care_sites`:

| Column | Type |
|---|---|
| `user_id` | uuid FK |
| `care_site_id` | uuid FK → `facilities.id` |
| `created_at` | timestamptz |

Unique: one active care site per user (MVP).

**Option B:** dedicated `care_sites` table — use only if facility FK pollution is unacceptable.

Invited facility users continue using `user_invites.facility_id` without `user_care_sites`.

### 8.3 `staffing_requests.agency_id` for consumer requests

Schema requires `staffing_requests.agency_id` NOT NULL.

**Rule (MVP):** set `agency_id` to the `agency_id` of the **first selected professional** (deterministic sort order: `sort_order` 0). Multi-agency fulfillment is handled by `staffing_request_routes` (module 21). Document in code comments.

Do **not** set request `agency_id` to consumer’s non-existent “home agency.”

### 8.4 `staffing_requests.source`

| Value | When |
|---|---|
| `marketplace_customer` | Invited facility user (module 20) |
| `marketplace_consumer` | Self-serve consumer (this module) |

Enables analytics and agency UI filters. If migration cost is high, use `marketplace_customer` + `care_site.site_kind` discriminator — prefer distinct source value when possible.

### 8.5 Scope resolution

```text
resolveCustomerOrConsumerScope(userId, email):
  if consumer role:
    load user_care_sites → facility row (site_kind = consumer_home)
    return { facilityId, facilityName, agencyId: null, scopeType: 'consumer' }
  if facility_user:
    existing resolveCustomerFacilityScope()
```

Create path must not require `facility.agency_id === scope.agencyId` for consumer scope when validating facility id — consumer’s care site may use placeholder agency or validation via `created_by_user_id`.

### 8.6 Create validation (extends module 20)

- Same: max 5 pros, same role, geo eligibility at submit, duplicate window check
- `facilityId` must equal consumer’s care site id
- Professional eligibility: **no** restriction to a single agency

### 8.7 Auth extensions (coordination with module 1)

- `POST /api/auth/signup/care` or server action `signupCareAction`
- Password rules same as agency signup
- Email uniqueness same as Auth
- No agency created for consumer

### 8.8 Copy and UX

- Use **Request care** / **Request Professional** — never **Book** or **Hire**
- Signup: “Care is coordinated by licensed staffing agencies”
- Request detail: same fulfillment disclaimers as module 20

---

## 9. Authorization Matrix

| Action | `consumer` | `facility_user` | agency roles |
|---|---|---|---|
| `/signup/care` | public | — | — |
| `/customer/requests/*` | yes (own care site) | yes (invited facility) | no |
| `/facility/*` | no | yes | no |
| `/dashboard`, `/staffing-requests` | no | no | yes |
| View marketplace public | yes | yes | yes |
| POST customer request | own site only | own facility only | no |
| Approve fulfillment / alternative | own requests | own requests | no |

---

## 10. Integration Points

| Module | Integration |
|---|---|
| **1 Auth** | New role, signup route, redirects, path-access |
| **15 Eligibility** | Care site lat/lng as `CustomerLocationContext` |
| **19 Public Marketplace** | Homepage CTA, header auth state for consumer |
| **20 Customer Requests** | Shared UI/API; scope resolver branch |
| **21 Request Routing** | Unchanged; routes per selection `agency_id` |
| **22–23 Fulfillment** | Consumer as approver on customer detail |
| **5 Facilities** | Optional: agency-created facilities unchanged |
| **10 Facility Portal** | Remains invite-only; document no consumer access |

---

## 11. Acceptance Criteria

- [ ] Consumer can sign up without invite and land on marketplace with home location set
- [ ] Consumer can search/browse and submit request with 1+ professionals from **different** agencies (if in area)
- [ ] Each owning agency receives routed notification (module 21)
- [ ] Invited `facility_user` flow still works unchanged
- [ ] Agency user cannot access `/customer/*` as customer (403/redirect)
- [ ] Consumer cannot access `/dashboard` or agency routes
- [ ] No “Book” / “Hire” language on consumer paths
- [ ] `staffing_requests` created with correct `source` and routable selections

---

## 12. Out of Scope (Future)

- Multiple care recipients per account (parent managing two addresses)
- Consumer messaging with coordinators
- Agency subscription to consumer leads by region
- Care plan templates, recurring visits
- Integration with payer/insurance
