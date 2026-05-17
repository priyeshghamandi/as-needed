# Agency Onboarding PRD

## 1. Module Overview

The Agency Onboarding module guides newly registered staffing agencies from first login to operational readiness.

It runs immediately after Auth module agency owner signup (`/signup` → `/onboarding`) and collects the minimum operational data required before the agency uses Workforce, Facilities, and Staffing Requests modules.

This module is responsible for:

- post-signup wizard UX at `/onboarding`
- persisting onboarding progress per agency
- refining agency profile and service area configuration
- inviting internal agency team members (reuses Auth invites)
- adding initial healthcare professionals (records + optional provider invites)
- adding initial facilities (records + optional facility user invites)
- marking onboarding complete and routing users to `/dashboard`
- showing an incomplete-onboarding banner on `/dashboard` until complete

This module does **not** implement full Compliance configuration, Staffing Request creation, or Operations Dashboard widgets. Those belong to their respective modules.

---

## 2. Goals

### Primary Goals

- Reduce time-to-first-operational-state after agency signup
- Persist wizard progress across refresh and return visits
- Confirm or refine agency service area and staffing radius (signup already captures primary service area)
- Enable agencies to invite coordinators/recruiters during setup
- Enable agencies to seed initial workforce and facility records inside service area constraints
- Set `agencies.onboarding_completed_at` when the agency finishes the wizard
- Enforce role-based access so only agency owners/admins can complete onboarding

### Secondary Goals

- Allow skipping non-blocking steps (team, professionals, facilities) without blocking completion
- Pre-fill wizard fields from signup data where possible
- Surface actionable completion summary (counts + next steps)

---

## 3. Non-Goals (MVP)

- Billing or subscription setup
- Payroll or invoicing
- Multi-branch / multi-region agency configuration
- Full compliance requirement templates (Compliance module)
- Creating or fulfilling a staffing request inside onboarding (Staffing Requests module)
- Credential verification integrations
- Bulk CSV import for workforce or facilities
- AI onboarding assistant
- Email delivery infrastructure beyond returning invite URLs in API responses (same limitation as Auth)
- Re-onboarding existing agencies that already completed setup

---

## 4. Primary Users

| User | Role(s) | Onboarding access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read/write on all onboarding steps |
| Agency Admin | `agency_admin` | Full read/write on all onboarding steps |
| Staffing Coordinator | `staffing_coordinator` | No onboarding write; may view dashboard with incomplete banner if invited before completion |
| Recruiter | `recruiter` | No onboarding access |
| Compliance Manager | `compliance_manager` | No onboarding access |
| Healthcare Professional | `provider` | Blocked from `/onboarding` |
| Facility User | `facility_user` | Blocked from `/onboarding` |
| Unauthenticated | — | Redirect to `/login` |

Only `agency_owner` and `agency_admin` may submit onboarding step mutations.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| `POST /signup` success (Auth) | New `agency_owner` session | Redirect to `/onboarding` |
| Direct navigation | Authenticated `agency_owner` or `agency_admin`, onboarding incomplete | Load wizard at saved step |
| Direct navigation | Authenticated owner/admin, onboarding complete | Redirect to `/dashboard` |
| `/dashboard` banner CTA | Incomplete onboarding | Link to `/onboarding` |
| `/login` success | Owner/admin, onboarding incomplete | Redirect to `/onboarding` (override default `/dashboard` redirect) |

### Post-login redirect precedence (owner/admin only)

1. If `agencies.onboarding_completed_at IS NULL` → `/onboarding`
2. Else → `/dashboard` (existing role-based redirect rules)

---

## 6. User Flows

### Flow A: First-time agency owner after signup

1. User completes `/signup` (Auth): agency, owner, primary service area created.
2. User lands on `/onboarding` step `welcome`.
3. User advances through steps, saving each step server-side.
4. User may skip `team`, `professionals`, `facilities`.
5. User reaches `complete`, clicks **Go to dashboard**.
6. System sets `onboarding_completed_at`, clears incomplete state.
7. User redirected to `/dashboard`; incomplete banner hidden.

