# Facilities PRD

## 1. Module Overview

The Facilities module manages agency customer facilities (`facilities`) at `/facilities`, `/facilities/[id]`, and `/facilities/new`.

This module is responsible for:

- agency-scoped facility list with search and filters
- facility detail view with contact and location
- create facility record + optional facility user invite (`user_invites` with `role=facility_user`, `invite_type=facility_user`)
- enforcing facility location within agency service area
- role-based access: write for `agency_owner`, `agency_admin`, `staffing_coordinator`; read-only for `recruiter` and `compliance_manager`

This module does **not** implement facility portal UI, staffing request creation from facility perspective, or billing. Facility users interact via Facility Portal (future module).

---

## 2. Goals

### Primary Goals

- List facilities with operational columns for coordinators
- Create facilities using `FacilityTypeEnum` from schema
- Invite facility contact as `facility_user` linked to `facility_id`
- Validate geographic location inside agency service area
- Show facility detail with related staffing request counts (read-only aggregates when Staffing Requests module exists)
- Enforce agency data isolation

### Secondary Goals

- Edit facility contact and notes from detail (write roles)
- Resend pending facility user invites
- Link from Operations Dashboard and onboarding flows

---

## 3. Non-Goals (MVP)

- Facility portal (`/facility/*` routes)
- Staffing request CRUD on facility pages
- Multi-contact facilities
- Facility billing or contracts
- Bulk CSV import
- Public facility self-signup
- Map-based territory management beyond service area check
- Deleting facilities with historical requests (soft-delete future)

---

## 4. Primary Users

| User | Role(s) | Facilities access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read/write |
| Agency Admin | `agency_admin` | Full read/write |
| Staffing Coordinator | `staffing_coordinator` | Full read/write |
| Recruiter | `recruiter` | Read-only |
| Compliance Manager | `compliance_manager` | Read-only |
| Facility User | `facility_user` | Blocked from agency facilities routes |
| Healthcare Professional | `provider` | Blocked |
| Unauthenticated | — | Login redirect |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Facilities** | Agency user | `/facilities` |
| Dashboard **Add facility** | Write roles | `/facilities/new` |
| Onboarding facilities step | Owner/admin | Seeds `facilities` (Agency Onboarding) |
| Staffing request facility picker | Coordinator | Links when Requests module exists |

---

## 6. User Flows

### Flow A: Coordinator adds facility with invite

1. Navigate `/facilities/new`.
2. Enter name, type, location (Places), contact fields.
3. **Invite facility contact** checked (default true).
4. Submit; server validates service area + unique `contact_email` per agency.
5. Creates `facilities` row + `user_invites` (`facility_user`, `facility_id` set).
6. Redirect `/facilities/[id]` with **Invite pending**.

### Flow B: Admin adds facility without invite

1. Submit with `inviteContact=false`.
2. Facility record only; profile shows **Invite contact** CTA.

### Flow C: Recruiter read-only browse

1. Opens `/facilities` list and detail.
2. No **Add facility** button; no edit controls.

### Flow D: Edit facility contact

1. Coordinator on `/facilities/[id]` clicks **Edit**.
2. Updates `contact_name`, `contact_email`, `contact_phone`, `notes`.
3. `contact_email` uniqueness re-validated excluding self.

### Flow E: Location outside service area

1. User picks address outside radius.
2. Blocked with `OUT_OF_SERVICE_AREA_MESSAGE` client and server.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/facilities` | Facility list | All agency roles; write roles see add CTA |
| `/facilities/new` | Add facility | `agency_owner`, `agency_admin`, `staffing_coordinator` |
| `/facilities/[id]` | Facility detail | All agency roles (read); write roles edit/invite |

### API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/facilities` | List with filters |
| `GET` | `/api/facilities/[id]` | Detail + aggregates |
| `POST` | `/api/facilities` | Create + optional invite |
| `PATCH` | `/api/facilities/[id]` | Update fields |
| `POST` | `/api/facilities/[id]/invite` | Send/resend facility user invite |
| Server Action | `createFacilityAction` | `/facilities/new` submit |
| Server Action | `updateFacilityAction` | Detail edit |

