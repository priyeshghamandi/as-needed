# Operations Dashboard PRD

## 1. Module Overview

The Operations Dashboard is the agency-facing home screen at `/dashboard`. It is the operational control center for staffing coordinators, recruiters, and agency leadership.

This module provides read-only operational visibility: KPI summary cards, active staffing requests table, available workforce table, a recent activity feed slice, quick navigation actions, and integration with the Agency Onboarding incomplete-setup banner.

This module is responsible for:

- authenticated agency layout shell entry at `/dashboard`
- aggregated KPI metrics for the signed-in agency
- sortable/filterable tables for active requests and available professionals (read-only)
- recent `activity_logs` feed (last 20 events)
- role-aware quick action links (navigation only; no entity CRUD on this page)
- incomplete onboarding banner for `agency_owner` and `agency_admin` (Agency Onboarding dependency)
- responsive layout for mobile through desktop

This module does **not** implement staffing request creation/editing, shift assignment, workforce CRUD, facility CRUD, compliance workflows, or notification delivery. Those belong to their respective modules; this module links to them when routes exist.

---

## 2. Goals

### Primary Goals

- Give agency users an at-a-glance operational picture within 2 seconds of page load (server-rendered shell + streamed/partial data acceptable)
- Surface the five KPI cards defined in this PRD with consistent definitions across roles
- List active staffing requests requiring coordinator attention with deep links to request detail (when Staffing Requests module exists)
- List available healthcare professionals with deep links to workforce profile (`/workforce/[id]`)
- Show recent agency activity from `activity_logs`
- Enforce agency-scoped reads only (`agency_id` from session)
- Respect role-based visibility for quick actions and sensitive columns

### Secondary Goals

- Allow KPI card click-through to pre-filtered list routes (when target modules exist)
- Show empty states that teach next operational steps (add workforce, add facility, complete onboarding)
- Degrade gracefully when dependent modules have no data yet (zero-state KPIs, empty tables)

---

## 3. Non-Goals (MVP)

- Creating, editing, or deleting staffing requests, shifts, professionals, or facilities from the dashboard
- Inline assignment or matching actions
- Full notification center (Notifications module)
- Full activity log search/export (Activity Logs module)
- Charts/analytics beyond the five KPI cards
- Facility-user or provider dashboards (separate portals)
- Real-time WebSocket updates (polling or SSR refresh on navigation is sufficient)
- Customizable dashboard widgets or user layout preferences
- Export to CSV/PDF
- Multi-agency or cross-agency reporting

---

## 4. Primary Users

| User | Role(s) | Dashboard access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read; all quick actions; sees onboarding banner when incomplete |
| Agency Admin | `agency_admin` | Full read; all quick actions; sees onboarding banner when incomplete |
| Staffing Coordinator | `staffing_coordinator` | Full read; operational quick actions; no onboarding banner |
| Recruiter | `recruiter` | Full read; limited quick actions (workforce-focused) |
| Compliance Manager | `compliance_manager` | Full read; compliance-oriented quick actions only |
| Healthcare Professional | `provider` | **Blocked** — redirect per Auth to provider portal |
| Facility User | `facility_user` | **Blocked** — redirect per Auth to facility portal |
| Unauthenticated | — | Redirect to `/login?callbackUrl=/dashboard` |

All five agency roles above may view KPI cards and tables. Write operations on entities happen only on destination routes (Workforce, Facilities, Staffing Requests), not on `/dashboard`.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Post-login redirect | Any agency role, onboarding complete | `/dashboard` (default agency home) |
| Post-onboarding completion | Owner/admin clicks **Go to dashboard** | `/dashboard`; banner hidden if complete |
| Sidebar **Dashboard** | Authenticated agency user | `/dashboard` |
| Direct URL `/dashboard` | Valid agency session | Load dashboard |
| Incomplete onboarding **Save & exit** | Owner/admin | `/dashboard` with banner |

### Post-login redirect precedence (agency users)

