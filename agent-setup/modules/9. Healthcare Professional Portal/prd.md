# Healthcare Professional Portal PRD

## 1. Module Overview

The Healthcare Professional Portal module gives invited healthcare professionals (`provider` role) a mobile-first workspace to view shift invites, accept or decline assignments, and manage personal availability blocks.

This module is responsible for:

- `/my-shifts` — shift invites and confirmed/upcoming shifts for the logged-in professional only
- `/availability` — CRUD for `availability_blocks` tied to the professional’s `healthcare_professionals` record
- Server actions / API routes scoped to `professional_id` derived from `users.id` → `healthcare_professionals.user_id`
- Accept/decline flows updating `shift_assignments.status` (`invited` → `accepted` | `declined`)
- Route protection so only `provider` users access portal routes (Auth `path-access.ts` already lists `/my-shifts`, `/availability`)

This module does **not** implement:

- Agency coordinator matching or invite creation (Matching & Assignments module)
- Credential upload UI (Compliance module; providers may view read-only summary on shift detail only)
- Cancellation/replacement requests (future module)
- Push/SMS notifications (Notifications module)
- Messaging coordinator (Messages — post-MVP)

**Depends on:** Auth, Workforce (professional record + `user_id` link), Shifts, Matching & Assignments (assignments with `status=invited`).

---

## 2. Goals

### Primary Goals

- Let providers see pending shift invites and respond within seconds on mobile
- Let providers manage availability blocks that coordinators use for matching
- Enforce that providers only read/write their own assignments and availability
- Keep UX fast, thumb-friendly, and status-driven

### Secondary Goals

- Surface shift context (facility, time, role, instructions) before accept/decline
- Warn on schedule overlap with existing accepted/confirmed assignments (client + server)
- Update `healthcare_professionals.availability_status` when appropriate after block changes

---

## 3. Non-Goals (MVP)

- Public provider signup
- Multi-agency provider switching
- Weekly recurring availability templates (single block CRUD only)
- Preferred facilities / shift-type preferences UI
- Check-in / check-out on shift (future Shifts extension)
- Request shift cancellation or replacement
- In-app chat with coordinator
- Document upload for credentials
- Calendar sync (Google/Outlook)
- Native mobile apps

---

## 4. Primary Users

| User | Role | Portal access |
|---|---|---|
| Healthcare Professional | `provider` | Full read/write on own shifts and availability |
| Agency Owner | `agency_owner` | No access to `/my-shifts` or `/availability` (agency routes) |
| Agency Admin | `agency_admin` | No access |
| Staffing Coordinator | `staffing_coordinator` | No access |
| Recruiter | `recruiter` | No access |
| Compliance Manager | `compliance_manager` | No access |
| Facility User | `facility_user` | No access |
| Unauthenticated | — | Redirect to `/login?callbackUrl=<path>` |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Post-login redirect (Auth) | `provider` role | `/my-shifts` |
| Direct `/my-shifts` | Authenticated provider with linked `healthcare_professionals` row | My Shifts page |
| Direct `/availability` | Same as above | Availability page |
| Email/deep link (future) | Not in MVP | — |
| Unauthorized role visits portal route | Agency or facility user | Redirect via `getUnauthorizedRedirect` |

### Professional resolution rule

On each request, resolve `professionalId` where:

```sql
healthcare_professionals.user_id = session.user.id
AND healthcare_professionals.is_active = true
```

If no row exists: show blocking empty state **Account not linked** with copy to contact agency coordinator (do not expose agency data).

---

## 6. User Flows

### Flow A: View pending shift invites

1. Provider logs in → lands on `/my-shifts`.
2. Default tab **Invites** lists `shift_assignments` where `professional_id = self` and `status = 'invited'`, joined with `shifts` + `facilities` + `staffing_requests`.
3. Each card shows facility name, shift date/time (agency timezone display: facility city/state fallback UTC), role needed, assignment status badge.
4. Provider taps card → slide-over or navigates to invite detail panel on same page (`?assignmentId=` query optional).

### Flow B: Accept shift invite

