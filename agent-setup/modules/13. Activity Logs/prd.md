# Activity Logs PRD

## 1. Module Overview

The Activity Logs module provides an agency-scoped operational audit feed: immutable event records written when other modules mutate domain entities, displayed on the Operations Dashboard and on entity detail pages.

This module is responsible for:

- persisting events in `activity_logs` (`ActivityLogTable`)
- server-side `logActivity` utility invoked from other modules' server actions
- dashboard **Recent activity** feed (agency-wide, paginated)
- entity-scoped **Activity** panels on detail pages (staffing request, shift, workforce, facility)
- consistent `action`, `entity_type`, `entity_id`, and optional `metadata` JSON
- actor attribution via `actor_user_id` (nullable for system events)

This module does **not** implement a standalone full-page audit explorer (post-MVP), user-facing notifications (Notifications module), or compliance-grade tamper-proof logging.

---

## 2. Goals

### Primary Goals

- Record meaningful operational events whenever agency data changes in other modules
- Enforce `agency_id` scope on all reads and writes
- Show recent agency activity on `/dashboard` for agency roles
- Show filtered activity history on entity detail routes
- Provide a single `logActivity` contract so feature modules do not duplicate logging logic
- Display human-readable action labels and actor names

### Secondary Goals

- Support metadata for before/after snippets (non-PII, small JSON)
- Paginate feeds consistently
- Link from activity rows to entity detail when viewer has access
- Filter dashboard feed by coarse action category (optional MVP chip)

---

## 3. Non-Goals (MVP)

- Standalone route `/activity-logs` (optional future; not required MVP)
- Export to CSV / SIEM integration
- Retention policies or automatic purge jobs
- Editing or deleting log rows
- Full-text search across all agency history
- Platform-admin global audit across agencies
- Real-time websocket feed
- IP address / user agent capture (future security hardening)
- Activity logs for facility_user or provider portals (agency app only for MVP)

---

## 4. Primary Users

| User | Role(s) | Access |
|---|---|---|
| Agency Owner | `agency_owner` | Dashboard feed + all entity panels in agency app |
| Agency Admin | `agency_admin` | Same |
| Staffing Coordinator | `staffing_coordinator` | Same |
| Recruiter | `recruiter` | Same |
| Compliance Manager | `compliance_manager` | Same |
| Healthcare Professional | `provider` | No agency activity feeds (MVP) |
| Facility User | `facility_user` | No agency activity feeds (MVP) |
| Unauthenticated | — | Redirect |

Activity logs are **agency-internal operational visibility**, not provider/facility facing in MVP.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| `/dashboard` **Recent activity** card | Agency role authenticated | Last 15 agency events |
| `/staffing-requests/[id]` Activity tab/panel | Agency role + entity in agency | Events where `entity_type=staffing_request` AND `entity_id=id` OR metadata links |
| `/shifts/[id]` Activity panel | Agency role | `entity_type=shift` |
| `/workforce/[id]` Activity panel | Agency role | `entity_type=healthcare_professional` |
| `/facilities/[id]` Activity panel | Agency role | `entity_type=facility` |
| Server actions in other modules | Successful mutation | `logActivity(...)` call |

---

## 6. User Flows

### Flow A: Dashboard recent activity

1. Agency user opens `/dashboard`.
2. Server loads 15 newest `activity_logs` for `agency_id = session.agencyId`.
3. Each row shows: relative time, actor name (or **System**), action label, entity link.
4. User clicks **View all** → scrolls dashboard section expanded to 50 items OR navigates to anchor `#recent-activity` with load more (no separate route MVP).

### Flow B: Entity detail activity panel

1. User opens staffing request detail.
2. **Activity** section loads events:
   - Primary: `entity_type = 'staffing_request' AND entity_id = :id`
   - Include child events if `metadata.parentEntityId = :id` (optional convention)
3. User sees chronological list (newest first), 20 per page with **Load more**.

### Flow C: Other module writes log (integration)

1. Coordinator assigns professional to shift (Matching module).
2. Server action commits assignment.
3. Calls `logActivity({ agencyId, actorUserId, action: 'shift.assignment.invited', entityType: 'shift_assignment', entityId, metadata: { shiftId, professionalId } })`.
4. Event appears on shift detail, staffing request (if linked), and dashboard feed.

### Flow D: System event without actor

1. Scheduled job or migration marks request at risk (future).
2. `logActivity` with `actorUserId: null`, action `staffing_request.at_risk`.
3. UI shows actor **System**.

---

## 7. Screens and Routes

