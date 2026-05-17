# Notifications & Alerts PRD

## 1. Module Overview

The Notifications & Alerts module delivers operational awareness for healthcare staffing workflows: in-app notification records, a notification center, header unread indicators, and real-time toast/banner surfaces for time-sensitive events.

This module is responsible for:

- persisting user-scoped notifications in `notifications` (`NotificationTable`)
- route `/notifications` with filterable list UI
- priority levels: `info`, `important`, `urgent`, `critical` (`NotificationPriorityEnum`)
- read/unread state via `read_at`
- server-side creation API used by other modules (shifts, requests, compliance, etc.)
- header bell + unread badge
- toast delivery for `urgent` and `critical` while user is active
- dashboard banner slot for highest-priority unread critical items
- deep links to related entities via `related_entity_type` + `related_entity_id`

This module does **not** implement email/SMS/push delivery, notification preference editing (Settings module), or Activity Logs (separate module).

---

## 2. Goals

### Primary Goals

- Give every authenticated user a reliable in-app notification inbox at `/notifications`
- Enforce user-scoped reads/writes (users only see their own rows)
- Support agency context on rows where applicable (`agency_id`)
- Surface unread counts in the app shell header
- Show immediate toasts for `urgent` and `critical` notifications when the user has an active session
- Allow other modules to create notifications through a single `createNotification` server utility
- Support marking single/all notifications as read with optimistic UI refresh

### Secondary Goals

- Filter and sort notifications for operational triage (priority, unread, date)
- Link notifications to operational entities (staffing request, shift, assignment, credential, etc.)
- Paginate large inboxes (cursor or offset MVP)
- Reuse toast/banner primitives consistently across agency app and portals

---

## 3. Non-Goals (MVP)

- Email, SMS, or mobile push providers
- WebSocket / SSE live stream (poll or refetch on navigation acceptable)
- Per-user notification preference toggles (Settings module)
- Snooze or scheduled reminders
- Notification grouping/threading
- Admin broadcast to all agency users
- Cross-agency notification visibility
- Deleting notifications (archive out of scope; read-only inbox)
- Rich HTML email templates
- Sound/desktop OS notifications

---

## 4. Primary Users

| User | Role(s) | Access |
|---|---|---|
| Agency Owner | `agency_owner` | Full inbox; receives agency operational alerts |
| Agency Admin | `agency_admin` | Full inbox |
| Staffing Coordinator | `staffing_coordinator` | Full inbox |
| Recruiter | `recruiter` | Full inbox |
| Compliance Manager | `compliance_manager` | Full inbox |
| Healthcare Professional | `provider` | Own inbox (shift invites, credentials, etc.) |
| Facility User | `facility_user` | Own inbox (request updates, assignments) |
| Unauthenticated | — | Redirect to `/login` |

All authenticated roles receive notifications scoped to `user_id = session.user.id`. Agency staff rows should include `agency_id` from session when created by agency-scoped events.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar / nav **Notifications** | Authenticated agency user | `/notifications` |
| Header bell icon | Any authenticated user | Opens `/notifications` or dropdown preview (MVP: navigate to `/notifications`) |
| Toast on login/session | Unread `urgent`/`critical` from last 24h | Show stacked toasts (max 3) once per session |
| Dashboard critical banner | Agency user with unread `critical` | Banner at top of `/dashboard` with link to `/notifications` |
| Deep link from toast/banner | Click CTA | Navigate to `related_entity` route if resolvable, else `/notifications` |
| Other modules | Server action / utility call | Insert row + optional realtime toast trigger |

### Related entity route map (MVP)

| `related_entity_type` | Route pattern |
|---|---|
| `staffing_request` | `/staffing-requests/[id]` |
| `shift` | `/shifts/[id]` |
| `shift_assignment` | `/shifts/[shiftId]` (resolve shift from assignment) |
| `healthcare_professional` | `/workforce/[id]` |
| `facility` | `/facilities/[id]` |
| `credential` | `/compliance/[id]` or workforce credential tab |
| `user_invite` | `/settings?tab=team` |
| unknown / null | `/notifications` |