1. If `provider` → provider portal route (Auth; not this module)
2. If `facility_user` → facility portal route (Auth; not this module)
3. If `agency_owner` or `agency_admin` and `agencies.onboarding_completed_at IS NULL` → `/onboarding` (Agency Onboarding; overrides dashboard)
4. Else → `/dashboard`

---

## 6. User Flows

### Flow A: Coordinator morning check-in

1. Coordinator logs in; onboarding complete.
2. Lands on `/dashboard`.
3. Reviews KPI cards (open requests, fill rate, available pros, urgent shifts, compliance alerts).
4. Scans **Active Staffing Requests** table; clicks a row → `/staffing-requests/[id]` (when module exists) or disabled link with tooltip **Coming soon** until route ships.
5. Scans **Available Workforce** table; clicks professional → `/workforce/[id]`.
6. Reviews **Recent Activity** feed; clicks event entity link when supported.

### Flow B: Owner returns with incomplete onboarding

1. Owner logs in; `onboarding_completed_at` is null.
2. Redirected to `/onboarding` per Agency Onboarding (not this flow).
3. Owner uses **Save & exit** → `/dashboard`.
4. Banner shows: **Finish setting up your agency workspace** + progress % + **Continue setup** → `/onboarding`.
5. KPIs and tables still load for any seeded data; banner cannot be dismissed.

### Flow C: Recruiter workforce-focused visit

1. Recruiter opens `/dashboard`.
2. Sees all KPIs and both tables (read-only).
3. Quick actions: **Add healthcare professional** → `/workforce/new`; **View workforce** → `/workforce`.
4. **Create staffing request** hidden or disabled for recruiter role.

### Flow D: Compliance manager alert review

1. Compliance manager opens `/dashboard`.
2. Clicks **Compliance alerts** KPI card → `/compliance?filter=attention` (when Compliance module exists) or scrolls to compliance summary in feed.
3. **Available Workforce** table shows **Compliance status** column; no assignment actions.

### Flow E: Empty agency (post-onboarding, no data)

1. User completes onboarding with no professionals or requests seeded.
2. Dashboard shows KPI zeros and empty states with CTAs:
   - **Add your first healthcare professional** → `/workforce/new`
   - **Add your first facility** → `/facilities/new`
3. Quick actions reflect same links.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/dashboard` | Operations Dashboard (single page) | All agency roles in §4 |

### Layout

- Uses shared agency app layout (sidebar from Navigation Architecture in product PRD).
- Page title: **Operations Dashboard**
- Subtitle: `{agency.name}` · `{primaryServiceAreaName}` (read-only)

### Page regions (top to bottom)

1. **Incomplete onboarding banner** (conditional; Agency Onboarding)
2. **KPI card row** (5 cards)
3. **Two-column main** (`lg+`): left **Active Staffing Requests** table; right **Available Workforce** table
4. **Below main** (`md+`): **Recent Activity** feed (full width)
5. **Quick actions** bar (sticky footer on mobile optional)

### API / Server endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/dashboard/summary` | KPI aggregates + counts |
| `GET` | `/api/dashboard/active-requests` | Paginated active requests (default limit 10) |
| `GET` | `/api/dashboard/available-workforce` | Paginated available professionals (default limit 10) |
| `GET` | `/api/dashboard/activity` | Last 20 `activity_logs` for agency |

All endpoints require `requireAuthContext` with agency scope. Return `401` unauthenticated, `403` for `provider`/`facility_user`/wrong agency.

Server Components may call query functions directly instead of REST; REST paths above are the contract if using route handlers.

---

## 8. Functional Requirements

### 8.1 Incomplete onboarding banner

Reuse Agency Onboarding spec (§8.8):

- Visible when `agencies.onboarding_completed_at IS NULL` and role is `agency_owner` or `agency_admin`.
- Copy: **Finish setting up your agency workspace**
- Progress: `calculateOnboardingPercent(agency.onboarding_progress)` from Agency Onboarding helpers
- CTA: **Continue setup** → `/onboarding`
- Not dismissible until `onboarding_completed_at` is set
- Rendered above KPI cards; does not block table loading

### 8.2 KPI cards

