# Settings PRD

## 1. Module Overview

The Settings module is the agency configuration hub at `/settings` for profile, service area, team management, and operational preferences.

This module is responsible for:

- tabbed settings UI at `/settings` with query sync (`?tab=profile|service-area|team|preferences`)
- editing agency profile fields on `agencies`
- confirming/updating primary service area and staffing radius (same rules as onboarding)
- team invites and pending invite management (reuses Auth `sendTeamInvitesAction`, revoke patterns)
- agency preferences stored on `agencies` (timezone, notification defaults, operational toggles)
- role-based write access: **agency_owner** and **agency_admin** for sensitive settings; read-only or limited views for other agency roles
- `logActivity` on successful saves (`settings.updated`)

This module does **not** duplicate Auth login/password flows, billing, or platform-wide admin configuration.

---

## 2. Goals

### Primary Goals

- Centralize post-onboarding agency configuration in one route
- Allow owners/admins to update agency profile and service area with validation
- Reuse Auth invite system for team growth and role assignment
- Persist operational preferences affecting dashboard and notifications behavior
- Enforce authorization so coordinators cannot change billing-sensitive agency identity fields
- Log settings changes to Activity Logs

### Secondary Goals

- Show read-only summary to non-admin agency roles (optional limited tab)
- Display pending team invites with resend/revoke (owner/admin)
- Pre-fill all fields from current agency record
- Align service area UX with onboarding (`LocationAutocomplete`, radius)

---

## 3. Non-Goals (MVP)

- Per-user profile settings (name/password) — use Auth account pages if they exist
- Billing, subscription, payment methods
- Custom RBAC permission matrix editor
- Multi-service-area management
- Logo file upload to object storage (URL field only, same as onboarding)
- SSO / security policies
- Agency deletion or ownership transfer
- Facility or provider settings (portal modules)
- Email delivery for invites beyond Auth MVP behavior

---

## 4. Primary Users

| User | Role(s) | Settings access |
|---|---|---|
| Agency Owner | `agency_owner` | Full read/write all tabs |
| Agency Admin | `agency_admin` | Full read/write all tabs |
| Staffing Coordinator | `staffing_coordinator` | Read-only view of Profile + Service Area; no Team write; Preferences read-only |
| Recruiter | `recruiter` | Read-only Profile; no Team/Service Area write |
| Compliance Manager | `compliance_manager` | Read-only Profile; Preferences read-only |
| Healthcare Professional | `provider` | Blocked from `/settings` (redirect to provider portal) |
| Facility User | `facility_user` | Blocked (redirect to facility portal) |
| Unauthenticated | — | `/login?callbackUrl=/settings` |

**Sensitive settings** (owner/admin write only): agency name, service area fields, `service_area_radius_miles`, team invites/revoke, all preference toggles.

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Settings** | Agency role | `/settings` default tab `profile` |
| Direct `/settings?tab=team` | Owner/admin | Team tab |
| Invite email CTA | Auth flow | May land on accept invite, not settings |
| Onboarding completion links | Optional | **Manage team** → `/settings?tab=team` |
| Activity log link | `user_invite` entity | `/settings?tab=team` |

Post-login: coordinators visiting `/settings` see read-only banners on restricted tabs.

---

## 6. User Flows

### Flow A: Owner updates agency profile

1. Owner opens `/settings` → **Profile** tab.
2. Form pre-fills from `agencies` + owner contact fields.
3. User edits phone, website, operational contact, specialties.
4. **Save changes** → `updateAgencyProfileAction`.
5. Success toast; `logActivity({ action: 'settings.updated', entityType: 'agency', metadata: { section: 'profile' } })`.

### Flow B: Admin updates service area

1. Admin opens **Service area** tab.
2. Map/autocomplete shows current center; radius slider/input.
3. User selects new place; server validates `placeId` required.
4. Save updates `primary_service_area_*` + `service_area_radius_miles`.
5. Warning toast if existing workforce/facilities exist: **Location changes affect future validation only** (no bulk revalidation MVP).

### Flow C: Owner invites team member

1. Owner opens **Team** tab.
2. Adds rows email + display role (same mapping as onboarding).
3. Submit → `sendTeamInvitesAction` (Auth).
4. Pending invites table refreshes; duplicate pending skipped per Auth rules.
5. `logActivity` `user_invite.sent` per successful invite (Auth action or wrapper).

### Flow D: Owner revokes pending invite

1. On **Team** tab pending table, click **Revoke**.
2. `revokeTeamInviteAction` sets invite `status=revoked`.
3. Row removed or marked revoked.

### Flow E: Coordinator views settings (read-only)