If target module route does not exist yet, link falls back to `/notifications`.

---

## 6. User Flows

### Flow A: View notification center

1. User clicks header bell or nav **Notifications**.
2. Server loads paginated notifications for `user_id`, default sort `created_at DESC`.
3. Unread rows show bold title + blue dot indicator.
4. User applies filters (optional): All / Unread / priority chips.
5. User clicks row → marks read (if unread) + navigates to related entity when link exists.

### Flow B: Mark as read

1. User clicks **Mark read** on a row or opens row detail.
2. Server sets `read_at = now()` where `id` matches and `user_id` matches session.
3. Unread badge count decrements.

### Flow C: Mark all as read

1. User clicks **Mark all as read** in page header.
2. Server updates all unread rows for `user_id` (and current `agency_id` filter if agency context applied).
3. List refreshes; badge shows 0.

### Flow D: Urgent/critical toast (active session)

1. Another module calls `createNotification` with `priority=urgent|critical`.
2. Server inserts row.
3. If recipient has active session (same browser tab via client subscription or post-mutation revalidation):
   - Client shows toast: title + truncated message + **View** action.
4. Toast auto-dismisses after 8s (`urgent`) or 12s (`critical`) unless user clicks **View**.
5. Max 3 concurrent toasts; queue additional.

### Flow E: Dashboard critical banner

1. Agency user lands on `/dashboard`.
2. Server query: unread `critical` notifications for user, `created_at` within last 7 days, limit 1 newest.
3. If exists, render dismissible banner (session dismiss allowed via `sessionStorage` key per notification id; reappears on new critical).
4. CTA **Review alert** → `/notifications?priority=critical&filter=unread`.

### Flow F: Module creates notification (integration)

1. Shifts module confirms assignment declined.
2. Calls `createNotification({ userId, agencyId, title, message, priority: 'important', relatedEntityType: 'shift_assignment', relatedEntityId })`.
3. Coordinator sees inbox item; no toast (priority below urgent).

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/notifications` | Notification center (table/list + filters) | All authenticated roles |

### Layout components (app shell)

| Component | Location | Purpose |
|---|---|---|
| `NotificationBell` | Header right | Unread count badge; click → `/notifications` |
| `NotificationToastHost` | Root layout | Renders toast queue |
| `CriticalAlertBanner` | `/dashboard` top | Critical unread surfacing |

### API / Server Actions

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/notifications` | List with `?filter=unread&priority=urgent&cursor=` |
| `PATCH` | `/api/notifications/[id]/read` | Mark one read |
| `POST` | `/api/notifications/mark-all-read` | Mark all read |
| Server Action | `markNotificationReadAction` | Same as PATCH (RSC-friendly) |
| Server Action | `markAllNotificationsReadAction` | Bulk read |
| Server Utility | `createNotification` | Insert row (called from other modules, not exposed to client directly) |
| Server Utility | `createNotificationsForUsers` | Batch insert for multiple recipients |

All read/mutation endpoints must verify `notification.user_id === session.user.id`.

---

## 8. Functional Requirements

### 8.1 Data model (existing `NotificationTable`)

Use Drizzle `NotificationTable` / `notifications`:

| Column | Usage |
|---|---|
| `id` | UUID primary key |
| `agency_id` | Set for agency-scoped events; nullable for system-wide provider/facility messages |
| `user_id` | Recipient (required) |
| `title` | Short headline; max 120 chars enforced at write |
| `message` | Body; max 2000 chars |
| `priority` | `info` \| `important` \| `urgent` \| `critical` |
| `related_entity_type` | Optional varchar(80) |
| `related_entity_id` | Optional UUID |
| `read_at` | Null = unread |
| `created_at` | Sort key |

**Indexes:** use existing `idx_notifications_user`, `idx_notifications_agency`, `idx_notifications_read`.

No new tables for MVP.

### 8.2 `createNotification` utility

Location: `lib/notifications/create-notification.ts`

```ts
createNotification(input: {
  userId: string;
  agencyId?: string | null;
  title: string;
  message: string;
  priority?: 'info' | 'important' | 'urgent' | 'critical';
  relatedEntityType?: string;
  relatedEntityId?: string;
}): Promise<{ id: string }>
```

