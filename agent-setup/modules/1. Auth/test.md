# TESTS.md: Authentication & Access Management

## Module

Authentication & Access Management

## Goal

Validate that all user authentication, signup, invite, session, and role-based access flows work correctly for:

- Agency users
- Healthcare professionals
- Facility users

---

# Test Categories

## 1. Agency Owner Signup

### Test: Successful agency signup

**Steps**

1. Go to `/signup`
2. Enter valid agency details
3. Enter valid owner details
4. Select valid primary service area
5. Submit form

**Expected Result**

- User is created
- Agency is created
- `user_roles` row is created
- Role is `agency_owner`
- User is logged in
- User is redirected to `/onboarding`

---

### Test: Duplicate email prevention

**Steps**

1. Sign up with an existing email
2. Submit form

**Expected Result**

- Signup fails
- No duplicate user is created
- No agency is created
- Clear error message is shown

---

### Test: Password is hashed

**Steps**

1. Create a new agency signup
2. Inspect `users.password_hash`

**Expected Result**

- Password is not stored in plaintext
- Password hash exists
- Hash uses argon2

---

### Test: Weak password rejected

**Steps**

1. Enter password shorter than 8 characters
2. Submit form

**Expected Result**

- Signup blocked
- Validation error shown
- No database records created

---

# 2. Login

### Test: Successful login

**Steps**

1. Go to `/login`
2. Enter valid email and password
3. Submit form

**Expected Result**

- User is authenticated
- Session is created
- User is redirected to correct dashboard based on role

---

### Test: Invalid password

**Steps**

1. Enter valid email
2. Enter incorrect password
3. Submit form

**Expected Result**

- Login fails
- No session created
- Error message shown

---

### Test: Unknown email

**Steps**

1. Enter email not present in database
2. Submit form

**Expected Result**

- Login fails
- Error message shown
- No user information leaked

---

# 3. Logout

### Test: Successful logout

**Steps**

1. Log in
2. Click logout

**Expected Result**

- Session is destroyed
- User redirected to login page
- Protected pages are no longer accessible

---

# 4. Protected Routes

## Agency Routes

### Test: Unauthenticated user blocked

**Routes**

- `/dashboard`
- `/workforce`
- `/staffing-requests`
- `/facilities`
- `/compliance`
- `/settings`

**Expected Result**

- User is redirected to `/login`

---

### Test: Agency user can access agency routes

**Steps**

1. Log in as `agency_owner`
2. Visit agency routes

**Expected Result**

- Routes load successfully

---

### Test: Provider cannot access agency dashboard

**Steps**

1. Log in as `provider`
2. Visit `/dashboard`

**Expected Result**

- Access denied or redirected to provider portal

---

### Test: Facility user cannot access agency dashboard

**Steps**

1. Log in as `facility_user`
2. Visit `/dashboard`

**Expected Result**

- Access denied or redirected to facility portal

---

# 5. Role-Based Redirects

### Test: Agency owner redirect

**Login Role**

- `agency_owner`

**Expected Redirect**

- `/dashboard`

---

### Test: Staffing coordinator redirect

**Login Role**

- `staffing_coordinator`

**Expected Redirect**

- `/dashboard`

---

### Test: Provider redirect

**Login Role**

- `provider`

**Expected Redirect**

- `/my-shifts`

---

### Test: Facility user redirect

**Login Role**

- `facility_user`

**Expected Redirect**

- `/facility/dashboard`

---

# 6. Agency-Scoped Authorization

### Test: User cannot access another agency’s data

**Setup**

- Agency A
- Agency B
- User belongs to Agency A only

**Steps**

1. Log in as Agency A user
2. Try accessing Agency B resource by ID

**Expected Result**

- Access denied
- No Agency B data returned

---

### Test: Role must be scoped to agency

**Steps**

1. Create agency-scoped role without `agency_id`

**Expected Result**

- Operation rejected

---

# 7. Agency Staff Invite

### Test: Send agency staff invite

**Steps**

1. Log in as agency owner
2. Invite user with role `staffing_coordinator`

**Expected Result**

- Invite is created
- Invite token generated
- Invite is associated with agency
- Invite status is pending

---

### Test: Accept valid staff invite

**Steps**

1. Open invite link
2. Set password
3. Complete account activation

**Expected Result**

- User is created or activated
- User role is created
- Role matches invite
- User is logged in
- User redirected to `/dashboard`

---

### Test: Expired invite rejected

**Steps**

1. Open expired invite link

**Expected Result**

- Invite rejected
- Clear expired invite message shown

---

### Test: Invalid invite token rejected

**Steps**

1. Open malformed invite token

**Expected Result**

- Invite rejected
- No account created
- Error message shown

---

# 8. Healthcare Professional Invite

### Test: HP cannot self-signup

**Steps**

1. Try to create HP account without invite

**Expected Result**

- Flow unavailable or rejected
- User instructed to use agency invite

---

### Test: HP invite acceptance

**Steps**

1. Agency invites healthcare professional
2. HP opens invite link
3. HP creates password
4. HP completes activation

**Expected Result**

- User is created
- Role is `provider`
- User is linked to healthcare professional profile
- User is redirected to `/my-shifts`

---

# 9. Facility User Invite

### Test: Facility user cannot fully self-signup

**Steps**

1. Try to create facility account without invite

**Expected Result**

- Full signup unavailable or request-access only

---

### Test: Facility invite acceptance

**Steps**

1. Agency invites facility user
2. Facility user opens invite
3. User creates password

**Expected Result**

- User is created
- Role is `facility_user`
- User is linked to facility
- User is redirected to `/facility/dashboard`

---

# 10. Session Management

### Test: Session persists on refresh

**Steps**

1. Log in
2. Refresh page

**Expected Result**

- User remains logged in

---

### Test: Expired session blocks access

**Steps**

1. Expire session manually
2. Visit protected route

**Expected Result**

- User redirected to `/login`

---

# 11. Security Tests

### Test: Plaintext password never returned

**Steps**

1. Call auth-related APIs
2. Inspect response payload

**Expected Result**

- `password_hash` is never returned
- Password is never returned

---

### Test: Server-side validation required

**Steps**

1. Bypass frontend validation
2. Send invalid payload directly to API

**Expected Result**

- API rejects invalid payload

---

### Test: Invite token is single-use

**Steps**

1. Accept invite successfully
2. Try accepting same invite again

**Expected Result**

- Second attempt rejected

---

### Test: Suspended user cannot login

**Setup**

- User status = `suspended`

**Steps**

1. Attempt login

**Expected Result**

- Login rejected
- Clear account status error shown

---

# 12. Build Quality Checks

Run:

```bash
npm run lint
npm run typecheck
npm run build