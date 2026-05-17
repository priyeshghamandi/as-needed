# Settings — Test Plan

## Module

Settings (`modules/14. Settings`)

## 1. Test Strategy

### Objectives

Validate `/settings` tabbed UI, owner/admin write access vs read-only agency roles, profile/service area/preferences persistence, Auth team invite reuse, activity logging, and route protection.

### Test layers

| Layer | Tool | Scope |
|---|---|---|
| E2E | Playwright | Settings flows, RBAC, tabs, invites |
| Unit / Integration | Vitest | Zod schemas, auth helpers, preferences merge, API |
| Build | npm scripts | lint, typecheck, build, test |

### Test data setup

- Agency A: owner, admin, coordinator, recruiter
- Agency B: separate owner (cross-agency tests)
- Pending `user_invites` seeds for revoke tests
- Onboarding columns + `agency_preferences` migrated in test DB

### File layout (required)

```
e2e/
  settings/
    settings-access.spec.ts
    settings-profile.spec.ts
    settings-service-area.spec.ts
    settings-team.spec.ts
    settings-preferences.spec.ts
    settings-rbac.spec.ts
    settings-responsive.spec.ts
lib/
  validations/
    agency-profile-settings.test.ts
    agency-service-area-settings.test.ts
    agency-preferences.test.ts
  settings/
    assert-can-manage-settings.test.ts
app/
  api/
    settings/
      route.test.ts
```

---

## 2. Required Playwright E2E Tests

### 2.1 `e2e/settings/settings-access.spec.ts`

#### SET-E2E-001: Unauthenticated redirect

**Steps**

1. Visit `/settings` without session

**Expected**

- Redirect `/login` with `callbackUrl=/settings`

---

#### SET-E2E-002: Provider blocked

**Steps**

1. Log in as `provider`
2. Visit `/settings`

**Expected**

- Redirect to provider portal route (per Auth)

---

#### SET-E2E-003: Owner can access

**Steps**

1. Log in as `agency_owner`
2. Visit `/settings`

**Expected**

- **Settings** heading; Profile tab active

---

### 2.2 `e2e/settings/settings-profile.spec.ts`

#### SET-E2E-010: Owner saves profile

**Steps**

1. Log in as owner
2. Change `phone` to valid new value
3. Click **Save changes**

**Expected**

- Toast success
- Reload shows new phone

---

#### SET-E2E-011: Profile validation

**Steps**

1. Clear required operational contact email
2. Save

**Expected**

- Inline error; no save

---

### 2.3 `e2e/settings/settings-service-area.spec.ts`

#### SET-E2E-020: Admin updates radius

**Steps**

1. Log in as `agency_admin`
2. Open **Service area** tab
3. Set radius to 25; save with valid place

**Expected**

- `service_area_radius_miles` updated (API/DB assert)

---

#### SET-E2E-021: Location without placeId blocked

**Steps**

1. Attempt save with manual text only (stub autocomplete off)

**Expected**

- Error **Select a location from the suggestions**

---

### 2.4 `e2e/settings/settings-team.spec.ts`

#### SET-E2E-030: Owner sends team invite

**Steps**

1. Team tab; add email + role row
2. Submit

**Expected**

- Row appears in pending invites OR inline sent status
- `user_invites` row created (API fixture)

---

#### SET-E2E-031: Owner revokes pending invite

**Steps**

1. Seed pending invite
2. Click **Revoke**

**Expected**

- Status `revoked`; removed from pending table

---

### 2.5 `e2e/settings/settings-preferences.spec.ts`

#### SET-E2E-040: Owner saves timezone preference

**Steps**

1. Preferences tab; select `America/Chicago`
2. Save

**Expected**

- `agency_preferences.timezone` persisted

---

### 2.6 `e2e/settings/settings-rbac.spec.ts`

#### SET-E2E-050: Coordinator read-only profile

**Steps**

1. Log in as `staffing_coordinator`
2. Visit `/settings` profile tab

**Expected**

- **View only** banner
- Save button absent or disabled
- Inputs disabled

---

#### SET-E2E-051: Coordinator cannot revoke invite

**Steps**

1. Coordinator on team tab
2. Attempt revoke via API if button hidden

**Expected**

- `403` on revoke action

---

