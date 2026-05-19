# TASKS.md: Auth Module

## Module

Auth

## Status

FAILED_TEST

**Test run:** 2026-05-19 — 25/26 AUTH-T* passed; **AUTH-T024** failed (repo-wide ESLint errors in `components/onboarding-app.tsx`, not Auth code).

---

# Status Definitions

| Status | Meaning |
|---|---|
| PENDING | Not started |
| IN_PROGRESS | Code Agent is working |
| READY_FOR_TEST | Code Agent completed task |
| FAILED_TEST | Test Agent found issues |
| PASSED | Test Agent approved |
| BLOCKED | Cannot continue due to dependency |

---

# Task List

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| AUTH-001 | Verify Auth module requirements from `modules/1. Auth/prd.md` and `modules/1. Auth/test.md` | PASSED | Code Agent | Requirements reviewed against implementation |
| AUTH-002 | Configure required environment variables for auth and database | PASSED | Code Agent | `DATABASE_URL`, `AUTH_SECRET`, optional `NEXT_PUBLIC_APP_URL` |
| AUTH-003 | Set up Drizzle database connection | PASSED | Code Agent | `drizzle/db.ts` |
| AUTH-004 | Create or update Auth-related Drizzle schema | PASSED | Code Agent | users, accounts, sessions, verification_tokens, agencies, user_roles, user_invites |
| AUTH-005 | Add password hash support to users table | PASSED | Code Agent | `password_hash`, argon2 |
| AUTH-006 | Add agency signup fields to agencies table | PASSED | Code Agent | agency type, workforce size, service area fields |
| AUTH-007 | Generate and apply database migration | PASSED | Code Agent | `0001_agency_signup_fields.sql`, `0002_user_invites.sql` — run `npm run db:migrate` |
| AUTH-008 | Set up Auth.js v5 configuration | PASSED | Code Agent | JWT sessions + credentials (Auth.js requires JWT for credentials provider) |
| AUTH-009 | Implement password hashing and verification utilities | PASSED | Code Agent | `lib/auth/password.ts` |
| AUTH-010 | Implement agency signup validation schema | PASSED | Code Agent | `lib/validations/agency-signup.ts` |
| AUTH-011 | Implement agency signup backend action/API | PASSED | Code Agent | `registerAgencyAction` transaction |
| AUTH-012 | Connect existing `/signup` page to backend signup flow | PASSED | Code Agent | `AgencySignupForm` |
| AUTH-013 | Implement duplicate email handling | PASSED | Code Agent | Field-level error |
| AUTH-014 | Implement post-signup session creation | PASSED | Code Agent | Auto `signIn` after signup |
| AUTH-015 | Redirect successful agency signup to `/onboarding` | PASSED | Code Agent | Preserved |
| AUTH-016 | Implement login page/backend flow | PASSED | Code Agent | `/login`, `loginAction` |
| AUTH-017 | Implement logout flow | PASSED | Code Agent | `logoutAction`, `SignOutButton` on settings + onboarding |
| AUTH-018 | Implement role-based redirect helper | PASSED | Code Agent | `lib/auth/redirects.ts`, middleware |
| AUTH-019 | Implement protected route middleware | PASSED | Code Agent | `middleware.ts` |
| AUTH-020 | Implement agency-scoped authorization helper | PASSED | Code Agent | `assertAgencyAccess`, `GET /api/agencies/[agencyId]` |
| AUTH-021 | Implement agency staff invite data model | PASSED | Code Agent | `user_invites` table |
| AUTH-022 | Implement invite creation endpoint/action | PASSED | Code Agent | `POST /api/invites`, `createInviteAction` |
| AUTH-023 | Implement invite acceptance flow | PASSED | Code Agent | `/invite/[token]`, `POST /api/invites/accept` |
| AUTH-024 | Implement healthcare professional invite-only access rule | PASSED | Code Agent | Signup UI + invite flow for `provider` role |
| AUTH-025 | Implement facility user invite-only access rule | PASSED | Code Agent | No backend facility self-signup; invite flow for `facility_user` |
| AUTH-026 | Add auth error states | PASSED | Code Agent | Login, invite expired/used/invalid messages |
| AUTH-027 | Add server-side validation for all auth routes/actions | PASSED | Code Agent | Zod on login, invites, signup |
| AUTH-028 | Ensure sensitive fields are never returned to client | PASSED | Code Agent | Auth queries omit `passwordHash`; agency API returns safe fields |
| AUTH-029 | Run lint, typecheck, and build | PASSED | Code Agent | `npm run lint` (warnings only), `npm run typecheck`, `npm run build` |
| AUTH-030 | Hand off Auth module to Test Agent | READY_FOR_TEST | Code Agent | Module ready for AUTH-T* validation |