### Flow B: Resume incomplete onboarding

1. Owner/admin logs in; onboarding incomplete.
2. User redirected to `/onboarding`.
3. Wizard opens at `agencies.onboarding_current_step` (not welcome unless never advanced).
4. Previously saved step data pre-populates forms.
5. User continues from last incomplete step.

### Flow C: Save and exit mid-wizard

1. User clicks **Save & exit** in header (visible after welcome).
2. Current step progress is persisted.
3. User navigates to `/dashboard` manually or via link.
4. Dashboard shows incomplete onboarding banner with **Continue setup** → `/onboarding`.

### Flow D: Skip optional steps

1. On `team`, `professionals`, or `facilities`, user clicks **Skip for now**.
2. Step marked skipped in `onboarding_progress.skippedSteps`.
3. Wizard advances; skipped steps remain dismissible on return.

### Flow E: Add healthcare professional during onboarding

1. User on `professionals` enters professional details + location.
2. Client validates location within agency service area radius.
3. Server creates `healthcare_professionals` row scoped to `agency_id`.
4. Optional: user checks **Send invite** → creates `user_invites` with `role=provider`, `invite_type=healthcare_professional`.
5. Professional appears in step list; count updates on completion step.

### Flow F: Add facility during onboarding

1. User on `facilities` enters facility + contact + location.
2. Location validated within service area.
3. Server creates `facilities` row scoped to `agency_id`.
4. Optional: **Invite facility contact** → `user_invites` with `role=facility_user`, linked to facility.
5. Facility appears in step list.

### Flow G: Team invite during onboarding

1. User on `team` adds up to 5 rows (email + display role).
2. Submit calls existing `sendTeamInvitesAction` (Auth).
3. Duplicate pending invites for same email+agency rejected.
4. User may skip entire step.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/onboarding` | Multi-step onboarding wizard (single page, client step state + server persistence) | `agency_owner`, `agency_admin` only |

### Wizard steps (canonical `stepId` values)

| Order | `stepId` | Title | Required to complete onboarding |
|---|---|---|---|
| 1 | `welcome` | Welcome | No (informational) |
| 2 | `profile` | Agency profile | Yes |
| 3 | `service-area` | Service area | Yes |
| 4 | `team` | Operations team | No (skippable) |
| 5 | `professionals` | Healthcare professionals | No (skippable) |
| 6 | `facilities` | Facilities | No (skippable) |
| 7 | `complete` | Setup complete | Yes (final action) |

> **Note:** The current UI prototype includes `compliance` and `first-request` steps. Those are **out of scope** for this module. Implementation must align to the seven steps above.

### API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/onboarding` | Fetch agency onboarding state + step payloads |
| `PATCH` | `/api/onboarding/step` | Save a single step (`stepId` + payload) |
| `POST` | `/api/onboarding/complete` | Mark onboarding complete |
| Server Action | `sendTeamInvitesAction` | Team invites (existing Auth) |
| Server Action | `saveOnboardingProfileAction` | Profile step (or via PATCH) |
| Server Action | `saveOnboardingServiceAreaAction` | Service area step |
| Server Action | `addOnboardingProfessionalAction` | Add HP during onboarding |
| Server Action | `addOnboardingFacilityAction` | Add facility during onboarding |

All mutations must call `assertAgencyAccess` / `requireAuthContext` and verify role is `agency_owner` or `agency_admin`.

---

## 8. Functional Requirements

### 8.1 Welcome (`welcome`)

- Display agency name from session/agency record.
- Show 7-step progress indicator.
- Show estimated time: **8–12 minutes**.
- Primary CTA: **Start setup** → advances to `profile`, persists `onboarding_current_step=profile`.

### 8.2 Agency Profile (`profile`)

Collect and persist on `agencies`:

| Field | Type | Rules |
|---|---|---|
| `logoUrl` | string (URL) optional | Valid URL; max 2048 chars; MVP may use text URL field (no upload pipeline required) |
| `phone` | string | Required; 7–50 chars; E.164-ish digits acceptable |
| `website` | string optional | Valid URL if provided |
| `operationalContactName` | string | Required; 2–120 chars |
| `operationalContactEmail` | string | Required; valid email |
| `description` | text optional | Max 2000 chars |
| `staffingSpecialties` | string[] | Required; min 1; max 8; values from allowed list below |

**Allowed `staffingSpecialties` values (display labels stored as strings):**

- `RN Staffing`
- `CNA Staffing`
- `LPN Staffing`
- `Allied Health`
- `Per Diem`
- `Travel Nursing`
- `Hospital Staffing`
- `Hospice Staffing`
- `Home Health`
- `Long-Term Care`

- Pre-fill `phone` from signup owner phone if agency phone empty.
- **Continue** disabled until required fields valid.
- On save: update agency row; mark step complete in progress JSON.

### 8.3 Service Area (`service-area`)

Signup already stores primary service area on `agencies`. This step **confirms and refines** it.

| Field | Type | Rules |
|---|---|---|
| `primaryServiceArea` | `GeographicLocation` | Required; Google Places autocomplete selection only |
| `serviceAreaRadiusMiles` | number | Required; integer; min `10`; max `75` (MVP cap aligned with `DEFAULT_SERVICE_AREA_RADIUS_MILES`) |

- Pre-fill from agency signup fields (`primaryServiceAreaName`, `placeId`, lat/lng, city, state, country).
- On save: update all `primary_service_area_*` columns + new `service_area_radius_miles`.
- Reject free-text locations without `placeId`.
- Display read-only summary card: center name, radius, approximate coverage statement.

### 8.4 Team Invites (`team`)

- Reuse `sendTeamInvitesAction` with rows: `{ email, role }` where `role` is display string mapped via `teamDisplayRoleToAppRole`.
- **Allowed display roles:** Staffing Coordinator, Recruiter, Compliance Manager, Operations Manager.
- Max 5 invites per submit; max 20 per action (existing schema).
- Show inline results: sent / skipped / error per email.
- **Skip for now** marks step skipped without invites.
- Do not require invites to complete onboarding.

### 8.5 Healthcare Professionals (`professionals`)

**Add professional form fields:**

| Field | Type | Rules |
|---|---|---|
| `firstName` | string | Required; 1–120 |
| `lastName` | string | Required; 1–120 |
| `role` | enum | Required; one of `rn`, `cna`, `emt`, `lpn`, `cnm`, `cns` |
| `email` | string | Optional; valid email if provided |
| `phone` | string | Optional; 7–50 if provided |
| `location` | `GeographicLocation` | Required |
| `sendInvite` | boolean | Default false; if true, `email` required |

**Validation:**

- Email unique per agency among `healthcare_professionals.email` (case-insensitive) when provided.
- Location must satisfy `isWithinServiceArea(location, agencyCenter, agency.serviceAreaRadiusMiles)`.
- At least one of email or phone required.

**List UI:**

- Show table/cards of professionals added in this session and persisted for agency.
- Allow removing not-yet-invited draft rows client-side only before save; persisted rows show **Added** badge (delete out of scope MVP).

**Skip:** allowed; no minimum count.

### 8.6 Facilities (`facilities`)

**Add facility form fields:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required; 2–255 |
| `type` | enum | Required; `hospital`, `nursing_home`, `clinic`, `assisted_living`, `home_healthcare`, `other` |
| `location` | `GeographicLocation` | Required |
| `contactName` | string | Required; 2–120 |
| `contactEmail` | string | Required; valid email |
| `contactPhone` | string | Required; 7–50 |
| `inviteContact` | boolean | Default true |

**Validation:**

- `contactEmail` unique per agency among `facilities.contact_email` (case-insensitive).
- Location within agency service area radius.
- Creates `facilities` row with `agency_id` scope.

**Skip:** allowed.