1. Coordinator opens `/settings`.
2. Profile and Service area show **View only** banner; fields disabled.
3. Team tab shows member list (read-only) without invite form.
4. Preferences tab read-only.

### Flow F: Owner updates preferences

1. Owner opens **Preferences** tab.
2. Sets timezone, default notification minimum priority, week start, etc.
3. Save → `updateAgencyPreferencesAction` updates `agencies` JSON column or scalar fields.

---

## 7. Screens and Routes

### Pages

| Route | Description | Auth |
|---|---|---|
| `/settings` | Tabbed settings (client tabs + server data) | Agency roles listed above |

### Tabs (`tab` query param)

| `tab` | Label | Write (owner/admin) |
|---|---|---|
| `profile` (default) | Profile | Yes |
| `service-area` | Service area | Yes |
| `team` | Team | Yes (invites/revoke) |
| `preferences` | Preferences | Yes |

Invalid `tab` → redirect to `profile`.

### Server Actions / API

| Action | Purpose |
|---|---|
| `updateAgencyProfileAction` | Profile tab save |
| `updateAgencyServiceAreaAction` | Service area tab save |
| `sendTeamInvitesAction` | Auth — team invites |
| `revokeTeamInviteAction` | Auth or Settings wrapper |
| `updateAgencyPreferencesAction` | Preferences tab save |
| `GET /api/settings` | Load aggregated settings DTO (optional) |

All mutations call `assertCanManageAgencySettings` (owner/admin) except read endpoints.

---

## 8. Functional Requirements

### 8.1 Profile tab (`profile`)

Persist on `agencies`:

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required; 2–255 chars; **sensitive** |
| `phone` | string | Required; 7–50 |
| `website` | string optional | Valid URL if set |
| `agencyType` | string optional | Same options as signup |
| `workforceSize` | string optional | Same options as signup |
| `operationalContactName` | string | Required; 2–120 (column from onboarding migration) |
| `operationalContactEmail` | string | Required; valid email |
| `description` | text optional | Max 2000 |
| `staffingSpecialties` | string[] | Min 1; max 8; allowed list same as onboarding |
| `logoUrl` | string optional | Valid URL max 2048 |

Non-admin: all inputs `disabled`; hide **Save**.

### 8.2 Service area tab (`service-area`)

| Field | Type | Rules |
|---|---|---|
| `primaryServiceArea` | `GeographicLocation` | Required; Places autocomplete; `placeId` required |
| `serviceAreaRadiusMiles` | integer | 10–75; **sensitive** |

Updates columns:

- `primary_service_area_name`, `primary_service_area_place_id`, city, state, country, lat, lng
- `service_area_radius_miles`

Reuse `isWithinServiceArea` only for preview messaging, not re-validate existing records on save.

**Sensitive:** coordinators read-only.

### 8.3 Team tab (`team`)

**Invite form (owner/admin only):**

- Same as onboarding team step: max 5 rows per submit; display roles mapped via `teamDisplayRoleToAppRole`
- Calls `sendTeamInvitesAction`

**Active members table:**

| Column | Source |
|---|---|
| Name | `users.name` |
| Email | `users.email` |
| Role | `user_roles.role` badge |
| Joined | `user_roles.created_at` |

**Pending invites table:**

| Column | Source |
|---|---|
| Email | `user_invites.email` |
| Role | `user_invites.role` |
| Sent | `created_at` |
| Expires | `expires_at` |
| Actions | **Revoke** (owner/admin) |

Do not allow self-revoke of `agency_owner` via UI.

**Read-only roles:** see tables without invite form or revoke buttons.

### 8.4 Preferences tab (`preferences`)

Store on `agencies` — add column if not present:

```sql
agency_preferences jsonb not null default '{}'
```

| Key | Type | Default | Rules |
|---|---|---|---|
| `timezone` | string | `America/New_York` | IANA timezone string |
| `weekStartsOn` | `0` \| `1` | `0` | 0=Sunday, 1=Monday |
| `defaultNotificationPriorityFloor` | enum | `important` | Minimum priority for inbox highlight; one of `info`,`important`,`urgent` |
| `showCriticalBannerOnDashboard` | boolean | `true` | Ties to Notifications module banner |
| `dateFormat` | `mdy` \| `dmy` | `mdy` | Display only MVP |

**Save:** merge into existing JSON; validate with Zod.

**Sensitive:** owner/admin write only.

### 8.5 Layout and navigation

- Page title: **Settings**
- Subtitle: agency name
- Vertical tabs on `lg+`; horizontal scroll tabs on mobile
- Unsaved changes guard: browser `beforeunload` when dirty (client)
- Sticky **Save changes** per tab (owner/admin)

### 8.6 Authorization helpers

