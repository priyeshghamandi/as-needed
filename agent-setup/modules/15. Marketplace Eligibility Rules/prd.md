# Marketplace Eligibility Rules PRD

## 1. Module Overview

The Marketplace Eligibility Rules module is the **single source of truth** for determining whether a healthcare professional may appear on public marketplace surfaces and whether a customer location qualifies for discovery.

It provides shared eligibility services, agency UI to control opt-in visibility, and enforcement hooks consumed by Category Directory, Marketplace Search, Professional Public Profiles, and Public Marketplace modules.

This module is responsible for:

- `professional_marketplace_visibility` settings (agency-controlled opt-in)
- geography intersection checks (agency service area ∩ professional location ∩ customer/search location)
- compliance-gated visibility rules (block public visibility when credentials invalid)
- shared `lib/marketplace/eligibility.ts` API used by all discovery modules
- agency workforce UI section: **Marketplace visibility** on `/workforce/[id]`

This module does **not** implement:

- public category pages (Category Directory)
- search UI (Marketplace Search)
- public profile pages (Professional Public Profiles)
- staffing request creation (Customer Requests)
- request routing or fulfillment (modules 21–23)

---

## 2. Goals

### Primary Goals

- Enforce **opt-in, agency-controlled** public visibility per professional
- Enforce **mandatory geography filtering** with fail-closed behavior
- Expose a single eligibility function: `getEligibleProfessionals(filters)` and `isProfessionalPublicEligible(professionalId, customerContext)`
- Allow agency write roles to enable/disable marketplace visibility with audit trail
- Block visibility when compliance status fails minimum rules (configurable per agency MVP: expired critical credential = hidden)

### Secondary Goals

- Preview eligibility on workforce profile (“Visible in marketplace” badge)
- Bulk visibility toggle on workforce list (write roles, max 50 per action)

---

## 3. Non-Goals (MVP)

- Multi-region service areas per agency
- Customer-specific pricing or rate cards on public surfaces
- Automated SEO sitemap generation
- Real-time availability schedule exposure
- Public professional self-signup
- Cross-agency professional pooling

---

## 4. Primary Users

| User | Role(s) | Access |
|---|---|---|
| Agency Owner | `agency_owner` | Manage visibility settings |
| Agency Admin | `agency_admin` | Manage visibility settings |
| Recruiter | `recruiter` | Manage visibility settings |
| Compliance Manager | `compliance_manager` | Read visibility + compliance block reasons; cannot enable if blocked |
| Staffing Coordinator | `staffing_coordinator` | Read-only visibility status |
| Customer / Facility User | `facility_user` | No direct access to settings; consumes filtered results |
| Public | unauthenticated | No settings access; consumes filtered results |
| Healthcare Professional | `provider` | Cannot self-enable visibility |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Workforce profile **Marketplace** tab | Agency write/read roles | `/workforce/[id]?tab=marketplace` |
| Workforce list bulk action | Write roles | Toggle visibility modal |
| Internal API | Server modules 16–19 | `lib/marketplace/eligibility` |
| Compliance block | Compliance module hook | Auto `visibility_blocked_reason` |

---

## 6. User Flows

### Flow A: Recruiter enables marketplace visibility

1. Recruiter opens `/workforce/[id]?tab=marketplace`.
2. Sees checklist: profile complete, location in service area, compliance OK.
3. Toggles **Visible on marketplace** ON.
4. Server sets `is_marketplace_visible=true`, `marketplace_visible_at=now()`, `enabled_by_user_id`.
5. Profile shows badge **Marketplace visible**.

### Flow B: Compliance blocks visibility

1. Compliance marks critical credential `expired`.
2. Eligibility service sets `visibility_blocked_reason=compliance_expired`.
3. Public queries exclude professional even if toggle ON.
4. Agency UI shows **Blocked — compliance** with link to Compliance module.

### Flow C: Discovery module queries eligibility

1. Category/Search calls `getEligibleProfessionals({ role, customerLat, customerLng, categorySlug })`.
2. If customer location missing → return **empty array** (fail closed).
3. Filter: `is_marketplace_visible=true`, not blocked, geo match, `is_active=true`.

### Flow D: Recruiter disables visibility

1. Toggle OFF → `is_marketplace_visible=false`, `marketplace_hidden_at=now()`.
2. Public caches invalidated (if any); professional removed from next query.

---

## 7. Screens and Routes

### Agency routes

| Route | Access | Purpose |
|---|---|---|
| `/workforce/[id]?tab=marketplace` | Agency users | Visibility controls + eligibility checklist |
| `PATCH /api/workforce/[id]/marketplace-visibility` | Write roles | Toggle visibility |

### No public routes in this module

Public modules import eligibility library only.

---

## 8. Functional Requirements

### 8.1 Visibility settings schema