### 8.7 Completion (`complete`)

Display:

- Count of `healthcare_professionals` for agency (active)
- Count of `facilities` for agency
- Count of pending `user_invites` sent during onboarding (optional)
- Checklist of completed vs skipped steps
- Recommended next actions (links only; no implementation):
  - Go to Workforce
  - Go to Facilities
  - Go to Staffing Requests (disabled/coming soon label until module exists)

Primary CTA: **Go to dashboard**

- Sets `onboarding_completed_at = now()`
- Sets `onboarding_current_step = complete`
- Redirects to `/dashboard`

### 8.8 Dashboard incomplete banner

On `/dashboard` (Operations Dashboard shell may be minimal):

- Visible when `onboarding_completed_at IS NULL` and user is `agency_owner` or `agency_admin`.
- Copy: **Finish setting up your agency workspace** + progress percentage.
- CTA: **Continue setup** → `/onboarding`
- Dismiss not allowed until complete (no localStorage dismiss).

### 8.9 Progress persistence

Store on `agencies`:

| Column | Type | Purpose |
|---|---|---|
| `onboarding_current_step` | varchar(32) | Last active step id |
| `onboarding_completed_at` | timestamptz nullable | Null = incomplete |
| `onboarding_progress` | jsonb | `{ completedSteps: string[], skippedSteps: string[] }` |
| `service_area_radius_miles` | integer | Staffing radius |

**Rules:**

- Each successful step save appends `stepId` to `completedSteps` if not skipped.
- Skip appends to `skippedSteps` and advances `onboarding_current_step`.
- Percent complete = `round((completedRequiredSteps / 4) * 100)` where required steps are `profile`, `service-area`, and final completion action, plus at least reaching `complete` step. Skipped optional steps do not reduce percentage below 100% when completion clicked.

### 8.10 Middleware / route guards

- Unauthenticated → `/login?callbackUrl=/onboarding`
- `provider` or `facility_user` visiting `/onboarding` → redirect per `getUnauthorizedRedirect`
- `agency_owner` / `agency_admin` with `onboarding_completed_at` set visiting `/onboarding` → redirect `/dashboard`
- Other agency roles visiting `/onboarding` → redirect `/dashboard` with toast **Only agency owners and admins can complete setup**

---

## 9. Data Requirements

### 9.1 Schema changes (this module)

Add columns to `agencies`:

```sql
operational_contact_name varchar(120)
operational_contact_email varchar(255)
description text
logo_url text
staffing_specialties jsonb not null default '[]'
service_area_radius_miles integer not null default 75
onboarding_current_step varchar(32) not null default 'welcome'
onboarding_completed_at timestamptz
onboarding_progress jsonb not null default '{"completedSteps":[],"skippedSteps":[]}'
```

No new tables required if using existing `healthcare_professionals`, `facilities`, `user_invites`.

### 9.2 Reads

- Load agency by `context.agencyId` for wizard prefill.
- Load professionals/facilities counts for completion step.
- Load service area via `getAgencyServiceAreaForUser` (extend to include `radiusMiles` from DB).

### 9.3 Writes

- All writes scoped to authenticated user's agency.
- Use transactions when creating professional + invite together.
- Never write to another agency's rows (enforce `agency_id` on WHERE clauses).

### 9.4 Dependency on Auth signup data

Already on `agencies` from signup:

- `name`, `agency_type`, `workforce_size`
- `primary_service_area_*` fields
- Owner user in `users` + `user_roles`

Onboarding must not require re-entering agency name or owner email.

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager | provider | facility_user |
|---|---|---|---|---|---|---|---|
| View `/onboarding` | Yes | Yes | No (redirect) | No | No | No | No |
| Save onboarding steps | Yes | Yes | No | No | No | No | No |
| Complete onboarding | Yes | Yes | No | No | No | No | No |
| View incomplete banner | Yes | Yes | No | No | No | No | No |
| `sendTeamInvitesAction` | Yes | Yes | If Auth allows* | No | No | No | No |