1. From invite detail, provider taps **Accept shift**.
2. Confirmation sheet shows shift summary + compliance readiness line (read-only: count of `credentials` with `status IN ('verified','expiring_soon')` for professional).
3. Server validates: assignment `status === 'invited'`, shift not `cancelled`, no time overlap with other assignments in `accepted|confirmed|checked_in` for same professional.
4. Server updates `shift_assignments`: `status = 'accepted'`, `responded_at = now()`.
5. If shift `required_count` satisfied by accepted count, coordinator logic may confirm later (out of scope); UI shows **Accepted — awaiting confirmation** if shift still `partially_filled`.
6. Toast success; card moves to **Upcoming** tab.

### Flow C: Decline shift invite

1. Provider taps **Decline shift**.
2. Modal: optional `declineReason` (enum + free text for `other`).
3. Server sets `status = 'declined'`, `responded_at = now()`, stores `decline_reason`.
4. Invite removed from Invites list; optional activity log deferred to Activity Logs module.

### Flow D: View upcoming and past shifts

1. **Upcoming** tab: assignments `accepted|confirmed` with `shifts.end_at >= now()`.
2. **Past** tab: assignments `completed|cancelled|no_show` or shift ended.
3. Cards are read-only except **View details** (expand instructions, coordinator contact from `staffing_requests.assigned_coordinator_id` name/email if present).

### Flow E: Create availability block

1. Provider opens `/availability`.
2. Taps **Add availability**.
3. Form: `startAt`, `endAt` (datetime-local, converted to timestamptz), `status` (`available` | `unavailable`), `notes` optional (max 500).
4. Validation: `endAt > startAt`, duration min 30 minutes, max 14 days, no overlap with existing blocks for same professional (excluding edit self).
5. Insert `availability_blocks` row.
6. Optionally set `healthcare_professionals.availability_status = 'available'` when creating an `available` block starting within 7 days.

### Flow F: Edit or delete availability block

1. Provider selects block on list/calendar list view.
2. **Edit** opens same form pre-filled; `PATCH` updates row where `id` belongs to professional.
3. **Delete** confirms then hard-deletes block (MVP; no soft delete).
4. Cannot edit blocks where `status = 'on_shift'` (if ever set by system).

### Flow G: Provider without linked professional record

1. User has `provider` role but no `healthcare_professionals.user_id` match.
2. Both routes show full-page empty state with support copy; no API mutations return 200.

---

## 7. Screens or Pages

### Routes

| Route | Description | Auth |
|---|---|---|
| `/my-shifts` | Tabs: Invites, Upcoming, Past; invite detail + accept/decline | `provider` only |
| `/availability` | List of blocks + add/edit dialog | `provider` only |

### Layout

- Mobile-first bottom nav or compact header tabs: **My Shifts** | **Availability**
- Max content width `md` on desktop; cards stack full width on mobile
- Sticky footer on invite detail for **Accept** / **Decline** (primary/destructive)

### My Shifts — Invites tab

| Element | Behavior |
|---|---|
| Empty state | “No pending invites” + explanation |
| Invite card | Facility, date, time range, role badge, urgency if `staffing_requests.priority` ≠ normal |
| Badge | `AssignmentStatusEnum` mapped to labels: Invited, Accepted, etc. |

### My Shifts — Invite detail (sheet or section)

| Field | Source |
|---|---|
| Facility name | `facilities.name` |
| Address summary | `facilities.city`, `state` |
| Shift window | `shifts.start_at`, `shifts.end_at` |
| Role / specialty | `staffing_requests.role_needed`, `specialty` |
| Instructions | `staffing_requests.facility_instructions` or `notes` |
| Coordinator | User name from `assigned_coordinator_id` |
| Compliance line | “X credentials verified” (read-only count) |

### Availability page

| Element | Behavior |
|---|---|
| List grouped by week | Sort `start_at` ascending |
| Block row | Date range, status badge, notes truncated |
| FAB / primary button | Add availability |
| Empty state | “No availability scheduled” + CTA add |

---