New table `professional_marketplace_visibility`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `healthcare_professional_id` | uuid FK unique | |
| `agency_id` | uuid FK | Denormalized for scope |
| `is_marketplace_visible` | boolean | Default `false` |
| `visibility_blocked_reason` | text nullable | `compliance_expired`, `profile_incomplete`, `location_out_of_area`, `manual_admin_block` |
| `marketplace_visible_at` | timestamptz nullable | |
| `marketplace_hidden_at` | timestamptz nullable | |
| `enabled_by_user_id` | uuid nullable | |
| `updated_at` | timestamptz | |

### 8.2 Eligibility checklist (all must pass to enable)

| Rule | Check |
|---|---|
| Professional active | `healthcare_professionals.is_active=true` |
| Location valid | `place_id` set; within agency service area |
| Profile minimum | `first_name`, `last_name`, `role`, public slug generated |
| Compliance | No `expired` status on required credentials for role (Compliance module rules) |
| Agency toggle | `is_marketplace_visible=true` and no `visibility_blocked_reason` |

### 8.3 Geography rules

Function `isGeoEligible({ professional, agency, customerLocation })`:

- Compute distance professional ↔ customer location ≤ `agency.service_area_radius_miles` (default 75).
- Customer/search location required; if invalid/missing → `false`.
- Professional must be within agency service area (existing Workforce rule).

**Fail closed:** any missing lat/lng → not eligible.

### 8.4 Shared library API

`lib/marketplace/eligibility.ts`:

```ts
isProfessionalPublicEligible(professionalId, customerContext): Promise<boolean>
getEligibleProfessionals(filters): Promise<EligibleProfessional[]>
getVisibilityBlockReason(professionalId): Promise<string | null>
assertCustomerLocationPresent(location): void // throws if missing
```

`EligibleProfessional` includes only public-safe fields (no internal notes, no exact availability blocks).

### 8.5 Agency UI — Marketplace tab

Fields/readouts:

- Toggle **Visible on marketplace** (write roles)
- Checklist with pass/fail per rule
- **Blocked reason** banner when applicable
- Last changed by / timestamp
- Link **Edit public profile** → module 17 (when slug exists)

### 8.6 Bulk toggle

- Workforce list checkbox select → **Set marketplace visibility**
- Max 50 IDs per request; partial failures returned in response

---

## 9. Data Requirements

### 9.1 Migrations

- Create `professional_marketplace_visibility`
- Add `public_slug` to `healthcare_professionals` if not present (unique, indexed)

### 9.2 Dependencies

| Module | Dependency |
|---|---|
| Workforce (4) | Professional records, locations |
| Agency Onboarding (2) | Service area center + radius |
| Compliance (11) | Credential status for block rules |

### 9.3 Activity logs

On visibility change: `activity_logs` entry `entity_type=healthcare_professional`, action `marketplace_visibility_changed`.

---

## 10. Marketplace Rules

1. Default visibility is **OFF** (opt-in).
2. Only agency write roles may enable visibility.
3. Professionals never self-enable.
4. Geography is mandatory for all public listing queries.
5. Compliance block overrides agency toggle until resolved.
6. Exact `availability_blocks` never returned from eligibility API.

---

## 11. Authorization Rules

| Action | Roles |
|---|---|
| Read visibility tab | All agency roles |
| Toggle visibility ON/OFF | `agency_owner`, `agency_admin`, `recruiter` |
| Override compliance block | `agency_owner`, `agency_admin` only (MVP: cannot override; must fix compliance) |
| Call eligibility API publicly | Unauthenticated read-only via server components; no raw DB exposure |

Cross-agency: all queries scoped by `agency_id`; professional IDs from other agencies return 404 on PATCH.

---

## 12. UX Requirements

- Marketplace tab uses operational SaaS styling (not consumer marketplace)
- Checklist with green/red indicators
- Clear copy: “Visibility is agency-controlled. Customers request professionals through staffing requests fulfilled by your coordinators.”
- Disable toggle with tooltip when checklist fails
- No “Book” or “Hire” language

---

## 13. Error States

| State | Behavior |
|---|---|
| Toggle ON but checklist fails | 400 with field errors; no DB change |
| Professional not found | 404 |
| Cross-agency PATCH | 404 |
| Missing service area on agency | Block enable; show onboarding CTA |

---

## 14. Responsive Requirements

- Marketplace tab readable on tablet; toggle and checklist stack on mobile
- Bulk modal scrollable on small screens

---

## 15. Acceptance Criteria

- [ ] Default `is_marketplace_visible=false` for new professionals
- [ ] `getEligibleProfessionals` returns empty when customer location absent
- [ ] Opt-out professionals never returned
- [ ] Out-of-area professionals never returned for customer location
- [ ] Compliance block excludes professional from public queries
- [ ] Agency write roles can toggle; coordinator read-only
- [ ] Activity log written on visibility change
- [ ] All automated tests in `test.md` pass

---

## 16. Out of Scope

- Public category/search UI
- Customer request flows
- Suggested Alternative flows
- Multi-agency float pools
- Manual geo override without location validation