Rules:

- Validate title 1–120 chars, message 1–2000 chars
- Default `priority = 'info'`
- Trim whitespace
- Never accept `userId` from browser without server-side recipient resolution in calling module
- Return created `id` for optional client revalidation tag

### 8.3 Notification center UI (`/notifications`)

**Page header:**

- Title: **Notifications**
- Subtitle: unread count text, e.g. **3 unread**
- Actions: **Mark all as read** (disabled when unread = 0)

**Filters (client state + query string sync):**

| Control | Values |
|---|---|
| Read state | `all` (default), `unread` |
| Priority | `all`, `info`, `important`, `urgent`, `critical` |

**Table columns (`NotificationTable` UI component):**

| Column | Content |
|---|---|
| Status | Unread dot or empty |
| Priority | Badge with color: info (slate), important (blue), urgent (amber), critical (red) |
| Title | Truncated 80 chars |
| Message | Truncated 120 chars, muted |
| Related | Entity label link if resolvable |
| Time | Relative (`2h ago`) + absolute on hover tooltip |
| Actions | **Mark read** button if unread |

**Pagination:** 25 per page; **Load more** button (cursor on `created_at,id`).

**Empty states:**

| Condition | Copy |
|---|---|
| No notifications ever | **No notifications yet** — operational updates will appear here. |
| No unread after filter | **You're all caught up** |
| No matches for priority filter | **No {priority} notifications** |

### 8.4 Read/unread rules

- Unread: `read_at IS NULL`
- Mark read sets `read_at = now()`; idempotent if already read
- Opening row via primary click marks read then navigates
- Unread count query: `COUNT(*) WHERE user_id = ? AND read_at IS NULL`

### 8.5 Header bell

- Show numeric badge when unread > 0; cap display `99+`
- `aria-label`: **Notifications, {n} unread**
- Click navigates to `/notifications`
- Badge updates on route change / revalidation tag `notifications`

### 8.6 Toast integration

Use existing shadcn `Sonner` or project toast host (`NotificationToastHost`).

| Priority | Toast variant | Duration | Dismiss |
|---|---|---|---|
| `urgent` | warning | 8s | manual + auto |
| `critical` | destructive | 12s | manual only |

Trigger paths:

1. After `createNotification` from server action in same request cycle — return `{ showToast: true }` only when mutation initiated in user’s own session (rare); primary path is #2.
2. Client polls `/api/notifications?filter=unread&priority=urgent,critical&since=` every 60s on authenticated layouts OR uses `revalidateTag` after mutations in other tabs.

MVP acceptable: refetch unread urgent/critical on focus and layout mount.

Toast content:

- Title = notification `title`
- Description = first 140 chars of `message`
- Action **View** → related route or `/notifications`

### 8.7 Dashboard banner integration

Component: `CriticalAlertBanner`

- Query newest unread `critical` for current user
- Banner copy: `{title}` — **Review**
- Dismiss stores `dismissedCriticalIds` in `sessionStorage` for session only
- Does not mark notification read on dismiss

### 8.8 Standard notification templates (for other modules)

Document canonical `title` / `priority` pairs (callers use `createNotification`):

| Event | `related_entity_type` | Priority | Title template |
|---|---|---|---|
| Shift invite sent | `shift_assignment` | `important` | **New shift invite** |
| Shift declined | `shift_assignment` | `urgent` | **Shift declined** |
| Shift confirmed | `shift` | `info` | **Shift confirmed** |
| Staffing request at risk | `staffing_request` | `urgent` | **Request at risk** |
| Credential expiring | `credential` | `important` | **Credential expiring soon** |
| Credential expired | `credential` | `critical` | **Credential expired** |
| Assignment no-show | `shift_assignment` | `critical` | **No-show reported** |
| Facility request update | `staffing_request` | `info` | **Request updated** |

Other modules must not insert into `notifications` directly; use `createNotification`.

### 8.9 Authorization on API

- Unauthenticated → `401`
- Access notification by id → must match `user_id`
- Attempt to mark another user's notification → `403`
- `createNotification` only callable server-side (no public API route)