---

## 8. Functional Requirements

### 8.1 Facility list (`/facilities`)

**Header**

- Title: **Facilities**
- CTA **Add facility** → `/facilities/new` (write roles)
- Subtitle count: `{n} facilities`

**Filters (URL synced)**

| Param | Type | Values |
|---|---|---|
| `q` | string | Search `name`, `contact_name`, `contact_email`, `city` |
| `type` | enum | `FacilityTypeEnum` values |
| `state` | string | Filter `state` exact match |

**Sort** (default `name ASC`)

| Key | Field |
|---|---|
| `name` | name |
| `updated` | updated_at DESC |
| `city` | city, state |

**Table columns**

| Column | Source | Display |
|---|---|---|
| Facility | `name` | Link to detail |
| Type | `type` | Label map (see §8.1.1) |
| Location | `city`, `state` | `{city}, {state}` |
| Contact | `contact_name` | Secondary line: email truncate |
| Open requests | count `staffing_requests` status active | Integer or **0** |
| Portal access | `user_invites` / linked `users` | **Invited**, **Active**, **Not invited** |
| Updated | `updated_at` | Relative time |

**Pagination:** 25 per page.

**Empty state:** **No facilities yet** + CTA **Add facility** (write roles).

#### 8.1.1 Facility type display labels

| Enum value | Label |
|---|---|
| `hospital` | Hospital |
| `nursing_home` | Nursing Home |
| `clinic` | Clinic |
| `assisted_living` | Assisted Living |
| `home_healthcare` | Home Healthcare |
| `other` | Other |

### 8.2 Add facility (`/facilities/new`)

**Form fields** → `facilities`:

| Field | DB column | Rules |
|---|---|---|
| `name` | `name` | Required; 2–255 |
| `type` | `type` | Required; `FacilityTypeEnum` |
| `location` | `GeographicLocation` | Required; maps to `place_id`, `latitude`, `longitude`, `city`, `state`, `country` |
| `addressLine1` | `address_line_1` | Optional; from Places if available |
| `addressLine2` | `address_line_2` | Optional |
| `postalCode` | `postal_code` | Optional |
| `contactName` | `contact_name` | Required; 2–120 |
| `contactEmail` | `contact_email` | Required; valid email |
| `contactPhone` | `contact_phone` | Required; 7–50 |
| `notes` | `notes` | Optional; max 2000 |
| `inviteContact` | — | Default `true` |

**Validation**

- `contact_email` unique per agency (case-insensitive) on `facilities.contact_email`.
- `isWithinServiceArea` for `location` vs agency center + `service_area_radius_miles`.
- `placeId` required on location (reject free text).

**On success**

- Insert `facilities` with `agency_id`.
- If `inviteContact`: create `user_invites` with `role=facility_user`, `invite_type=facility_user`, `facility_id`, `email=contact_email`.
- Redirect `/facilities/[id]`.

### 8.3 Facility detail (`/facilities/[id]`)

**Header**

- Facility name, type badge
- Location one-liner
- Actions (write roles): **Edit**, **Invite contact** / **Resend invite**

**Sections**

| Section | Content |
|---|---|
| Contact card | name, email (mailto), phone |
| Address | address lines, city, state, postal, country |
| Operational summary | open requests count, confirmed shifts count (when data exists) |
| Recent requests | Last 5 `staffing_requests` (title, status, updated) — link when module exists |
| Notes | `notes` text or empty |
| Activity | Last 5 `activity_logs` where `entity_type=facility` |

**Edit modal** (write roles): `name`, `type`, `contactName`, `contactEmail`, `contactPhone`, `notes` — location edit **out of scope** MVP (requires re-validation flow).

### 8.4 Facility user invite

