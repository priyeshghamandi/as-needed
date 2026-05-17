# Workforce PRD

## 1. Module Overview

The Workforce module manages healthcare professionals (`healthcare_professionals`) for a staffing agency. It provides list, detail, and add/invite flows at `/workforce`, `/workforce/[id]`, and `/workforce/new`.

This module is responsible for:

- agency-scoped workforce list with sorting, filtering, and search
- healthcare professional profile view (read-heavy; limited edits in MVP)
- create professional record + optional provider invite (`user_invites`)
- enforcing location within agency service area radius
- role-based write access (`agency_owner`, `agency_admin`, `recruiter`) vs read-only (`staffing_coordinator`, `compliance_manager`)

This module does **not** implement availability calendar editing, shift assignment, credential upload workflows, or bulk CSV import. Those belong to Provider Portal, Matching & Assignments, and Compliance modules respectively.

---

## 2. Goals

### Primary Goals

- List all active healthcare professionals for the agency with columns defined in product PRD §6.7
- Create new professionals with validated data aligned to `drizzle/schema.ts`
- Optionally send provider invite linked to professional record
- Show profile summary with operational context (availability status, credentials summary, recent shifts)
- Reject locations outside agency service area (client + server)
- Enforce agency isolation on all reads/writes

### Secondary Goals

- Deactivate professionals (`is_active = false`) without hard delete
- Resend pending provider invites from profile
- Deep link from Operations Dashboard available workforce table

---

## 3. Non-Goals (MVP)

- Bulk CSV import
- Public healthcare professional self-signup
- Full availability calendar CRUD (Provider Portal)
- Credential document upload UI (Compliance module)
- Inline shift assignment from list
- Multi-location professionals
- Editing `reliability_score` manually (system-calculated later)
- Messaging timeline on profile
- Advanced shift readiness scoring algorithm

---

## 4. Primary Users

| User | Role(s) | Workforce access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read/write |
| Agency Admin | `agency_admin` | Full read/write |
| Recruiter | `recruiter` | Full read/write |
| Staffing Coordinator | `staffing_coordinator` | Read-only (list + profile) |
| Compliance Manager | `compliance_manager` | Read-only (list + profile); may link to Compliance module |
| Healthcare Professional | `provider` | Blocked from agency workforce routes |
| Facility User | `facility_user` | Blocked |
| Unauthenticated | — | `/login?callbackUrl=...` |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Workforce** | Agency user | `/workforce` |
| Dashboard quick action **Add healthcare professional** | Write roles | `/workforce/new` |
| Dashboard workforce table row | Any agency role | `/workforce/[id]` |
| Onboarding professionals step | Owner/admin | Creates records (Agency Onboarding); same table |
| Direct URL | Authenticated agency user | Route loads with guards |

---

## 6. User Flows

### Flow A: Recruiter adds professional with invite

1. Recruiter navigates to `/workforce/new`.
2. Fills form: name, role, contact, location (Google Places), optional specialty/years.
3. Checks **Send platform invite**.
4. Submits; server validates service area + duplicate email.
5. Creates `healthcare_professionals` row and `user_invites` (`role=provider`, `invite_type=provider`).
6. Redirect to `/workforce/[id]` with success toast; shows **Invite pending** badge.

### Flow B: Admin adds professional without invite

1. Admin submits form with `sendInvite=false`; phone required if no email.
2. Record created; `user_id` remains null.
3. Profile shows **Not invited** with CTA **Send invite** (write roles only).

### Flow C: Coordinator views list (read-only)

1. Coordinator opens `/workforce`.
2. Can search/filter/sort; cannot see **Add professional** button.
3. Opens profile; no edit controls.

### Flow D: Deactivate professional

1. Owner opens profile → **More** menu → **Deactivate**.
2. Confirm dialog; sets `is_active=false`, `availability_status=unavailable`.
3. Professional hidden from default list filter (active only); toggle **Show inactive** reveals.

### Flow E: Location outside service area rejected

1. User selects location outside radius on add form.
2. Client blocks submit with `OUT_OF_SERVICE_AREA_MESSAGE`.
3. If bypass attempted, server returns 400 with same message.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/workforce` | Workforce list | All agency roles (read); write roles see add CTA |
| `/workforce/new` | Add healthcare professional | `agency_owner`, `agency_admin`, `recruiter` |
| `/workforce/[id]` | Professional profile | All agency roles (read); write roles see actions |

### API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/workforce` | List with query params |
| `GET` | `/api/workforce/[id]` | Profile payload |
| `POST` | `/api/workforce` | Create professional (+ optional invite) |
| `PATCH` | `/api/workforce/[id]` | Update professional fields |
| `POST` | `/api/workforce/[id]/deactivate` | Set `is_active=false` |
| `POST` | `/api/workforce/[id]/invite` | Create/resend provider invite |
| Server Action | `createHealthcareProfessionalAction` | Form submit for `/workforce/new` |
| Server Action | `updateHealthcareProfessionalAction` | Profile edit |
| Server Action | `sendProfessionalInviteAction` | Invite from profile |