#### SET-E2E-052: Admin can edit preferences

**Steps**

1. Log in as `agency_admin`
2. Toggle `showCriticalBannerOnDashboard`
3. Save

**Expected**

- Success toast; value persisted

---

### 2.7 `e2e/settings/settings-responsive.spec.ts`

#### SET-E2E-060: Mobile tabs scroll

**Steps**

1. Viewport 375px
2. Visit `/settings`; switch tabs

**Expected**

- No page horizontal overflow
- Tabs reachable

---

## 3. Required Unit/Integration Tests

### 3.1 `lib/validations/agency-profile-settings.test.ts`

| ID | Case | Expected |
|---|---|---|
| SET-UT-001 | Valid profile payload | Pass |
| SET-UT-002 | Name too short | Fail |
| SET-UT-003 | Invalid website URL | Fail |
| SET-UT-004 | Empty specialties array | Fail |

---

### 3.2 `lib/validations/agency-service-area-settings.test.ts`

| ID | Case | Expected |
|---|---|---|
| SET-UT-010 | Radius 9 | Fail |
| SET-UT-011 | Radius 76 | Fail |
| SET-UT-012 | Missing placeId | Fail |

---

### 3.3 `lib/validations/agency-preferences.test.ts`

| ID | Case | Expected |
|---|---|---|
| SET-UT-020 | Valid preferences | Pass |
| SET-UT-021 | Invalid timezone | Fail |
| SET-UT-022 | Invalid weekStartsOn | Fail |

---

### 3.4 `lib/settings/assert-can-manage-settings.test.ts`

| ID | Case | Expected |
|---|---|---|
| SET-UT-030 | agency_owner | Allowed |
| SET-UT-031 | staffing_coordinator | Forbidden |
| SET-UT-032 | Missing agencyId | Forbidden |

---

### 3.5 `app/api/settings/route.test.ts`

| ID | Case | Expected |
|---|---|---|
| SET-UT-040 | GET returns agency DTO scoped | 200 own agency only |
| SET-UT-041 | PATCH profile as coordinator | 403 |

---

## 4. Required Authorization Tests

| ID | Scenario | Expected |
|---|---|---|
| SET-AUTH-01 | Coordinator `updateAgencyProfileAction` | Forbidden |
| SET-AUTH-02 | Owner updates agency B via tampered agencyId | 403 |
| SET-AUTH-03 | `sendTeamInvitesAction` as recruiter from settings | Forbidden per Auth |

---

## 5. Required Validation Tests

Covered by SET-UT-001–022.

---

## 6. Required Error/Edge Case Tests

| ID | Scenario | Expected |
|---|---|---|
| SET-EDGE-01 | Save failure network | Error toast; dirty state kept |
| SET-EDGE-02 | Invalid tab query | Redirect to profile |
| SET-EDGE-03 | Duplicate pending invite | Skipped row from Auth |
| SET-EDGE-04 | Activity log written on profile save | `settings.updated` row |

---

## 7. Responsive Tests

SET-E2E-060; viewports 375, 768, 1280.

| ID | Check |
|---|---|
| SET-RESP-01 | Save button full width on mobile |

---

## 8. Accessibility Tests

| ID | Requirement | Tool |
|---|---|---|
| SET-A11Y-01 | Tabs have `role=tablist` and selected state | Playwright |
| SET-A11Y-02 | Disabled read-only fields not focus-trapped incorrectly | axe |
| SET-A11Y-03 | Forms labeled | getByLabel |
| SET-A11Y-04 | View only banner announced | `role=status` or alert |

axe on `/settings` profile tab: zero critical violations.

---

## 9. Build Health Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Fallback:

```bash
npx vitest run lib/validations/agency-preferences.test.ts lib/settings
npx playwright test e2e/settings
```

---

## 10. Pass Criteria

- All SET-E2E tests pass
- All SET-UT tests pass
- SET-AUTH-01–03 pass
- No cross-agency write leakage
- lint, typecheck, build pass
- PRD §14 acceptance criteria met

---

## Test Agent Handoff Checklist

- [ ] Migrate `agency_preferences` in test DB
- [ ] Seed pending invites for revoke tests
- [ ] Confirm Auth actions callable from settings tests
- [ ] File FAILED_TEST on tasks.md when needed