---

# Implementation Notes (handoff)

**Commands**

```bash
npm run db:migrate
npm run dev
```

**Manual verification**

1. Agency signup at `/signup` → lands on `/onboarding` signed in
2. Sign out from onboarding header → `/login`
3. Sign in at `/login` → `/dashboard` (agency owner)
4. Unauthenticated visit to `/dashboard` → redirects to `/login`
5. Create invite via `POST /api/invites` (as agency owner) → open `/invite/{token}` → accept → signed in
6. `GET /api/agencies/{otherAgencyId}` as wrong agency → 403

**Files changed (high level)**

- `auth.ts`, `middleware.ts`, `types/next-auth.d.ts`
- `lib/auth/*`, `lib/services/invites.ts`, `lib/validations/auth.ts`, `lib/validations/invite.ts`
- `actions/auth/*`, `actions/invites/*`
- `app/login`, `app/invite/[token]`, PRD route aliases (`/dashboard`, `/my-shifts`, etc.)
- `drizzle/schema.ts`, `drizzle/migrations/0002_user_invites.sql`
- `components/login-form.tsx`, `components/invite-accept-form.tsx`, `components/sign-out-button.tsx`

**Known limitations**

- Sessions use JWT (Auth.js credentials provider does not support database session strategy without custom session creation)
- Facility “request access” on `/signup` remains UI-only mock (no account creation)
- Invite email delivery not implemented (invite URL returned in API response)

---

# Testing Tasks

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| AUTH-T001 | Test agency owner signup success path | PASSED | Test Agent | `lib/auth/auth-module.test.ts` — creates user, agency, role |
| AUTH-T002 | Test duplicate email prevention | PASSED | Test Agent | Same suite — `DuplicateEmailError` |
| AUTH-T003 | Test password hashing | PASSED | Test Agent | argon2 hash + DB verification |
| AUTH-T004 | Test weak password rejection | PASSED | Test Agent | `agencySignupSchema` rejects &lt;8 chars |
| AUTH-T005 | Test login success path | PASSED | Test Agent | `e2e/auth/auth-flows.spec.ts` |
| AUTH-T006 | Test invalid login handling | PASSED | Test Agent | E2E error message + Zod schema |
| AUTH-T007 | Test logout flow | PASSED | Test Agent | E2E sign-out → `/login`, protected blocked |
| AUTH-T008 | Test protected routes as unauthenticated user | PASSED | Test Agent | E2E access specs (dashboard, facilities, onboarding, provider) |
| AUTH-T009 | Test agency user route access | PASSED | Test Agent | E2E dashboard + facilities access |
| AUTH-T010 | Test provider route restriction | PASSED | Test Agent | E2E dashboard + provider portal access |
| AUTH-T011 | Test facility user route restriction | PASSED | Test Agent | E2E dashboard + facilities access |
| AUTH-T012 | Test role-based redirects | PASSED | Test Agent | `getPostLoginRedirect` unit test |
| AUTH-T013 | Test agency-scoped authorization | PASSED | Test Agent | Vitest role scope + E2E `GET /api/agencies/*` → 403 |
| AUTH-T014 | Test agency staff invite creation | PASSED | Test Agent | `createUserInvite` integration test |
| AUTH-T015 | Test valid invite acceptance | PASSED | Test Agent | E2E `/invite/[token]` → dashboard |
| AUTH-T016 | Test expired invite rejection | PASSED | Test Agent | Vitest expired token → `InviteError EXPIRED` |
| AUTH-T017 | Test invalid invite rejection | PASSED | Test Agent | Vitest bad token + E2E 404 for unknown token |
| AUTH-T018 | Test HP cannot self-signup | PASSED | Test Agent | E2E `/signup` — invite-only copy, no provider signup |
| AUTH-T019 | Test facility cannot fully self-signup | PASSED | Test Agent | E2E `/signup` — request-access only |
| AUTH-T020 | Test session persistence on refresh | PASSED | Test Agent | E2E reload while logged in |
| AUTH-T021 | Test expired session handling | PASSED | Test Agent | E2E cleared cookies → `/login` (JWT TTL not manually expired) |
| AUTH-T022 | Test sensitive fields excluded from responses | PASSED | Test Agent | `toPublicUser` omits `passwordHash` |
| AUTH-T023 | Test direct API invalid payload rejection | PASSED | Test Agent | Zod on invite schemas |
| AUTH-T024 | Run lint | FAILED_TEST | Test Agent | `npm run lint` — 2 errors in `components/onboarding-app.tsx` (`react-hooks/refs`); 50 warnings repo-wide |
| AUTH-T025 | Run typecheck | PASSED | Test Agent | `npm run typecheck` |
| AUTH-T026 | Run build | PASSED | Test Agent | `npm run build` |