## 8. Functional Requirements

Requirements use IDs **HPP-###** for traceability.

### 8.1 Route guards (HPP-001–HPP-003)

- **HPP-001:** Unauthenticated access to `/my-shifts` or `/availability` redirects to `/login` with `callbackUrl`.
- **HPP-002:** Non-provider roles cannot access portal routes; redirect per `getUnauthorizedRedirect`.
- **HPP-003:** Provider without linked professional sees empty state; all mutation endpoints return `403` with code `PROFESSIONAL_NOT_LINKED`.

### 8.2 My Shifts data (HPP-010–HPP-015)

- **HPP-010:** Invites query filters `shift_assignments.professional_id = resolvedProfessionalId` AND `status = 'invited'`.
- **HPP-011:** Upcoming query uses `status IN ('accepted','confirmed','checked_in')` AND `shifts.end_at >= now()`.
- **HPP-012:** Past query uses ended shifts OR terminal assignment statuses.
- **HPP-013:** Results ordered by `shifts.start_at` ascending (invites/upcoming) or descending (past).
- **HPP-014:** Join includes facility name and staffing request title; never expose other professionals’ data.
- **HPP-015:** Cross-agency leakage impossible: professional row is agency-scoped; assignments only for that professional.

### 8.3 Accept assignment (HPP-020–HPP-026)

- **HPP-020:** `acceptShiftAssignmentAction(assignmentId)` — provider only.
- **HPP-021:** Reject if assignment not owned or `status !== 'invited'` → `409` / validation error.
- **HPP-022:** Reject if parent `shifts.status = 'cancelled'`.
- **HPP-023:** Overlap check: no other assignment for same professional with overlapping shift times and status in `accepted|confirmed|checked_in`.
- **HPP-024:** On success: `status = 'accepted'`, `responded_at = now()`.
- **HPP-025:** Return updated assignment + shift summary for UI optimistic update.
- **HPP-026:** Idempotent double-accept returns success with current row if already `accepted`.

### 8.4 Decline assignment (HPP-030–HPP-034)

- **HPP-030:** `declineShiftAssignmentAction(assignmentId, declineReason?)`.
- **HPP-031:** `declineReason` enum: `unavailable`, `schedule_conflict`, `distance`, `personal`, `other`; required text min 3 chars when `other`.
- **HPP-032:** Sets `status = 'declined'`, `responded_at = now()`, `decline_reason` text.
- **HPP-033:** Cannot decline after `confirmed` or terminal statuses.
- **HPP-034:** Declined invites do not appear in Invites tab.

### 8.5 Availability blocks CRUD (HPP-040–HPP-055)

- **HPP-040:** `listAvailabilityBlocksAction()` returns blocks for resolved professional only.
- **HPP-041:** `createAvailabilityBlockAction(input)` inserts into `availability_blocks`.
- **HPP-042:** `updateAvailabilityBlockAction(id, input)` updates own block only.
- **HPP-043:** `deleteAvailabilityBlockAction(id)` deletes own block only.
- **HPP-044:** Zod schema `availabilityBlockSchema`: `startAt`, `endAt` ISO datetime; `status` ∈ `AvailabilityStatusEnum` values allowed for blocks: `available`, `unavailable` (not `on_shift`, `pending_confirmation` on create).
- **HPP-045:** `endAt` must be after `startAt` by ≥ 30 minutes.
- **HPP-046:** Block duration ≤ 14 days.
- **HPP-047:** No overlapping blocks for same professional (touching endpoints allowed: end === next start).
- **HPP-048:** `notes` max 500 characters.
- **HPP-049:** Cannot create blocks starting more than 90 days in the past (except edit existing).
- **HPP-050:** List supports optional `from` / `to` query params for date range filter (default: now − 7d to now + 60d).