### Surfaces (no dedicated list route MVP)

| Surface | Route | Component |
|---|---|---|
| Dashboard feed | `/dashboard` | `RecentActivityFeed` |
| Staffing request activity | `/staffing-requests/[id]` | `EntityActivityPanel` |
| Shift activity | `/shifts/[id]` | `EntityActivityPanel` |
| Workforce activity | `/workforce/[id]` | `EntityActivityPanel` |
| Facility activity | `/facilities/[id]` | `EntityActivityPanel` |

### API / Server

| Method | Path / Utility | Purpose |
|---|---|---|
| `GET` | `/api/activity-logs?limit=&cursor=&entityType=&entityId=` | Agency-scoped list (agency roles) |
| Server Utility | `logActivity` | Insert row (server-only) |
| Server Utility | `formatActivityAction` | Map `action` key → display label |

`logActivity` is **not** exposed to the browser.

---

## 8. Functional Requirements

### 8.1 Data model (`ActivityLogTable`)

| Column | Rules |
|---|---|
| `id` | UUID PK |
| `agency_id` | Required; must match session agency on read |
| `actor_user_id` | Optional; FK `users`; null → display **System** |
| `action` | Required; namespaced string max 120; e.g. `shift.created` |
| `entity_type` | Required; max 80; e.g. `shift`, `staffing_request` |
| `entity_id` | Required UUID |
| `metadata` | Optional JSON object; max 4KB serialized |
| `created_at` | Immutable timestamp |

**Immutability:** no UPDATE/DELETE endpoints in MVP.

### 8.2 `logActivity` utility

Location: `lib/activity/log-activity.ts`

```ts
logActivity(input: {
  agencyId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string }>
```

Validation (Zod):

- `action`: regex `^[a-z][a-z0-9_.]{2,119}$`
- `entityType`: same pattern
- `entityId`: UUID
- `metadata`: JSON serializable; reject > 4096 bytes
- `agencyId` required

Callers must invoke **after** successful DB mutation in same request (or same transaction if caller supports it).

### 8.3 Canonical action catalog (MVP minimum)

Other modules should use these keys (extend as modules ship):

| Action key | Display label | Typical entity |
|---|---|---|
| `agency.onboarding.completed` | Onboarding completed | `agency` |
| `facility.created` | Facility added | `facility` |
| `facility.updated` | Facility updated | `facility` |
| `healthcare_professional.created` | Professional added | `healthcare_professional` |
| `healthcare_professional.updated` | Professional updated | `healthcare_professional` |
| `staffing_request.created` | Staffing request created | `staffing_request` |
| `staffing_request.status_changed` | Request status changed | `staffing_request` |
| `shift.created` | Shift created | `shift` |
| `shift.status_changed` | Shift status changed | `shift` |
| `shift_assignment.invited` | Professional invited to shift | `shift_assignment` |
| `shift_assignment.accepted` | Assignment accepted | `shift_assignment` |
| `shift_assignment.declined` | Assignment declined | `shift_assignment` |
| `credential.verified` | Credential verified | `credential` |
| `credential.expired` | Credential expired | `credential` |
| `user_invite.sent` | Team invite sent | `user_invite` |
| `settings.updated` | Agency settings updated | `agency` |

Unknown actions: humanize key (`shift.assignment.invited` → **Shift assignment invited**).

### 8.4 Metadata conventions

Allowed keys (optional):

| Key | Type | Purpose |
|---|---|---|
| `fromStatus` | string | Status transition |
| `toStatus` | string | Status transition |
| `professionalId` | uuid | Related professional |
| `shiftId` | uuid | Related shift |
| `staffingRequestId` | uuid | Related request |
| `summary` | string | Short non-PII note (max 200 chars) |

Do not store passwords, tokens, or full PHI in metadata.

### 8.5 `RecentActivityFeed` (dashboard)

- Section title: **Recent activity**
- Subtitle: **Latest operational events across your agency**
- Default 15 rows; **Load more** adds 15 up to 50 max per session
- Row layout:
  - Left: relative time
  - Center: `{actor} {action label} {entity link}`
  - Right: chevron if clickable
- Empty: **No activity yet** — events appear as your team uses the platform.
- Loading skeleton: 5 rows

### 8.6 `EntityActivityPanel`

Props: `entityType`, `entityId`, `agencyId`

- Title: **Activity**
- Same row format as dashboard
- Query: `WHERE agency_id = ? AND entity_type = ? AND entity_id = ?`
- Pagination: 20 per page
- Empty: **No activity recorded for this {entity}**