All mutations require write roles and `agency_id` scope.

---

## 8. Functional Requirements

### 8.1 Workforce list (`/workforce`)

**Header**

- Title: **Workforce**
- Primary CTA **Add professional** → `/workforce/new` (write roles only)
- Count subtitle: `{n} healthcare professionals`

**Filters (query string synced)**

| Param | Type | Values |
|---|---|---|
| `q` | string | Search `first_name`, `last_name`, `email` (case-insensitive) |
| `role` | enum | `rn`, `cna`, `emt`, `lpn`, `cnm`, `cns`, `other` |
| `availability` | enum | `available`, `unavailable`, `on_shift`, `pending_confirmation` |
| `compliance` | enum | `clear`, `attention`, `blocked` (computed filter) |
| `active` | boolean | Default `true`; `false` shows inactive |

**Sort** (default `last_name ASC`, `first_name ASC`)

| Sort key | Column |
|---|---|
| `name` | last_name, first_name |
| `reliability` | reliability_score DESC |
| `updated` | updated_at DESC |

**Table columns** (product PRD §6.7)

| Column | Source | Notes |
|---|---|---|
| Name | `first_name`, `last_name` | Link to profile |
| Role | `role` | Badge |
| Specialty | `specialty` | **—** if null |
| Location | `city`, `state` | `{city}, {state}` |
| Availability | `availability_status` | Badge |
| Current assignment | latest open `shift_assignments` + `shifts` | **Unassigned** if none; show facility name truncate 24 |
| Compliance status | `credentials` aggregate | Same rules as Dashboard §8.4.1 |
| Reliability | `reliability_score` | 0–100 |
| Last shift | latest completed shift end | Relative date or **No shifts yet** |
| Shift readiness | computed MVP | **Ready** if available + compliance Clear + not on_shift; else **Not ready** |

**Pagination:** 25 per page; cursor or offset acceptable.

**Empty state:** **No healthcare professionals yet** + CTA **Add professional** (write roles).

### 8.2 Add professional (`/workforce/new`)

**Form fields** → `healthcare_professionals`:

| Field | DB column | Rules |
|---|---|---|
| `firstName` | `first_name` | Required; 1–120 |
| `lastName` | `last_name` | Required; 1–120 |
| `role` | `role` | Required; `ProfessionalRoleEnum` |
| `specialty` | `specialty` | Optional; max 120 |
| `yearsExperience` | `years_experience` | Optional; int 0–60 |
| `email` | `email` | Optional; valid email; required if `sendInvite=true` |
| `phone` | `phone` | Optional; 7–50; required if no email |
| `location` | `GeographicLocation` | Required; maps to `city`, `state`, `country`, `latitude`, `longitude` |
| `sendInvite` | — | Default false |

**Validation**

- At least one of `email` or `phone`.
- Email unique per agency among `healthcare_professionals.email` (case-insensitive) when provided.
- `isWithinServiceArea(location, agencyCenter, agency.serviceAreaRadiusMiles)` — reuse `lib/places/service-area-bounds`.
- Location must include `placeId` in Zod schema (store in metadata jsonb on professional OR add migration `place_id` varchar — prefer migration column `place_id` varchar(255) nullable on `healthcare_professionals`).

**On success**

- Insert row: `agency_id`, `availability_status=unavailable`, `is_active=true`, `reliability_score=100`.
- If `sendInvite`: create `user_invites` with `role=provider`, `invite_type=provider`, `email`, `agency_id`, `invited_by_user_id`; return invite URL in response (Auth pattern).
- Redirect `/workforce/[id]`.

### 8.3 Professional profile (`/workforce/[id]`)

**Header card**

- Full name, role badge, specialty
- Availability badge
- Actions (write roles): **Edit**, **Send invite** / **Resend invite**, **Deactivate**
- Status chips: **Active** / **Inactive**, **Invited** / **Not on platform** (`user_id` set)

**Sections** (read-only MVP except basic edit modal)

| Section | Content |
|---|---|
| Contact | email, phone |
| Location | city, state, country; map link optional |
| Operational metrics | reliability score, shift readiness, last shift date |
| Credentials summary | Count by status; link **View compliance** → `/compliance?professionalId=` when module exists |
| Recent shifts | Last 5 shifts via assignments (facility, date, status) |
| Current assignments | Open assignments list |

**Edit modal** (write roles): `firstName`, `lastName`, `phone`, `specialty`, `yearsExperience`, `role` — not location in MVP edit (location change future).