### 8.10 Middleware

- `/notifications` requires authentication
- Providers/facility users use same route in their portal shell (shared component, portal-specific layout wrapper acceptable)

---

## 9. Data Requirements

### 9.1 Schema

No migration required for MVP — use existing `NotificationTable`.

Optional future index (document only, not MVP): composite `(user_id, read_at, created_at DESC)`.

### 9.2 Reads

```sql
-- unread count
SELECT count(*) FROM notifications
WHERE user_id = $1 AND read_at IS NULL;

-- inbox page
SELECT * FROM notifications
WHERE user_id = $1
  AND ($2::boolean IS FALSE OR read_at IS NULL)
  AND ($3::text IS NULL OR priority = $3)
ORDER BY created_at DESC, id DESC
LIMIT 25;
```

Agency staff may additionally filter `agency_id = session.agencyId` when both set (include rows where `agency_id IS NULL` OR matches).

### 9.3 Writes

- Inserts only via `createNotification` / `createNotificationsForUsers`
- Updates only `read_at` on mark-read endpoints
- No hard delete in MVP

### 9.4 Cross-module contract

Export types:

```ts
export type NotificationPayload = {
  userId: string;
  agencyId?: string | null;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
};
```

Other modules import and call after successful domain mutations.

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager | provider | facility_user |
|---|---|---|---|---|---|---|---|
| View `/notifications` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View own rows only | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Mark read / mark all | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `createNotification` (server) | N/A (internal) | N/A | N/A | N/A | N/A | N/A | N/A |

**Cross-user / cross-agency:**

- Never return notifications where `user_id` ≠ session user
- Never allow marking read on another user's id
- `agency_id` on row is informational; does not grant access to other users' inboxes

---

## 11. UX Requirements

- Premium B2B operational aesthetic; match Operations Dashboard shell
- Priority badges use consistent color tokens across table, toast, and banner
- Unread rows: `font-medium` title + 8px accent dot
- Table on `lg+`; stacked cards on `< md` with same data
- Toast placement: top-right; do not cover primary nav
- Bell badge: destructive/red background when unread > 0
- Relative timestamps with timezone from agency preference when Settings provides it (fallback browser local)
- Loading skeleton for first paint; avoid layout shift on badge count

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Failed to load inbox | Full-page error card + **Retry** |
| Mark read failed | Toast: **Unable to update notification. Try again.** |
| Mark all read failed | Same toast; partial updates must not occur (use transaction) |
| Invalid notification id | `404` |
| `createNotification` validation error | Throw `ZodError` to caller; no row inserted |
| Related entity route missing | Link label **View details** → `/notifications` |
| Toast queue overflow | Drop oldest non-critical from queue |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Requirement |
|---|---|
| `< md` | Card list; filters in collapsible sheet |
| `md+` | Full table with horizontal scroll only on table container |
| All | Bell and badge visible in mobile header |
| 320px | No horizontal page overflow |

Touch targets ≥ 44px for row tap and **Mark read**.

---

## 14. Acceptance Criteria

- [ ] `/notifications` loads authenticated user's notifications only
- [ ] Unread/read state driven by `read_at`
- [ ] Priority badges reflect all four enum values
- [ ] Filters for unread and priority work with URL query sync
- [ ] Mark one and mark all read update DB and UI badge
- [ ] Header bell shows correct unread count
- [ ] `createNotification` utility used by at least one integration stub (e.g. test helper)
- [ ] Toasts appear for new `urgent`/`critical` items (client refetch path acceptable)
- [ ] Dashboard critical banner shows for unread critical items
- [ ] Cross-user mark-read returns 403/404
- [ ] Provider and facility_user can access `/notifications` in their layouts
- [ ] Lint, typecheck, build, and automated tests pass per `test.md`

---

## 15. Out of Scope

- Email/SMS/push
- Notification preferences UI
- Activity log entries (Activity Logs module)
- Deleting or archiving notifications
- Real-time WebSocket push
- Agency-wide admin notification composer
- Rich content / attachments in notifications