### 8.6 API surface

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/provider/shifts` | List assignments by tab (`tab=invites\|upcoming\|past`) |
| `GET` | `/api/provider/shifts/[assignmentId]` | Invite/shift detail |
| `POST` | Server Action `acceptShiftAssignmentAction` | Accept invite |
| `POST` | Server Action `declineShiftAssignmentAction` | Decline invite |
| `GET` | `/api/provider/availability` | List blocks |
| `POST` | Server Action `createAvailabilityBlockAction` | Create block |
| `PATCH` | Server Action `updateAvailabilityBlockAction` | Update block |
| `DELETE` | Server Action `deleteAvailabilityBlockAction` | Delete block |

All handlers call `requireAuthContext` and assert `provider` role.

---

## 9. Data Requirements

### Tables used (no new tables)

| Table | Usage |
|---|---|
| `healthcare_professionals` | Resolve provider; optional `availability_status` update |
| `shift_assignments` | Invites, accept/decline |
| `shifts` | Timing, status |
| `staffing_requests` | Role, instructions, coordinator |
| `facilities` | Display name/location |
| `credentials` | Read-only count for accept confirmation |
| `availability_blocks` | CRUD |

### Indexes

Use existing indexes on `professional_id`, `shift_id`, `status`.

### Session claims (recommended)

Extend JWT/session for providers with `professionalId` and `agencyId` after login to avoid repeated lookups (Auth-adjacent; optional task HPP-060).

---

## 10. Authorization Rules

| Action | provider | agency roles | facility_user |
|---|---|---|---|
| View `/my-shifts` | Yes (own data) | No | No |
| Accept/decline assignment | Yes (own) | No | No |
| CRUD availability blocks | Yes (own) | No | No |
| View another professional’s assignments | No | No | No |

Server must never trust `professionalId` from client body; always derive from session.

---

## 11. UX Requirements

- Mobile-first: tap targets ≥ 44px; sticky actions on invite detail
- Status badges use shared shadcn `Badge` variants (invited = outline, accepted = default, declined = destructive muted)
- Date/time formatted in local browser timezone with explicit label “Times shown in your local timezone”
- Accept = primary button; Decline = ghost/outline
- Loading skeletons on tab switch
- Optimistic UI optional; must reconcile on server error

---

## 12. Error and Empty States

| State | Copy / behavior |
|---|---|
| No invites | “No pending shift invites” |
| No upcoming | “No upcoming shifts” |
| No past | “No completed shifts yet” |
| Not linked | “Your account isn’t linked to a professional profile. Contact your agency coordinator.” |
| Accept overlap | “This shift overlaps another confirmed assignment.” |
| Expired invite | Assignment still `invited` but shift started → show **Invite expired**; disable accept |
| Availability overlap | “This time range overlaps an existing block.” |
| Network error | Toast “Couldn’t save. Try again.” |

---

## 13. Mobile/Responsive Requirements

- **HPP-070:** Layout usable at 320px width without horizontal scroll.
- **HPP-071:** Bottom safe-area padding for iOS sticky footer.
- **HPP-072:** Tables avoided on mobile; use cards.
- **HPP-073:** Desktop ≥ 1024px: two-column optional (list + detail) on `/my-shifts`.
- **HPP-074:** Playwright smoke at viewports 375×812 and 1280×800.

---

## 14. Acceptance Criteria

- [ ] Provider login redirects to `/my-shifts`.
- [ ] Invites, Upcoming, Past tabs show correct assignment subsets per HPP-010–012.
- [ ] Accept updates `shift_assignments` to `accepted` with overlap protection.
- [ ] Decline updates to `declined` with optional reason.
- [ ] Agency users cannot access `/my-shifts` or `/availability`.
- [ ] Provider cannot access `/dashboard`.
- [ ] Availability CRUD persists to `availability_blocks` with overlap validation.
- [ ] No cross-professional data in API responses.
- [ ] Mobile-first layout passes responsive tests.
- [ ] All `HPP-*` requirements in `test.md` pass.

---

## 15. Out of Scope

- Matching & inviting professionals
- Compliance document upload
- Notifications delivery
- Shift check-in/out
- Cancellation/replacement flows
- `/rn` legacy route cleanup (may redirect to `/my-shifts` in implementation)

---

## Branch

`module/healthcare-professional-portal`
