# Pending Functionality

Audit date: 2026-05-19  
Scope: **Product functionality only** (not test sign-off, axe, lint, or docs drift).  
Source: `agent-setup/modules/*/prd.md`, `tasks.md`, `pending.md`, and codebase verification.

---

## MVP readiness summary

| Area | Status |
|------|--------|
| Auth, agency signup/login, invites (token flow) | Mostly complete |
| Agency onboarding wizard | Complete except **resume hydration** for professionals/facilities lists |
| Ops dashboard, workforce, facilities, staffing requests, shifts, matching | Core flows implemented; **dashboard navigation polish** incomplete |
| Healthcare professional portal | Complete (optional JWT `professionalId` deferred) |
| **Facility portal** | **Implemented** (READY_FOR_TEST); E2E seed + FPORT-T* pending |
| Compliance, settings, notifications (in-app) | Implemented |
| Marketplace eligibility, category directory, public profiles, search, public marketplace | Implemented (docs on modules 17–18 are stale) |
| Customer requests, routing, fulfillment, alternatives, consumer home care | Implemented |
| Invite **email** delivery | **Not implemented** (manual copy-link only) |
| Notification **caller integrations** (shifts, compliance, etc.) | **Partial** |
| Activity log **caller integrations** | **Partial** |

**Conclusion:** Not MVP-ready until Facility Portal is built and cross-cutting invite/notification/activity integrations are closed (or explicitly descoped in PRDs).

---

## Critical (blocks MVP)

### 1. ~~Facility Portal (Module 10)~~ — implemented 2026-05-19

Real `/facility/*` routes for invited `facility_user` only (not B2C consumers). See module 10 `tasks.md` (READY_FOR_TEST). Remaining: FPORT-T* test sign-off, optional notification integrations for facility-facing updates.

**B2C note:** Consumers use `/customer/*` (Module 20 + 24), not `/facility/*`.

---

### 2. Invite email delivery (Auth + Workforce + Facilities + Settings + Onboarding)

**Expected (Auth PRD flows):** “Invite email sent” / “Invite sent via email/SMS” after team, provider, and facility invites.

**Actual:** Invites are persisted and URLs returned in API/actions; UI shows **“copy the link”** (`sendTeamInvitesAction`, workforce/facility invite actions). No transactional invite emails.

**Impact:** Admins must manually share links; PRD acceptance flows are not met.

---

## High (MVP quality / PRD integration contracts)

### 3. Notifications — missing module integrations (Module 12 callers)

**Implemented:** In-app inbox, bell, toasts, banner; callers for **request routing**, **agency fulfillment** (confirm/decline), **alternative suggestions**. Optional email dispatch for urgent/critical when SendGrid is configured (beyond Notifications PRD non-goals).

**Missing per Notifications PRD §8.8** (no `createNotification` from these domains):

- Shift invite sent / shift declined / shift confirmed
- Staffing request at risk
- Credential expiring / expired
- Assignment no-show
- Facility-facing “request updated” (for facility users)

**Impact:** Coordinators/providers/facility users miss operational alerts for core staffing workflows.

---

### 4. Activity logs — missing module integrations (Module 13 callers)

**Implemented:** `logActivity` utility, dashboard feed, entity panels; call sites in **settings saves**, **workforce create**, **marketplace visibility** changes.

**Missing per Activity Logs PRD §8.9:**

| Module | Expected events |
|--------|-----------------|
| Agency Onboarding | `agency.onboarding.completed` |
| Facilities | `facility.created`, `facility.updated` |
| Staffing Requests | `staffing_request.created`, `staffing_request.status_changed` |
| Shifts | `shift.created`, `shift.status_changed` |
| Matching & Assignments | `shift_assignment.invited`, `.accepted`, `.declined` |
| Compliance | `credential.verified`, `credential.expired` |
| Auth | `user_invite.sent` |

**Impact:** Dashboard and entity activity panels are sparse/misleading for most operational actions.

---

### 5. Agency Onboarding — resume does not hydrate saved lists

**Expected:** User can save professionals/facilities during onboarding, leave, and resume with prior entries visible.

**Actual:** Rows are saved to DB via server actions, but wizard state (`profData` / `facData`) is **client-only**; `GET /api/onboarding` returns counts only, not rows. On refresh/resume, lists appear empty (data exists in DB).

**Reference:** ONBOARD-T020 — “Welcome resume + list hydration gaps”.

---

## Medium (UX / navigation; core data works elsewhere)

### 6. Operations Dashboard — navigation and banner gaps

| Gap | Description |
|-----|-------------|
| OPS-016 | KPI cards not linked to filtered destination routes |
| OPS-019 | Active request table rows not linked to request detail |
| OPS-025 | Sidebar uses client view state instead of Next.js `Link` routes |
| OPS-015 | Onboarding banner missing progress % / PRD copy alignment |
| OPS-024 | No per-section partial failure UI when dashboard sections fail |

Core KPIs and tables load; gaps are wayfinding and resilience.

---

### 7. Facility “Request access” on `/signup` — non-functional intake

**Actual:** `components/signup-app.tsx` facility form uses `setTimeout` → success with **no API persistence** (Auth tasks: “UI-only mock”).

**PRD note:** Facility self-signup without invite is a non-goal; this is not the invite flow. Still a **product gap** if “Request access” is marketed as real intake.

---

## Low / optional (documented deferrals)

| Item | Notes |
|------|--------|
| HPP-025 | Optional JWT `professionalId` on session — convenience, not blocking |
| CHC-007 | `PATCH` for consumer care site — deferred as optional MVP |
| Consumer care site edit | Only GET implemented; acceptable if descoped |

---

## Not missing (docs out of date — do not rebuild)

- **Compliance (11):** `app/compliance`, `lib/compliance/*`, APIs exist; `tasks.md` still says PENDING.
- **Professional Public Profiles (17):** `app/marketplace/professionals/[publicSlug]`, `lib/marketplace/public-profile.ts`.
- **Marketplace Search (18):** `app/marketplace/search`, search API and cart.
- **Public Marketplace + request pipeline (19–23):** marked COMPLETE; code paths present.

---

## Explicitly out of scope (post-MVP per `list.md`)

Payroll, billing, direct customer↔professional messaging, consumer payments, credential verification integrations, native apps, analytics suite, calendar sync, multi-agency float pools, etc.

---

## Suggested implementation order

1. **Facility Portal** (unblocks MVP facility_user journey alongside `/customer/*`).
2. **Invite email delivery** (unblocks real onboarding/invite ops).
3. **Notification + activity integrations** for shifts, requests, assignments, compliance, facilities, invites.
4. **Onboarding list hydration** on resume.
5. **Dashboard navigation** (KPI links, request row links, sidebar routes).