- Email must match `contact_email` on invite (MVP: same email).
- One pending `facility_user` invite per email+agency; duplicates skipped/error per Auth.
- `facility_id` must be set on invite row.
- On accept (Auth), create `facility_user` role scoped to agency; link user to facility access rules in Facility Portal module.

### 8.5 Service area rules

Same as Workforce and Agency Onboarding:

- Use agency `primary_service_area_lat/lng` and `service_area_radius_miles` (default 75 if column missing pre-migration).
- Client: `LocationAutocomplete` + preview distance optional.
- Server: authoritative `isWithinServiceArea` check on every create; location change out of scope MVP.

### 8.6 Route guards

- Unauthenticated → login
- `provider`, `facility_user` → unauthorized redirect
- `/facilities/new` for recruiter/compliance → redirect `/facilities` + permission toast
- Wrong agency `id` → 404

---

## 9. Data Requirements

### 9.1 Schema (existing)

`facilities` per `drizzle/schema.ts`:

- `agency_id`, `name`, `type` (`FacilityTypeEnum`)
- `contact_name`, `contact_email`, `contact_phone`
- `address_line_1`, `address_line_2`, `city`, `state`, `country`, `postal_code`
- `place_id`, `latitude`, `longitude`
- `notes`

No new tables required.

### 9.2 Related reads

- `staffing_requests` — counts and recent list
- `user_invites` — portal access column
- `activity_logs` — facility activity slice

### 9.3 Writes

- All scoped to `agency_id` from session.
- Do not allow changing `agency_id` on update.

### 9.4 Dependencies

| Module | Dependency |
|---|---|
| Auth | Invites, session, facility_user role |
| Agency Onboarding | Service area, may seed facilities |
| Operations Dashboard | Links |
| Staffing Requests | Request counts (optional empty) |

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager |
|---|---|---|---|---|---|
| View `/facilities` | Yes | Yes | Yes | Yes | Yes |
| View `/facilities/[id]` | Yes | Yes | Yes | Yes | Yes |
| View `/facilities/new` | Yes | Yes | Yes | No | No |
| Create facility | Yes | Yes | Yes | No | No |
| Update facility | Yes | Yes | Yes | No | No |
| Send/resend invite | Yes | Yes | Yes | No | No |
| List/read | Yes | Yes | Yes | Yes | Yes |

**Cross-agency:** foreign facility `id` → 404.

---

## 11. UX Requirements

- Consistent agency app shell and design system.
- Type filter as dropdown with enum labels §8.1.1.
- Facility type shown as neutral badge on list/detail.
- Forms: RHF + Zod; `LocationAutocomplete`.
- Primary: **Save facility**; cancel → `/facilities`.
- Detail layout mirrors workforce profile patterns.

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Outside service area | `OUT_OF_SERVICE_AREA_MESSAGE` |
| Missing placeId | **Select a location from the suggestions** |
| Duplicate contact email | **A facility with this contact email already exists in your agency** |
| Invite without valid email | Blocked (email required on form) |
| Facility not found | 404 |
| Unauthorized create | Redirect + toast |
| Server error | Toast **Unable to save facility. Try again.** |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Requirement |
|---|---|
| `< md` | List cards; hide **Open requests** column |
| `md+` | Full table |
| `lg` | Detail two-column layout |

Touch targets ≥ 44px. No overflow at 320px.

---

## 14. Acceptance Criteria

- [ ] List, new, detail routes work for agency roles per matrix.
- [ ] Facility types use schema enum only.
- [ ] Service area enforced on create.
- [ ] `contact_email` unique per agency.
- [ ] Facility user invite creates correct `user_invites` row with `facility_id`.
- [ ] Recruiter/compliance read-only; coordinator can write.
- [ ] `provider`/`facility_user` blocked from agency routes.
- [ ] No cross-agency leakage.
- [ ] Tests and build per `test.md`.

---

## 15. Out of Scope

- Facility portal screens
- Staffing request creation UI
- Location edit on existing facility
- Facility deletion
- Multiple contacts per facility
- Contract/rate management
- Public facility registration