`assertCanManageAgencySettings(session)`:

- Throws / returns forbidden unless role is `agency_owner` or `agency_admin`
- Verifies `session.agencyId` present

`assertCanViewAgencySettings(session)`:

- Any agency role with `agencyId`

### 8.7 Activity logging

On successful save per tab:

```ts
logActivity({
  agencyId,
  actorUserId: session.user.id,
  action: 'settings.updated',
  entityType: 'agency',
  entityId: agencyId,
  metadata: { section: 'profile' | 'service-area' | 'preferences' },
});
```

Team invites: log `user_invite.sent` from Auth wrapper or Settings after success.

### 8.8 Middleware

- Unauthenticated → login with callback
- `provider` / `facility_user` → `getUnauthorizedRedirect`
- Valid agency role → allow GET `/settings`

---

## 9. Data Requirements

### 9.1 Schema changes (this module)

If not already added by onboarding:

```sql
-- onboarding may have added these; Settings reads/writes same columns
operational_contact_name varchar(120)
operational_contact_email varchar(255)
description text
logo_url text
staffing_specialties jsonb not null default '[]'
service_area_radius_miles integer not null default 75

-- Settings-specific
agency_preferences jsonb not null default '{}'
```

No new tables. Team data from `users`, `user_roles`, `user_invites`.

### 9.2 Reads

Single query or `GET /api/settings` returning:

- Agency profile fields
- Service area fields + radius
- Members + pending invites (agency scoped)
- `agency_preferences` parsed

### 9.3 Writes

- All updates `WHERE id = session.agencyId`
- Transaction when updating related fields
- Never update another agency

### 9.4 Auth dependency

Must reuse:

- `sendTeamInvitesAction`
- `assertCanCreateInvite` (Auth)
- `teamDisplayRoleToAppRole`
- Invite token generation unchanged

Do not fork invite logic.

---

## 10. Authorization Rules

| Action | agency_owner | agency_admin | staffing_coordinator | recruiter | compliance_manager |
|---|---|---|---|---|---|
| View `/settings` | Yes | Yes | Yes (limited) | Yes (limited) | Yes (limited) |
| Edit profile | Yes | Yes | No | No | No |
| Edit service area | Yes | Yes | No | No | No |
| Send/revoke invites | Yes | Yes | No | No | No |
| Edit preferences | Yes | Yes | No | No | No |
| View team lists | Yes | Yes | Yes | Yes | Yes |

**Cross-agency:** all API/actions return 403 if `agencyId` mismatch.

---

## 11. UX Requirements

- Match premium B2B healthcare operations UI (onboarding/settings patterns)
- Read-only tabs: amber **View only** callout at top
- shadcn Tabs, Form, Input, `LocationAutocomplete`
- Success toast: **Settings saved**
- Error toast: **Unable to save settings. Try again.**
- Team invite inline results table (sent/skipped/error) from Auth action
- Clear separation between active members and pending invites

---

## 12. Error and Empty States

| Scenario | Behavior |
|---|---|
| Validation error | Inline field errors; no partial save |
| Unauthorized save attempt | Toast **You don't have permission to change this setting** |
| Location without placeId | **Select a location from the suggestions** |
| Duplicate pending invite | Auth skipped status per row |
| No pending invites | **No pending invites** empty row |
| Only owner in agency | Team table shows single row |
| API load failure | Error card + Retry |
| Revoke already accepted invite | Button hidden |

---

## 13. Mobile and Responsive Requirements

| Breakpoint | Behavior |
|---|---|
| `< md` | Tabs horizontal scroll; stacked forms |
| `lg+` | Sidebar tabs left, content right |
| 320px | No overflow; full-width save button |

Touch targets ≥ 44px on tabs and primary save.

---

## 14. Acceptance Criteria

- [ ] `/settings` loads for agency roles with correct tab routing
- [ ] Owner/admin can save profile, service area, preferences
- [ ] Coordinators/recruiters/compliance see read-only on sensitive tabs
- [ ] Team tab uses Auth `sendTeamInvitesAction`; pending invites visible
- [ ] Revoke pending invite works for owner/admin
- [ ] Service area enforces placeId and radius 10–75
- [ ] `agency_preferences` persists and reloads
- [ ] `settings.updated` activity logged on saves
- [ ] Provider/facility users cannot access `/settings`
- [ ] No cross-agency updates
- [ ] Lint, typecheck, build, tests pass per `test.md`

---

## 15. Out of Scope

- User personal account/password settings
- Billing and subscription
- Custom roles/permissions editor
- Bulk team CSV import
- Agency suspend/delete
- Logo upload pipeline
- Provider/facility settings pages