Five cards in a responsive grid (`1 col` mobile, `2 col` `sm`, `5 col` `xl` or horizontal scroll on `md`).

| Card | Metric key | Definition | Click target |
|---|---|---|---|
| Open Requests | `openRequestsCount` | Count `staffing_requests` where `agency_id` = session agency AND `status` IN (`open`, `matching`, `partially_filled`, `at_risk`) | `/staffing-requests?status=active` or disabled until module |
| Fill Rate | `fillRatePercent` | See formula §8.2.1 | `/staffing-requests?status=active` |
| Available Professionals | `availableProfessionalsCount` | Count `healthcare_professionals` where `agency_id` = session agency AND `is_active` = true AND `availability_status` = `available` | `/workforce?availability=available` |
| Urgent Shifts | `urgentShiftsCount` | Count `shifts` where `agency_id` = session agency AND `status` NOT IN (`completed`, `cancelled`) AND `start_at` <= now() + 24 hours AND (`status` IN (`open`, `matching`, `partially_filled`) OR linked request `priority` = `urgent`) | `/shifts?urgency=24h` or disabled |
| Compliance Alerts | `complianceAlertsCount` | Count `credentials` where `agency_id` = session agency AND `status` IN (`expiring_soon`, `expired`, `pending_review`) | `/compliance?filter=attention` or disabled |

Display format:

- Integer counts for all except Fill Rate (percentage, 0 decimal places, suffix `%`).
- Trend deltas: **out of scope** for MVP.
- Loading skeleton per card while fetching.
- Error state: card shows **—** and tooltip **Unable to load metric**.

#### 8.2.1 Fill rate formula (canonical)

```
filledSlots = SUM(
  for each staffing_request r with status IN (open, matching, partially_filled, at_risk, confirmed):
    LEAST(
      count(shift_assignments a
        JOIN shifts s ON s.id = a.shift_id
        WHERE s.staffing_request_id = r.id
        AND a.status IN (accepted, confirmed, checked_in, completed)),
      r.professionals_required
    )
)
requiredSlots = SUM(r.professionals_required) for same r set

fillRatePercent = requiredSlots > 0
  ? ROUND((filledSlots / requiredSlots) * 100)
  : 0
```

Implement in `lib/dashboard/metrics.ts` as pure functions for Vitest.

### 8.3 Active Staffing Requests table

**Title:** Active Staffing Requests  
**Subtitle:** Requests needing coordinator attention  
**Default sort:** `updated_at DESC`  
**Default page size:** 10 (no pagination UI in MVP; show **View all** link)

| Column | Source | Display |
|---|---|---|
| Request | `staffing_requests.title` | Truncate 48 chars; link to detail |
| Facility | `facilities.name` via `facility_id` | Truncate 32 chars |
| Role | `staffing_requests.role_needed` | Badge: RN, CNA, etc. (uppercase label map) |
| Status | `staffing_requests.status` | Status badge (product color map) |
| Priority | `staffing_requests.priority` | Badge; highlight `urgent` |
| Progress | computed | `{filled}/{professionals_required}` filled |
| Coordinator | `users.name` via `assigned_coordinator_id` | **Unassigned** if null |
| Updated | `staffing_requests.updated_at` | Relative time (e.g. **2h ago**) |

**Row filter:** same status set as Open Requests KPI.

**Row click:** navigate to `/staffing-requests/[id]` when module exists.

**Empty state copy:** **No active staffing requests** — **When facilities or your team create requests, they will appear here.**

### 8.4 Available Workforce table

**Title:** Available Workforce  
**Subtitle:** Healthcare professionals ready for assignment  
**Default sort:** `updated_at DESC` among `availability_status = available`  
**Default page size:** 10

| Column | Source | Display |
|---|---|---|
| Name | `first_name`, `last_name` | Link to `/workforce/[id]` |
| Role | `role` | Badge |
| Location | `city`, `state` | `{city}, {state}` or **—** |
| Availability | `availability_status` | Badge (`available` = green) |
| Compliance | aggregate `credentials` | **Clear**, **Attention**, or **Blocked** — see §8.4.1 |
| Reliability | `reliability_score` | 0–100; hide column below `md` |
| Last shift | latest `shifts` via assignments | Relative date or **No shifts yet** |

