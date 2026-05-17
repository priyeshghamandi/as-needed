# TASKS: Healthcare Staffing Operations SaaS

## Status Values

- PENDING
- IN_PROGRESS
- READY_FOR_TEST
- FAILED_TEST
- PASSED

## Agent Rules

- Code Agent works only on the first `PENDING` or `FAILED_TEST` task.
- Code Agent updates task status to `IN_PROGRESS` when starting.
- Code Agent updates task status to `READY_FOR_TEST` when done.
- Test Agent tests only `READY_FOR_TEST` tasks.
- Test Agent updates status to `PASSED` or `FAILED_TEST`.
- No agent may skip tasks unless the user explicitly says so.

---

## Phase 0: Project Foundation

### T001 - Initialize Next.js Project Foundation
Status: PENDING
Owner: Code Agent

Goal:
Create or verify the project foundation for a Next.js App Router app using TypeScript, TailwindCSS, shadcn/ui, and lucide-react.

Acceptance Criteria:
- Next.js App Router structure exists
- TypeScript is enabled
- TailwindCSS is configured
- shadcn/ui is initialized or compatible components are available
- lucide-react is available
- app builds successfully
- base global styles are clean and modern

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T002 - Create Design Tokens And Status Constants
Status: PENDING
Owner: Code Agent

Goal:
Create shared constants and helper utilities for product statuses, badges, priorities, roles, and mock domain labels.

Acceptance Criteria:
- Central constants exist for staffing request statuses
- Central constants exist for availability statuses
- Central constants exist for compliance statuses
- Central constants exist for assignment statuses
- Central constants exist for notification priorities
- Badge style helper exists or status badge component exists
- No scattered hardcoded status styling in initial shared components

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T003 - Create Mock Data Layer
Status: PENDING
Owner: Code Agent

Goal:
Create reusable mock data for agencies, users, facilities, healthcare professionals, staffing requests, shifts, credentials, notifications, and activity events.

Acceptance Criteria:
- Mock data is organized in a dedicated folder
- Data follows PRD entity definitions
- Mock data includes realistic healthcare staffing examples
- Data can support dashboard, staffing requests, workforce, facility portal, RN shift flow, and notifications
- Types are defined and exported

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T004 - Create App Shell Layout
Status: PENDING
Owner: Code Agent

Goal:
Create authenticated agency app layout with sidebar, top navbar, search, notifications icon, quick action, and responsive behavior.

Acceptance Criteria:
- Sidebar includes Dashboard, Staffing Requests, Workforce, Facilities, Shifts, Compliance, Messages, Reports, Settings
- Top navbar includes search, notifications, agency selector, user profile, and Create Staffing Request button
- Mobile layout works with collapsible navigation
- Uses shadcn/ui and lucide-react
- Layout is reusable across agency pages

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 1: Public And Signup Flows

### T005 - Build Public Homepage
Status: PENDING
Owner: Code Agent

Goal:
Build the public SaaS homepage that positions the product as an operational control center for healthcare staffing agencies.

Acceptance Criteria:
- Hero section explains real-time staffing operations
- CTA buttons exist: Request a Demo, See Platform Overview
- Problem section highlights staffing chaos
- Platform overview shows Agencies, Healthcare Professionals, and Facilities coordination
- Multi-user experience cards exist
- Feature grid exists
- Workflow section exists
- Metrics/outcomes section exists
- Final CTA exists
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T006 - Build Signup Page
Status: READY_FOR_TEST
Owner: Code Agent

Goal:
Build public signup/onboarding entry page with agency-first logic.

Acceptance Criteria:
- Signup page has Staffing Agency path as primary
- Facility/Customer path exists as secondary
- Healthcare professionals do not have public self-signup
- Note explains professionals join via agency invitation
- Agency workspace creation form exists
- Facility request access form exists
- Invite code form exists for facility portal access
- Mock form submission works visually
- Responsive design works

Implementation Notes:
- Existing `/signup` UI preserved; agency form wired to backend via React Hook Form + Zod.
- Server action `registerAgencyAction` runs a Drizzle transaction: user (argon2 hash) → agency → `user_roles` (`agency_owner`).
- Auth.js v5 credentials provider signs in with JWT session and redirects to `/onboarding`.
- Google Places autocomplete on primary service area with mock fallback when `GOOGLE_PLACES_API_KEY` is unset.
- Schema: `agencies.agency_type`, `agencies.workforce_size` (+ migration `drizzle/migrations/0001_agency_signup_fields.sql`).
- Requires `.env`: `DATABASE_URL`, `AUTH_SECRET` (32+ chars). Optional: `GOOGLE_PLACES_API_KEY`.