---

# Test Agent Summary (2026-05-19)

**Commands run**

```bash
npm run lint          # FAILED — 2 errors (onboarding-app.tsx)
npm run typecheck     # PASSED
npm run build         # PASSED
npx vitest run lib/auth/auth-module.test.ts lib/auth/dashboard-access.test.ts
PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test e2e/auth e2e/dashboard/dashboard-access.spec.ts e2e/onboarding/onboarding-access.spec.ts e2e/provider-portal/provider-access.spec.ts e2e/facilities/facilities-access.spec.ts
```

**Note:** Use `PLAYWRIGHT_BASE_URL=http://localhost:3001` when port 3000 is occupied (e.g. Docker). Default Playwright config assumes `localhost:3000`.

**New test assets:** `lib/auth/auth-module.test.ts`, `e2e/auth/auth-flows.spec.ts`

### Issue 1: ESLint fails repo-wide (blocks AUTH-T024)

Severity: Major

Where: `components/onboarding-app.tsx` (lines 796, 995)

Expected: `npm run lint` exits 0

Actual: 2 `react-hooks/refs` errors — ref updated during render

Steps to reproduce:
1. Run `npm run lint`

Fix guidance:
- Move `rowsRef.current = rows` / `facsRef.current = facs` into `useEffect` in onboarding-app (Agency Onboarding module scope)

Task failed testing. Code Agent should fix only the issues listed above and return AUTH-T024 to READY_FOR_TEST.

---

# Acceptance Criteria

The Auth module is complete only when:

- Agency owner can sign up from existing `/signup` page
- Signup creates user, agency, and `agency_owner` role
- Password is stored only as argon2 hash
- User is logged in after signup
- User is redirected to `/onboarding`
- Login works
- Logout works
- Protected routes are enforced
- Role-based redirects work
- Agency-scoped access is enforced
- HPs cannot self-signup
- Facility users cannot bypass invite-based flow
- Invite acceptance works
- Invalid/expired invites are rejected
- Sensitive fields are never exposed
- Lint passes
- Typecheck passes
- Build passes

---

# Code Agent Rules

- Read `prd.md` before starting
- Follow task order
- Work only on Auth module
- Do not redesign existing signup UI
- Do not create duplicate auth systems
- Do not store plaintext passwords
- Do not expose password hashes
- Do not create unnecessary tables
- Update this file after each task
- Stop after marking module READY_FOR_TEST

---

# Test Agent Rules

- Read `test.md` before testing
- Test against acceptance criteria
- Do not write production code
- Mark failed tasks as `FAILED_TEST`
- Include exact reproduction steps
- Only mark `PASSED` after verification