**Row filter:** `is_active` = true AND `availability_status` = `available`.

**Empty state:** **No available professionals** — CTA **Add healthcare professional** → `/workforce/new`.

#### 8.4.1 Compliance status aggregate (row-level)

For each professional, query credentials:

- **Blocked:** any credential `status` = `expired` OR `rejected`
- **Attention:** no Blocked, but any `expiring_soon` OR `pending_review`
- **Clear:** all verified or no credentials

### 8.5 Recent Activity feed

**Title:** Recent Activity  
**Source:** `activity_logs` where `agency_id` = session agency, `ORDER BY created_at DESC LIMIT 20`

Each item displays:

| Field | Rule |
|---|---|
| Icon | Map from `action` prefix (request, shift, workforce, facility, compliance) |
| Title | Human-readable from `action` + `entity_type` (e.g. **Staffing request opened**) |
| Meta | Actor name if `actor_user_id` resolvable; else **System** |
| Timestamp | Relative time |
| Link | Entity route when known (`/workforce/[id]`, `/facilities/[id]`, `/staffing-requests/[id]`) |

**Empty state:** **No recent activity** — **Operational events will appear here as your team works.**

### 8.6 Quick actions

Horizontal button group; role-filtered:

| Action label | Target | Roles |
|---|---|---|
| Create staffing request | `/staffing-requests/new` | `agency_owner`, `agency_admin`, `staffing_coordinator` |
| Add healthcare professional | `/workforce/new` | `agency_owner`, `agency_admin`, `recruiter` |
| Add facility | `/facilities/new` | `agency_owner`, `agency_admin`, `staffing_coordinator` |
| View workforce | `/workforce` | All agency roles |
| View facilities | `/facilities` | All agency roles |

If target route module not merged, show disabled button with `title` tooltip **Available after {Module} is enabled**.

No forms on dashboard; buttons are navigation only.

### 8.7 Route guards

- Unauthenticated → `/login?callbackUrl=/dashboard`
- `provider` / `facility_user` → Auth unauthorized redirect
- Session without `agencyId` (invalid role) → `/login` with error
- All queries filter `WHERE agency_id = :agencyId`

### 8.8 Performance

- Target TTFB for shell < 500ms on warm server
- KPI + tables may load in parallel; show skeletons until resolved
- Database queries must use existing indexes (`idx_staffing_requests_agency`, `idx_professionals_agency`, etc.)

---

## 9. Data Requirements

### 9.1 Tables read (no new tables)

| Table | Usage |
|---|---|
| `agencies` | Name, service area label, onboarding flags for banner |
| `staffing_requests` | KPI, active requests table |
| `facilities` | Facility name join |
| `shifts` | Urgent shifts KPI |
| `shift_assignments` | Fill rate, progress column |
| `healthcare_professionals` | Available workforce table, KPI |
| `credentials` | Compliance KPI and column |
| `users` | Coordinator name, actor names |
| `activity_logs` | Activity feed |

### 9.2 No schema changes required

This module is read-only aggregation. Optional future: materialized view for KPIs — **out of scope**.

### 9.3 Query scoping

- Every query includes `agency_id` from `requireAuthContext().agencyId`.
- Never accept `agencyId` from client query params for authorization (may accept for cache keys only after server validation).

### 9.4 Dependencies

| Module | Dependency |
|---|---|
| Auth | Session, roles, agency context, route protection |
| Agency Onboarding | `onboarding_completed_at`, `onboarding_progress`, banner component |
| Workforce | Links to `/workforce`, `/workforce/[id]`, `/workforce/new` |
| Facilities | Link to `/facilities/new` |
| Staffing Requests | Active requests data meaningful when module seeds requests (may be empty until then) |
| Shifts | Urgent shifts KPI |
| Compliance | Credential statuses |

---

## 10. Authorization Rules