Test Notes:
- [ ] Run migration against Postgres before signup test
- [ ] `npm run build` and `npm run lint`
- [ ] Agency signup at `/signup` → creates records → redirects to `/onboarding`
- [ ] Duplicate email shows field error
- [ ] Service area requires selection from autocomplete (not free text)
- [ ] Password strength bars + show/hide toggle
- [ ] Places mock suggestions when API key missing

Files Changed:
- `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`
- `actions/signup/register-agency.ts`
- `lib/auth/password.ts`, `lib/services/agency-signup.ts`, `lib/validations/agency-signup.ts`
- `components/agency-signup-form.tsx`, `components/signup-app.tsx`
- `components/service-area-autocomplete.tsx`, `lib/service-area.ts`, `lib/places/*`
- `app/api/places/autocomplete/route.ts`, `app/api/places/details/route.ts`
- `drizzle/schema.ts`, `drizzle/migrations/0001_agency_signup_fields.sql`
- `data/env/server.ts`, `.env.example`

---

### T007 - Build Agency Post-Signup Onboarding Wizard
Status: PENDING
Owner: Code Agent

Goal:
Build multi-step onboarding wizard shown after agency signup.

Acceptance Criteria:
- Welcome step exists
- Invite internal team step exists
- Add healthcare professionals step exists
- Add facilities/customers step exists
- Configure compliance requirements step exists
- Create first staffing request step exists
- Completion screen exists with dashboard CTA
- Progress indicator exists
- Users can move forward/back
- Mock data submission works visually
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 2: Agency Operations

### T008 - Build Agency Operations Dashboard
Status: PENDING
Owner: Code Agent

Goal:
Build agency operations dashboard using app shell.

Acceptance Criteria:
- KPI cards show open requests, fill rate, available professionals, urgent shifts, active facilities, compliance alerts
- Active staffing requests panel exists
- Available healthcare professionals panel exists
- Operational risks panel exists
- Coordinator activity panel exists
- Facility activity panel exists
- Compliance alerts section exists
- Recent activity feed exists
- Quick actions exist
- Uses mock data
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T009 - Build Staffing Requests List View
Status: PENDING
Owner: Code Agent

Goal:
Build list view for agency staffing requests.

Acceptance Criteria:
- Page title is Staffing Requests
- Top actions include Create Staffing Request, Export, Filter, Search
- Summary cards exist: Open Requests, At-Risk Requests, Filled Today, Urgent Requests, Average Time-to-Fill
- Table shows Facility, Role Needed, Shift Date, Shift Time, Professionals Needed, Assigned, Fulfillment Status, Coordinator, Urgency, Compliance Readiness, Last Activity, Actions
- Filters exist for Facility, Role, Shift Date, Coordinator, Status, Urgency, Compliance
- Rows are clickable or visually indicate navigation
- Empty state exists
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T010 - Build Staffing Request Detail View
Status: PENDING
Owner: Code Agent

Goal:
Build mission-control detail screen for a staffing request.

Acceptance Criteria:
- Header shows facility, shift timing, requested role, number required, status, coordinator, priority
- Primary actions exist: Match Professionals, Broadcast Shift, Mark Filled, Escalate, Cancel Request
- Fulfillment progress timeline exists
- Assigned professionals section exists
- Suggested matches section exists
- Facility details section exists
- Compliance verification section exists
- Operational activity feed exists
- Risk and alerts section exists
- Communication panel exists
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T011 - Build Create Staffing Request Flow
Status: PENDING
Owner: Code Agent

Goal:
Build multi-step create staffing request workflow.

Acceptance Criteria:
- Step 1 captures facility and staffing need
- Step 2 captures shift details
- Step 3 captures urgency and requirements
- Step 4 captures assignment and coordination
- Step 5 review and create exists
- Validation states exist for required fields
- Save as Draft action exists visually
- Create action shows success state
- After creation, UI routes or indicates route to request detail view
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 3: Workforce Management

### T012 - Build Workforce List View
Status: PENDING
Owner: Code Agent