\*Team invites follow Auth `assertCanCreateInvite` (owner/admin per Auth implementation).

**Cross-agency:**

- API must return `403` if `agencyId` in path/body does not match session agency.
- Never return another agency's onboarding state.

---

## 11. UX Requirements

- Premium B2B healthcare operations aesthetic (match existing signup/onboarding prototype).
- Layout: sticky header with logo, step progress (7 steps), sign out, save & exit.
- Step content: max-width ~1100px, generous whitespace, operational copy.
- Use shadcn/ui primitives, `LocationAutocomplete`, status badges, cards for summaries.
- Step transitions: subtle fade (`rise-in` animation class acceptable).
- Primary buttons: rounded-full, ink/teal palette per design system.
- Show inline field errors below inputs (React Hook Form + Zod).
- Loading: disable CTAs and show spinner on server actions.
- Empty states:
  - No professionals yet: **No healthcare professionals added yet** + hint
  - No facilities yet: **No facilities added yet** + hint
  - No team invites: show role explainer cards

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Invalid location (no placeId) | Block submit; message: **Select a location from the suggestions** |
| Location outside service area | Block submit; message: `OUT_OF_SERVICE_AREA_MESSAGE` |
| Duplicate professional email | 409 or field error: **A professional with this email already exists in your agency** |
| Duplicate facility contact email | Field error: **A facility with this contact email already exists** |
| Team invite invalid email | Row-level error from action |
| Team invite duplicate pending | status `skipped` with message |
| Unauthorized role | Redirect to `/dashboard` or `/login` |
| Network/server error | Toast: **Unable to save progress. Try again.**; retain form state |
| Google Places unavailable | Show manual retry; block location submit |
| Complete onboarding without required steps | Block with message listing missing steps (`profile`, `service-area`) |

---

## 13. Mobile and Responsive Requirements

Breakpoints (Tailwind defaults):

| Breakpoint | Requirement |
|---|---|
| `< md` (mobile) | Single column; progress steps show short labels; table → stacked cards |
| `md` | Two-column grids where applicable |
| `lg+` | Full 12-column grid layouts per prototype |

Specific:

- Header: hide **Step X of Y** text below `md`; keep progress dots.
- Progress indicator: horizontal scroll on mobile if overflow; no clipped touch targets (min 44px).
- Forms: full-width inputs; sticky footer actions on mobile optional.
- Professional/facility lists: card layout on mobile, table on `lg`.
- Verify no horizontal page overflow at 320px, 768px, 1280px widths.

---

## 14. Acceptance Criteria

- [ ] New agency owner signup lands on `/onboarding` (Auth integration unchanged).
- [ ] Only `agency_owner` and `agency_admin` can save onboarding steps.
- [ ] `provider` and `facility_user` cannot access `/onboarding`.
- [ ] Profile step saves all required fields with validation.
- [ ] Service area step updates place fields + `service_area_radius_miles`.
- [ ] Professional location rejected when outside radius.
- [ ] Facility location rejected when outside radius.
- [ ] Team invite step uses Auth invite flow; skip works.
- [ ] Professionals and facilities steps skippable.
- [ ] Progress survives page refresh (correct step restored).
- [ ] Save & exit persists state; dashboard banner visible.
- [ ] Completion sets `onboarding_completed_at` and redirects to `/dashboard`.
- [ ] Completed users hitting `/onboarding` redirect to `/dashboard`.
- [ ] Banner hidden after completion.
- [ ] No cross-agency data access in onboarding APIs.
- [ ] Lint, typecheck, build, and automated tests pass per `test.md`.

---

## 15. Out of Scope

- Compliance requirement configuration UI
- Creating staffing requests inside onboarding
- Logo file upload to object storage (URL field only for MVP)
- Operations Dashboard metrics implementation
- Workforce/Facilities module list pages (only onboarding seeding)
- Public facility self-serve signup
- Healthcare professional public signup
- Re-running onboarding after completion
- Multi-service-area agencies