| Action / Data | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager |
|---|---|---|---|---|---|
| View `/dashboard` | Yes | Yes | Yes | Yes | Yes |
| View KPI cards | Yes | Yes | Yes | Yes | Yes |
| View active requests table | Yes | Yes | Yes | Yes | Yes |
| View available workforce table | Yes | Yes | Yes | Yes | Yes |
| View activity feed | Yes | Yes | Yes | Yes | Yes |
| View onboarding banner | Yes | Yes | No | No | No |
| Quick action: Create staffing request | Yes | Yes | Yes | No | No |
| Quick action: Add professional | Yes | Yes | No | Yes | No |
| Quick action: Add facility | Yes | Yes | Yes | No | No |
| Quick action: View workforce/facilities | Yes | Yes | Yes | Yes | Yes |
| API write on dashboard | No | No | No | No | No |

**Cross-agency:** any API returning another agency's metrics → `403`.

**Provider / facility_user:** middleware blocks `/dashboard` before page render.

---

## 11. UX Requirements

- Premium B2B healthcare operations aesthetic; match Agency Onboarding and Auth signup styling.
- KPI cards: white surface, subtle border, large numeric value, muted label, optional icon (lucide).
- Status badges: consistent with product-wide enum color map (open = blue, at_risk = amber, etc.).
- Tables: shadcn `Table`; zebra optional; row hover; entire row clickable when link exists.
- Typography: page title `text-2xl font-semibold`; section titles `text-lg`.
- Spacing: section gap `gap-8`; card padding `p-6`.
- Use ink/teal palette per design system; primary buttons rounded-full where used in quick actions.
- Loading: skeleton cards and table rows (min 3 skeleton rows).
- Do not show raw UUIDs in UI.

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| KPI fetch failure | Card shows **—**; log server error; no page crash |
| Table fetch failure | Inline alert: **Unable to load data. Refresh to try again.** |
| No active requests | Empty state in table region per §8.3 |
| No available professionals | Empty state with CTA per §8.4 |
| No activity | Empty state per §8.5 |
| Unauthorized role | Redirect per Auth |
| Onboarding incomplete (owner/admin) | Banner + dashboard content still visible |
| Linked module route missing | Disabled quick action with tooltip |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Requirement |
|---|---|
| `< md` | KPI cards: 2-column grid or horizontal scroll (min card width 140px); tables become stacked card lists |
| `md` | KPI 3-column; tables side-by-side stacked |
| `lg+` | Two-column main: requests left, workforce right |
| `xl` | Five KPI cards in one row |

Specific:

- Touch targets ≥ 44px on quick actions and table row taps.
- No horizontal page overflow at 320px, 768px, 1280px.
- Activity feed below tables on `< lg`.
- Reliability column hidden `< md` (see §8.4).

---

## 14. Acceptance Criteria

- [ ] `/dashboard` loads for all five agency roles.
- [ ] `provider` and `facility_user` cannot access `/dashboard`.
- [ ] Five KPI cards render with correct definitions (§8.2, §8.2.1).
- [ ] Fill rate matches Vitest golden cases.
- [ ] Active requests table shows only statuses in open/matching/partially_filled/at_risk.
- [ ] Available workforce table shows only `availability_status = available` and `is_active = true`.
- [ ] Activity feed shows max 20 agency-scoped events newest first.
- [ ] Quick actions visible per role matrix (§8.6).
- [ ] Onboarding banner shows for incomplete owner/admin; hidden when complete.
- [ ] No create/edit/delete controls for entities on dashboard.
- [ ] All data scoped to session `agency_id`; cross-agency API returns 403.
- [ ] Responsive layout passes breakpoints in §13.
- [ ] Lint, typecheck, build, and automated tests pass per `test.md`.

---

## 15. Out of Scope

- Staffing request CRUD and detail UI (Staffing Requests module)
- Shift management UI (Shifts module)
- Matching and assignment actions (Matching & Assignments module)
- Workforce and Facilities list/detail implementation (those modules own routes; dashboard links only)
- Notification center drawer
- Full compliance management UI
- Custom dashboard layouts or user preferences
- Real-time push updates
- Historical trend charts on KPI cards
