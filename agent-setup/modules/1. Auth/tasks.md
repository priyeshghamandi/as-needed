# TASKS.md: Auth Module

## Module

Auth

## Status

READY_FOR_TEST

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
| AUTH-T001 | Test agency owner signup success path | PENDING | Test Agent | |
| AUTH-T002 | Test duplicate email prevention | PENDING | Test Agent | |
| AUTH-T003 | Test password hashing | PENDING | Test Agent | |
| AUTH-T004 | Test weak password rejection | PENDING | Test Agent | |
| AUTH-T005 | Test login success path | PENDING | Test Agent | |
| AUTH-T006 | Test invalid login handling | PENDING | Test Agent | |
| AUTH-T007 | Test logout flow | PENDING | Test Agent | |
| AUTH-T008 | Test protected routes as unauthenticated user | PENDING | Test Agent | |
| AUTH-T009 | Test agency user route access | PENDING | Test Agent | |
| AUTH-T010 | Test provider route restriction | PENDING | Test Agent | |
| AUTH-T011 | Test facility user route restriction | PENDING | Test Agent | |
| AUTH-T012 | Test role-based redirects | PENDING | Test Agent | |
| AUTH-T013 | Test agency-scoped authorization | PENDING | Test Agent | |
| AUTH-T014 | Test agency staff invite creation | PENDING | Test Agent | |
| AUTH-T015 | Test valid invite acceptance | PENDING | Test Agent | |
| AUTH-T016 | Test expired invite rejection | PENDING | Test Agent | |
| AUTH-T017 | Test invalid invite rejection | PENDING | Test Agent | |
| AUTH-T018 | Test HP cannot self-signup | PENDING | Test Agent | |
| AUTH-T019 | Test facility cannot fully self-signup | PENDING | Test Agent | |
| AUTH-T020 | Test session persistence on refresh | PENDING | Test Agent | |
| AUTH-T021 | Test expired session handling | PENDING | Test Agent | |
| AUTH-T022 | Test sensitive fields excluded from responses | PENDING | Test Agent | |
| AUTH-T023 | Test direct API invalid payload rejection | PENDING | Test Agent | |
| AUTH-T024 | Run lint | PENDING | Test Agent | `npm run lint` |
| AUTH-T025 | Run typecheck | PENDING | Test Agent | `npm run typecheck` |
| AUTH-T026 | Run build | PENDING | Test Agent | `npm run build` |

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