Goal:
Build operational workforce list for healthcare professionals.

Acceptance Criteria:
- Page title is Workforce
- Top actions include Add Healthcare Professional, Import CSV, Broadcast Shift, Export
- KPI cards show total active, available now, on shift, compliance alerts, expiring credentials, fill readiness score
- Table/grid shows name, role, specialty, location, availability, current assignment, compliance, reliability, last shift, shift readiness, actions
- Search, filters, sort, bulk actions exist visually
- Rows are clickable or indicate profile navigation
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T013 - Build Healthcare Professional Profile
Status: PENDING
Owner: Code Agent

Goal:
Build operational readiness profile for a healthcare professional.

Acceptance Criteria:
- Profile header shows avatar, name, role, specialty, availability, shift readiness, reliability, compliance
- Actions exist: Assign to Shift, Send Message, Update Availability, Upload Credential, Suspend, View Shift History
- Availability calendar section exists
- Credentials and compliance section exists
- Shift history section exists
- Current assignments section exists
- Communication timeline exists
- Operational metrics section exists
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T014 - Build Add/Invite Healthcare Professional Flow
Status: PENDING
Owner: Code Agent

Goal:
Build flow to add healthcare professionals manually, via invite, or CSV import.

Acceptance Criteria:
- Entry UI offers Invite via SMS, Invite via Email, Add Manually, Import CSV
- Manual form includes full name, role, specialty, phone, email, location, years experience, preferred shift types
- Invite flow includes SMS/email preview and invite status
- CSV import UI includes drag/drop, mapping preview, validation summary
- Note explains professionals join by agency invitation
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 4: Healthcare Professional Experience

### T015 - Build RN Shift Invite And Detail Flow
Status: PENDING
Owner: Code Agent

Goal:
Build mobile-first shift invite notification and shift detail screen for healthcare professionals.

Acceptance Criteria:
- Shift invite notification card exists
- Push notification preview exists
- SMS preview exists
- Shift detail screen shows facility, department, date, start/end, hours, specialty, coordinator, instructions, credentials, urgency
- Sticky mobile action footer exists
- Actions include Accept Shift, Decline Shift, Message Coordinator
- Responsive mobile-first design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T016 - Build Accept/Decline Shift Flow
Status: PENDING
Owner: Code Agent

Goal:
Build professional shift accept/decline interaction.

Acceptance Criteria:
- Accept action opens confirmation modal
- Compliance readiness summary appears during accept
- Schedule conflict warning can be shown using mock condition
- Accept success state says shift is confirmed
- Decline action asks optional reason
- Decline reasons include unavailable, schedule conflict, distance, personal reason, other
- Flow is fast and mobile-friendly

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T017 - Build My Shifts And Availability Views
Status: PENDING
Owner: Code Agent

Goal:
Build healthcare professional upcoming shifts and availability management screens.

Acceptance Criteria:
- My Shifts page includes tabs Upcoming, Active, Completed
- Shift cards show facility, role, shift timing, status, coordinator, check-in status
- Actions include View Details, Contact Coordinator, Request Replacement
- Availability page includes weekly availability grid
- Availability toggles exist
- Preferred shift types, facilities, and locations exist visually
- Quick actions exist: Available This Weekend, Unavailable This Week, Open to Urgent Shifts
- Mobile-first responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T018 - Build Professional Cancellation/Replacement Flow
Status: PENDING
Owner: Code Agent

Goal:
Build flow for healthcare professional to request cancellation/replacement.

Acceptance Criteria:
- Request Shift Cancellation screen exists
- Shift details are shown
- Cancellation timing warning appears if shift starts soon
- Reason options exist: Emergency, Illness, Scheduling Conflict, Transportation Issue, Other
- Actions include Notify Coordinator and Request Replacement
- Confirmation state exists
- Urgent escalation warning exists for near-start shifts
- Mobile-first responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 5: Facility Portal

### T019 - Build Facility Invite Acceptance And Dashboard
Status: PENDING
Owner: Code Agent

Goal:
Build facility invite acceptance/login screen and facility dashboard.