### 8.4 Provider invite

- Reuse Auth invite creation (`assertCanCreateInvite` extended for recruiter on provider invites).
- One pending invite per email per agency; duplicate returns field error.
- Invite links to `user_id` on accept (Auth module).

### 8.5 Deactivate

- Sets `is_active=false`, `availability_status=unavailable`.
- Does not delete row or credentials.
- Reactivate: **out of scope** MVP (admin can PATCH `is_active=true` via API if needed — optional WORK stretch).

### 8.6 Route guards

- Unauthenticated → login with callback
- `provider`, `facility_user` → unauthorized redirect
- `/workforce/new` for read-only roles → redirect `/workforce` with toast **You don't have permission to add professionals**
- Profile/detail for wrong `agency_id` → 404 (not 403, avoid leaking IDs)

---

## 9. Data Requirements

### 9.1 Schema (existing + optional migration)

Uses `healthcare_professionals` per `drizzle/schema.ts`:

- `agency_id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `role`, `specialty`, `years_experience`
- `city`, `state`, `country`, `postal_code`, `latitude`, `longitude`
- `availability_status`, `reliability_score`, `is_active`

**Recommended migration (this module):**

```sql
ALTER TABLE healthcare_professionals
  ADD COLUMN place_id varchar(255);
```

Index: `idx_professionals_place` on `place_id` (optional).

### 9.2 Related tables (read)

- `credentials` — compliance column/summary
- `shift_assignments`, `shifts`, `facilities` — assignment columns
- `user_invites` — invite status on profile

### 9.3 Writes

- All inserts/updates `WHERE agency_id = session.agencyId`.
- Never update `user_id` from this module (Auth accept flow only).

### 9.4 Dependencies

| Module | Dependency |
|---|---|
| Auth | Session, invites, `assertCanCreateInvite` |
| Agency Onboarding | Service area radius, may seed professionals |
| Operations Dashboard | Links into workforce |
| Compliance | Credential detail (links only) |

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | recruiter | staffing_coordinator | compliance_manager |
|---|---|---|---|---|---|
| View `/workforce` | Yes | Yes | Yes | Yes | Yes |
| View `/workforce/[id]` | Yes | Yes | Yes | Yes | Yes |
| View `/workforce/new` | Yes | Yes | Yes | No | No |
| Create professional | Yes | Yes | Yes | No | No |
| Update professional | Yes | Yes | Yes | No | No |
| Deactivate | Yes | Yes | Yes | No | No |
| Send/resend invite | Yes | Yes | Yes | No | No |
| List/export | Yes | Yes | Yes | Yes | Yes |

**Cross-agency:** API returns 403 or 404 for foreign `id`.

---

## 11. UX Requirements

- Match agency app layout and dashboard styling.
- List: shadcn `Table` desktop; card list mobile `< md`.
- Filters: horizontal chip row + search input with debounce 300ms.
- Status badges consistent with dashboard.
- Forms: React Hook Form + Zod; `LocationAutocomplete` for location.
- Primary submit: **Save professional**; secondary **Cancel** → `/workforce`.
- Profile: two-column `lg` (main + sidebar metrics).
- Loading skeletons on list and profile.

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Location outside service area | Field error `OUT_OF_SERVICE_AREA_MESSAGE` |
| Missing placeId | **Select a location from the suggestions** |
| Duplicate email | **A professional with this email already exists in your agency** |
| Invite without email | **Email is required to send an invite** |
| Professional not found | 404 page |
| Unauthorized add | Redirect + toast |
| Server error | Toast **Unable to save. Try again.** |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Requirement |
|---|---|
| `< md` | List as cards; hide **Current assignment** column |
| `md` | Show full table except optional columns |
| `lg` | Full column set per §8.1 |

Touch targets ≥ 44px on CTAs and row links. No horizontal overflow at 320px.

---

## 14. Acceptance Criteria

- [ ] `/workforce` lists agency professionals with all PRD columns.
- [ ] Filters and search work and sync to URL.
- [ ] Write roles can create via `/workforce/new` with service area validation.
- [ ] Read-only roles cannot access `/workforce/new` or mutate.
- [ ] Optional provider invite creates `user_invites` row.
- [ ] Profile shows contact, metrics, credentials summary, recent shifts.
- [ ] Deactivate hides from default list.
- [ ] `provider`/`facility_user` blocked from routes.
- [ ] No cross-agency access.
- [ ] Lint, typecheck, build, tests per `test.md`.

---

## 15. Out of Scope

- Availability calendar management
- Credential upload/verification UI
- Shift assignment from profile
- Bulk import
- Public signup
- Messaging timeline
- Manual reliability editing
- Multi-location support