Entity link in row hidden when already on that entity's page (show entity name plain text).

### 8.7 `ActivityLogTable` UI component (shared)

Reusable table/list for feeds:

| Column | Content |
|---|---|
| Time | Relative + tooltip absolute |
| Actor | User name or **System** |
| Action | Formatted label |
| Entity | Type badge + link |
| Details | Expandable metadata summary (if `metadata.summary` or status change) |

Mobile: stacked timeline layout with vertical connector line.

### 8.8 Reads API `GET /api/activity-logs`

Query params:

| Param | Rules |
|---|---|
| `limit` | Default 15; max 50 |
| `cursor` | Opaque `createdAt,id` |
| `entityType` | Optional filter |
| `entityId` | Required if `entityType` set |
| `actionPrefix` | Optional e.g. `shift.` |

Authorization:

- Require authenticated agency role with `agencyId` in session
- `WHERE agency_id = session.agencyId` always
- Return `403` if query `entityId` belongs to another agency (verify via entity lookup or join)

### 8.9 Integration requirements for other modules

Each implementing module must call `logActivity` on successful:

| Module | Events |
|---|---|
| Agency Onboarding | `agency.onboarding.completed` |
| Workforce | professional created/updated |
| Facilities | facility created/updated |
| Staffing Requests | created, status_changed |
| Shifts | created, status_changed |
| Matching & Assignments | assignment invited/accepted/declined |
| Compliance | credential verified/expired |
| Settings | `settings.updated` |
| Auth | `user_invite.sent` (when invite created) |

Activity Logs module ships the utility + UI; feature modules add calls in their server actions (documented in their tasks).

### 8.10 Authorization

- Provider / facility_user: no access to `/api/activity-logs` (403)
- Agency roles without `agencyId`: 403
- Cross-agency: never return rows where `agency_id` ≠ session

---

## 9. Data Requirements

### 9.1 Schema

No new tables — use existing `ActivityLogTable`.

Optional migration (non-blocking): index `(agency_id, created_at DESC)` if query perf requires.

### 9.2 Writes

- Insert only via `logActivity`
- Prefer same transaction as domain write when caller uses `db.transaction`

### 9.3 Reads

Join `users` on `actor_user_id` for display name (left join; null actor → System).

Entity link resolver mirrors Notifications module patterns (`lib/activity/entity-route.ts`).

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager | provider | facility_user |
|---|---|---|---|---|---|---|---|
| View dashboard feed | Yes | Yes | Yes | Yes | Yes | No | No |
| View entity activity panel | Yes | Yes | Yes | Yes | Yes | No | No |
| `GET /api/activity-logs` | Yes | Yes | Yes | Yes | Yes | No | No |
| `logActivity` (server) | Internal | Internal | Internal | Internal | Internal | Internal | Internal |

---

## 11. UX Requirements

- Timeline aesthetic on mobile; clean table on desktop
- Muted timestamps; primary emphasis on action sentence
- Entity type badges: subtle outline pills
- Actor avatar initials optional (use first letter of name)
- Do not overwhelm dashboard — max 50 loaded items
- Consistent with Operations Dashboard spacing/typography

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Feed load failure | Inline error **Unable to load activity** + Retry |
| Empty agency history | Dashboard empty copy per 8.5 |
| Empty entity history | Entity panel empty copy |
| Invalid cursor | Reset to first page |
| `logActivity` validation failure | Throw to caller; domain mutation should roll back if in transaction |
| Entity in another agency | API 403; panel hidden on detail guard |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Behavior |
|---|---|
| `< md` | Vertical timeline cards |
| `md+` | Compact table |
| 320px | No horizontal overflow |

Touch-friendly **Load more** (min 44px height).

---

## 14. Acceptance Criteria

- [ ] `logActivity` inserts valid rows with agency and entity fields
- [ ] Dashboard shows agency-scoped recent feed (15 items)
- [ ] Entity panels on staffing request, shift, workforce, facility detail pages
- [ ] `ActivityLogTable` / timeline component reused across surfaces
- [ ] Actor names resolve; null actor shows **System**
- [ ] API enforces agency scope; provider/facility denied
- [ ] At least two integration call sites documented (e.g. Settings + Workforce stubs)
- [ ] No update/delete of log rows
- [ ] Lint, typecheck, build, tests pass per `test.md`

---

## 15. Out of Scope

- Dedicated `/activity-logs` admin browser page
- Provider/facility portal activity views
- Log export and retention automation
- Notifications (separate module)
- Immutable external audit warehouse