Acceptance Criteria:
- Invite acceptance screen shows agency name/logo, facility name, invitation details
- Fields include name, work email, password, phone
- Facility dashboard shows Open Requests, Filled Shifts, At-Risk Requests, Upcoming Coverage, Active Professionals
- Active staffing requests section exists
- Upcoming assigned staff section exists
- Recent activity feed exists
- Create Staffing Request CTA exists
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T020 - Build Facility Create Request And Status Tracking
Status: PENDING
Owner: Code Agent

Goal:
Build lightweight facility request creation and request status tracking.

Acceptance Criteria:
- Facility create request form captures role, specialty, number needed, shift date, shift timing, priority, notes
- Priority options include Standard, Urgent, Critical Coverage
- Request status screen shows fulfillment timeline
- Timeline stages: Request Submitted, Matching Started, Professionals Contacted, Shift Assigned, Confirmed, Shift Active, Completed
- Assigned coordinator is visible
- Matching progress is visible
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T021 - Build Facility Assigned Staff, Update/Cancel, Communication Panels
Status: PENDING
Owner: Code Agent

Goal:
Build remaining facility portal operational screens.

Acceptance Criteria:
- Assigned professionals cards show name, role, specialty, shift timing, compliance verified badge, status
- Actions include View Details, Message Coordinator, Report Issue
- Update/cancel request UI exists
- Operational impact warning appears for cancellation
- Simple communication panel exists for coordinator messages and staffing updates
- Does not become a full chat platform
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 6: Notifications And Exceptions

### T022 - Build Global Notification Center
Status: PENDING
Owner: Code Agent

Goal:
Build notification center for operational alerts.

Acceptance Criteria:
- Page title is Notifications
- Notification categories exist: Staffing Requests, Shift Updates, Cancellations, Compliance, Workforce Availability, Facility Updates, Critical Alerts
- Notification cards show icon/type, title, message, timestamp, priority, related entity, action CTA
- Filters, search, mark as read, grouping exist visually
- Priority levels are visually clear
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T023 - Build Operational Alert Patterns
Status: PENDING
Owner: Code Agent

Goal:
Build reusable UI patterns for real-time operational alerts, reminders, cancellation alerts, compliance alerts, urgent staffing alerts, mobile notifications, toasts, and banners.

Acceptance Criteria:
- Dashboard alert banner/card patterns exist
- Shift reminder notification examples exist
- Cancellation alert pattern includes recommended actions
- Compliance alert pattern includes expiration timelines and actions
- Urgent staffing alert includes countdown/status indicator
- Mobile notification drawer or preview exists
- Toast/banner examples exist
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T024 - Build Exception State Components
Status: PENDING
Owner: Code Agent

Goal:
Build operational exception state UI components and examples.

Acceptance Criteria:
- No available professional found state exists
- Compliance mismatch state exists
- Shift conflict state exists
- RN declines shift state exists
- RN cancels shift state exists
- Facility cancels request state exists
- Request partially filled state exists
- Invite expired state exists
- Credential expired state exists
- Shift still unfilled near start time state exists
- Each state includes clear recovery actions
- Responsive design works

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

## Phase 7: Final MVP Readiness

### T025 - Create Navigation And Route Audit
Status: PENDING
Owner: Code Agent

Goal:
Ensure all MVP routes are accessible, navigation works, and page hierarchy matches the PRD.

Acceptance Criteria:
- Public pages route correctly
- Agency app pages route correctly
- Facility portal pages route correctly
- Professional pages route correctly
- Sidebar and top nav route links are valid
- No dead-end core workflow screens
- Basic breadcrumbs or page context exists where needed

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T026 - Responsive And Accessibility Pass
Status: PENDING
Owner: Code Agent

Goal:
Perform final responsive and accessibility polish across MVP screens.

Acceptance Criteria:
- Core pages work on desktop, tablet, and mobile
- No major horizontal overflow
- Form labels are present
- Buttons have clear text
- Status badges are readable
- Empty states are useful
- Critical actions have confirmation where needed

Implementation Notes:
-

Test Notes:
-

Files Changed:
-

---

### T027 - Final Build And MVP QA Handoff
Status: PENDING
Owner: Code Agent

Goal:
Prepare final MVP prototype for user review.

Acceptance Criteria:
- Lint passes or issues are documented
- Typecheck passes or issues are documented
- Build passes
- All previous tasks are passed or explicitly deferred
- README includes how to run the project
- Known limitations are documented

Implementation Notes:
-

Test Notes:
-

Files Changed:
-
