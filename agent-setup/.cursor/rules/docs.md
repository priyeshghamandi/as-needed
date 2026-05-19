# Module Documentation Generator Guide

## Purpose

This file is used by an engineering/product LLM to generate the following files for each module listed in `modules/list.md`:

- `prd.md`
- `test.md`
- `tasks.md`

The LLM must use this document as the global product and architecture context when creating module-specific documentation.

This file is NOT a product module PRD.
This file is the source-of-truth guide for generating module PRDs, tests, and task plans.

---

# Product Context

The product is a **Hybrid Healthcare Staffing Marketplace and Agency Operations Platform**.

It combines:

1. **Public marketplace discovery** — customers search and browse eligible healthcare professionals by category, role, location, and shift need.
2. **Agency operations control** — agencies own workforce, fulfill requests, confirm assignments, and coordinate shifts.

Primary customers (buyers):
- Healthcare staffing agencies (operations SaaS)
- Facilities and healthcare organizations (marketplace customers, invite-based)
- Individuals and families seeking home care (marketplace customers, self-serve — module 24)

Secondary users:
- Healthcare professionals invited and managed by agencies
- Agency coordinators (operational middle layer)

The platform helps:

**Agencies**
- own and manage healthcare professionals
- control public marketplace visibility (opt-in, agency-controlled)
- receive routed staffing requests for their professionals
- confirm requested professionals or suggest alternatives
- fulfill staffing requests with operational authority
- coordinate shifts, compliance, and cancellations

**Customers (facilities)**
- discover eligible professionals through public category and search experiences
- select preferred professionals (not direct hire)
- submit staffing requests through the platform
- approve agency confirmations or suggested alternatives
- track fulfillment progress through agency coordination

**Healthcare professionals**
- manage availability and credentials under agency ownership
- receive shift coordination through agency workflows (not direct customer contracting)

This product is NOT:
- an open gig marketplace
- a direct booking platform
- a job board or ATS
- a generic HR or payroll system
- a platform where customers hire professionals directly
- a platform with direct customer ↔ professional messaging in MVP

The core product idea is:
> agency-controlled healthcare staffing fulfillment, with public discovery that routes demand to the owning agency.

---

# Product Philosophy

The platform should optimize for:

- agency ownership and fulfillment authority
- operational speed for coordinators
- public discovery with strict eligibility and geography rules
- staffing request routing to owning agencies
- fulfillment tracking and alternative suggestion workflows
- availability coordination (internal precision, public approximation)
- compliance awareness
- invite-based professional participation (no public self-signup for professionals)
- real-world staffing workflows

Avoid:
- open marketplace dynamics (any agency can claim any professional)
- direct customer-to-professional contracting or messaging
- public exact availability or schedule exposure
- public healthcare professional self-signup
- “booking” language or instant-hire UX patterns
- generic job posting or gig-economy patterns
- complex enterprise setup
- payroll/invoicing scope in MVP
- speculative future features

The agency remains the operational and legal middle layer between customers and professionals.

---

# User Model

## Agency Users

Primary SaaS users and operational owners.

Roles:
- agency_owner
- agency_admin
- staffing_coordinator
- recruiter
- compliance_manager

Agency owners can self-signup.

All other agency users are invited by the agency.

Agency users:
- manage workforce and marketplace eligibility
- control which professionals are publicly visible (opt-in)
- review routed staffing requests
- confirm requested professionals or suggest alternatives
- assign shifts and coordinate fulfillment
- manage facilities/customers in agency context

---

## Healthcare Professionals

Examples:
- RN
- CNA
- EMT
- LPN
- CNM
- CNS

Healthcare professionals are **invite-only** and **agency-owned**.

They cannot publicly self-signup.

They belong to exactly one agency (MVP).

They use the platform to:
- manage availability (internal precision)
- receive shift invites and assignments from their agency
- accept/decline shifts
- view upcoming shifts
- upload credentials
- communicate with **agency coordinators only** (not customers directly in MVP)

Public visibility (when agency-enabled):
- public profile with role, credentials summary, service area, and approximate availability signals
- never exact schedules or real-time calendar slots on public pages

---

## Customer Users — Organization (Facilities)

Examples:
- hospitals
- clinics
- nursing homes
- assisted living facilities
- home healthcare organizations (B2B facility contacts)

Role: `facility_user`

Access:
- **Invite-only** — created when an agency adds a facility and invites a contact (modules 5, 10)
- Uses `/customer/requests/*` (marketplace cart) and/or `/facility/*` portal

These customers use the platform to:
- browse public category directory and search results (after invite + login)
- select preferred professionals and **Request Professional**
- track staffing request and fulfillment status
- approve agency confirmation or **Suggested Alternative**

They do **not** need to pick “their agency” on the marketplace first; they may select professionals from **any** eligible agency in their area once authenticated. They **do** require an agency to have onboarded them as a facility contact.

---

## Customer Users — Consumer (Home Care)

Examples:
- families needing in-home nursing or aide support
- individuals arranging post-discharge home care
- private-pay home care seekers

Role: `consumer`

Access:
- **Self-signup** at `/signup/care` (module 24) — **no agency invite required**
- Care **site** (home address) created at signup; linked via `user_care_sites`
- Same marketplace discovery and `/customer/requests/*` flows as facility customers after auth

Consumers use the platform to:
- sign up with home location without a pre-existing agency relationship on AsNeeded
- browse and search geo-eligible professionals from **all agencies** on the platform
- submit **Staffing Requests** that route to the **owning agencies** of selected professionals
- approve agency confirmation or **Suggested Alternative** on `/customer/requests/[id]`

Consumers do **not**:
- hire or contract professionals directly
- message professionals directly in MVP
- access agency operations routes (`/dashboard`, `/staffing-requests`, etc.)
- use `/facility/*` invite-only portal (module 10)

Module reference: `modules/24. Consumer Home Care`

---

## Customer Users (shared rules)

All customer types (`facility_user` and `consumer`):

- browse within geography rules
- view only opt-in public profiles
- **Request Professional** — not Book / Hire
- agency-mediated fulfillment only
- no direct customer ↔ professional messaging in MVP

---

## Public (Unauthenticated) Visitors

Public visitors can:
- browse category directory pages (SEO-oriented)
- use marketplace search with mandatory geography filtering
- view opt-in public professional profiles within supported regions

Public visitors cannot:
- see non–opt-in professionals
- see professionals outside region eligibility
- see exact availability schedules
- submit staffing requests without completing customer authentication/onboarding as defined by module PRDs

---

# Core Operational Loop

Every module should support this hybrid marketplace + agency fulfillment loop:

## Discovery (public)

1. Visitor or customer lands on public category directory (SEO structure by role/category)
2. Customer searches by **role + location + shift need**
3. Platform applies **mandatory geography/service-area filtering**
4. Platform shows only **eligible, opt-in** healthcare professionals from **multiple agencies**
5. Customer views public professional profiles (approximate availability only)
6. Customer selects one or more preferred professionals → **Request Professional**

## Request and routing

7. Platform creates a **Staffing Request** tied to customer, shift need, and selected professional(s)
8. Request **routes to the agency** that owns each selected professional
9. Customer sees request status; agency coordinators are notified

## Agency fulfillment

10. Agency coordinator reviews routed request
11. Agency **confirms** the requested professional **OR** submits a **Suggested Alternative**
12. Customer reviews and approves confirmation or alternative
13. Agency coordinates assignment, invites, and shift creation through internal ops workflows

## Shift confirmation

14. Healthcare professional accepts/declines per agency workflow (internal)
15. Shift becomes confirmed
16. Customer sees fulfillment progress; agency retains operational control
17. Notifications and activity logs track key events

Agency-only paths (without public discovery) may still exist for invited facilities and coordinator-created requests, but must converge on the same staffing request and fulfillment model.

**Consumer path (module 24):** signup → care site → marketplace → select professionals → staffing request → route to each professional’s agency → same fulfillment loop as facility customers.

---

# Marketplace-Specific Context

Module PRDs for marketplace modules must respect the following.

## Public professional discovery

- Discovery is public for eligible, opt-in profiles only.
- Professionals are discoverable across agencies (multi-agency directory).
- Ownership and fulfillment remain single-agency per professional.
- Public discovery must not imply direct employment or booking.

## Customer request flows

- Primary CTA: **Request Professional** (not “Book” or “Hire”).
- Selection creates a **Staffing Request**, not a confirmed shift.
- Requests include: role, location, shift need, selected professional(s), customer/facility context.
- No instant confirmation without agency fulfillment review.

## Agency approval flows

- Routed requests appear in agency operations queues.
- Coordinators have **fulfillment authority**: confirm or decline with reason.
- Confirmation is not final until customer approval where required by flow.
- Agencies may fulfill with internal matching even when customer pre-selected a professional.

## Alternative suggestions

- Agency may propose a **Suggested Alternative** professional (same agency).
- Customer must explicitly approve alternatives before shift coordination proceeds.
- Alternatives must respect geography and eligibility rules.
- Original selection and alternative history should be auditable.

## Public category pages

- SEO-oriented structure: category → role/specialty → geo context where applicable.
- Pages list eligible professionals only (post-filter).
- No empty national listings; geography constraints apply to listings and search.

## Professional public profiles

- Opt-in and agency-controlled.
- Show: role, credentials summary (non-sensitive), service area, agency affiliation (as policy allows), approximate availability.
- Hide: exact schedules, internal notes, cross-agency data, direct contact.

## Marketplace visibility rules

- Default: professional is **not** publicly visible.
- Agency enables marketplace visibility per professional.
- Visibility may depend on: compliance status, profile completeness, service area coverage.
- Agency can revoke visibility at any time.

## Public search and filtering

- Required filters: role/category, location (with service-area enforcement), shift need (date range or urgency class per PRD).
- Sort and facet rules must not bypass geography restrictions.
- Search index only includes opt-in, eligible professionals.

## Request routing

- Route to **owning agency** of each selected professional.
- Multi-select may create one request with multiple agency routes or split per PRD — must be explicit in module PRD.
- Agencies only see requests routed to them and their professionals.

## Geography restrictions

- Customers must never see professionals outside supported regions.
- Region eligibility is computed from agency service areas, professional locations, and customer/facility location.
- Fail closed: if location cannot be validated, show no results (not unfiltered results).

## SEO category structure

- Stable URL patterns for categories and roles.
- Indexable landing pages where appropriate.
- Avoid thin or duplicate geo pages; follow module PRD for canonical rules.

## Approximate availability (public)

Public profiles may show only coarse signals, such as:
- likely available
- available this week
- recently active

Do **not** expose exact schedules, shift blocks, or real-time free/busy on public surfaces.

---

# Module File Requirements

For every module in `modules/list.md`, generate:

```text
modules/<module>/
  prd.md
  test.md
  tasks.md
```

---

# prd.md Generation Rules

Each `prd.md` must include:

1. Module Overview
2. Goals
3. Non-Goals
4. Primary Users
5. Entry Points
6. User Flows
7. Screens or Pages
8. Functional Requirements
9. Data Requirements
10. Authorization Rules
11. UX Requirements
12. Error and Empty States
13. Mobile/Responsive Requirements
14. Acceptance Criteria
15. Out of Scope

The PRD must be specific enough that a Code Agent can implement the module without guessing.

Do NOT write vague requirements like:
- “make this user friendly”
- “add dashboard”
- “support notifications”

Instead, define:
- exact routes
- exact screens
- exact fields
- exact statuses
- exact user permissions
- exact completion rules
- exact expected behavior
- exact routing rules (for marketplace requests)
- exact geography eligibility rules
- exact public vs internal data boundaries

Marketplace modules must additionally specify:
- public vs authenticated routes
- SEO metadata rules where applicable
- opt-in visibility checks
- geography fail-closed behavior
- terminology (**Request Professional**, **Staffing Request**, **Fulfillment**, **Suggested Alternative**)

---

# test.md Generation Rules

Each `test.md` must define executable automated test requirements.

The test plan should instruct the Code Agent/Test Agent to create and run actual tests, not only do manual QA.

Each `test.md` must include:

1. Test Strategy
2. Required Playwright E2E Tests
3. Required Unit/Integration Tests
4. Required Authorization Tests
5. Required Validation Tests
6. Required Error/Edge Case Tests
7. Responsive Tests
8. Accessibility Tests
9. Build Health Checks
10. Pass Criteria

## Recommended Test Stack

Use Playwright for:
- auth flows
- onboarding flows
- public marketplace and category browsing (geo-filtered)
- customer Request Professional flows
- agency fulfillment review and alternative suggestion flows
- staffing request routing
- shift assignment flows
- portals
- route protection
- role-based routing

Use Vitest for:
- validation schemas
- utility functions
- authorization helpers
- service-area and geography eligibility calculations
- marketplace visibility and opt-in rules
- matching filters
- status transition logic
- request routing rules

## Required Build Checks

Every module test plan must include:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

If a script does not exist, the Test Agent must note it.

---

# tasks.md Generation Rules

Each `tasks.md` must break the module into granular, implementation-ready tasks.

Each task should be small enough for a coding agent to complete safely.

Avoid large tasks like:
- “Build workforce module”
- “Create dashboard”
- “Implement marketplace”

Prefer granular tasks like:
- “Create workforce list route”
- “Create workforce table columns”
- “Implement professional location validation”
- “Add marketplace opt-in toggle with agency permission check”
- “Add Playwright test for geo-filtered search excluding out-of-area professionals”

Each `tasks.md` must include:

1. Module Status
2. Task Status Definitions
3. Implementation Tasks
4. Testing Tasks
5. Acceptance Criteria
6. Code Agent Rules
7. Test Agent Rules

Task statuses:
- PENDING
- IN_PROGRESS
- READY_FOR_TEST
- FAILED_TEST
- PASSED
- BLOCKED

---

# Engineering Stack

Use:

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react
- React Hook Form
- Zod
- PostgreSQL
- Drizzle ORM
- Auth.js
- Playwright
- Vitest

---

# Database Context

Core tables likely include:

- users
- accounts
- sessions
- verification_tokens
- agencies
- user_roles
- healthcare_professionals
- facilities (organization sites and consumer home care sites via `site_kind`)
- user_care_sites (consumer user ↔ care site link)
- customers (facility_user invite path; consumer self-serve path per module 24)
- staffing_requests
- staffing_request_selections (customer-selected professionals)
- staffing_request_routes (agency routing per request)
- fulfillment_reviews (agency confirm / decline)
- suggested_alternatives
- shifts
- shift_assignments
- credentials
- availability_blocks
- professional_marketplace_profiles (public-safe fields)
- marketplace_visibility_settings (opt-in, agency-controlled)
- marketplace_categories (directory / SEO)
- geography_eligibility_cache (optional, per PRD)
- notifications
- activity_logs
- invites

Do not create new tables unless the module clearly requires them.

Use data ownership rules:
- most operational data belongs to an agency
- healthcare professionals belong to an agency
- agencies control public visibility for their professionals
- staffing requests link customer, facility context, and routed agencies
- customers must not access agency-internal data for professionals they did not request
- agencies must not access other agencies’ workforce or routed requests
- public read models must expose only opt-in, geography-eligible professional data

---

# Location and Service Area Rules

Geography is mandatory for marketplace discovery and customer search.

Rules:
- agency selects service area during signup/onboarding
- Google Places autocomplete may be used for service area and location capture
- healthcare professional locations must be restricted to agency service area
- facility/customer/care-site locations must be validated for request eligibility
- consumer care sites use the same location fields as facilities (lat/lng, placeId)
- public search and category listings **must filter** by supported regions
- do not show professionals outside agency/customer coverage intersection (per PRD rules)
- customers should never see professionals outside supported regions

Store location data with:
- displayName
- placeId
- city
- state
- country
- latitude
- longitude

For MVP:
- one primary agency service area is enough
- one location per professional/facility/customer is enough
- multiple service areas can be future scope

---

# Authorization Rules

All modules must respect role-based access and marketplace boundaries.

## Agency Owner / Agency Admin

Can:
- manage agency settings
- manage onboarding
- manage team
- manage workforce
- manage marketplace visibility (opt-in) for professionals
- manage facilities/customers (agency-connected)
- manage staffing requests (including routed marketplace requests)
- confirm professionals or suggest alternatives
- manage shifts

## Staffing Coordinator

Can:
- manage staffing requests (including routed requests)
- review fulfillment and suggest alternatives
- assign professionals
- manage shift coordination
- view workforce and facilities
- communicate with customers and professionals in agency context

## Recruiter

Can:
- manage healthcare professionals
- invite workforce
- configure marketplace profile fields (where delegated)
- view staffing needs

## Compliance Manager

Can:
- manage credentials
- view compliance status
- request credential updates
- block or flag marketplace visibility when compliance requires

## Healthcare Professional

Can:
- view own shift invites
- accept/decline shifts
- manage own availability (internal)
- upload own credentials
- communicate with agency coordinators only

Cannot:
- communicate with customers directly in MVP
- enable own public marketplace visibility without agency control

## Customer / Facility User (`facility_user`)

Can:
- browse public marketplace within geography rules (after invite)
- view public profiles for eligible professionals
- submit **Request Professional** / staffing requests for invited facility
- view own request and fulfillment status
- approve agency confirmation or suggested alternative
- use `/facility/*` portal where implemented (module 10)

Cannot:
- self-signup without agency invite (MVP)
- view non–opt-in or out-of-area professionals
- hire or contract professionals directly
- message professionals directly in MVP
- access other customers’ requests or agency-internal ops data

## Consumer (`consumer`)

Can:
- self-signup (`/signup/care`)
- browse public marketplace within geography rules
- submit staffing requests from care site via `/customer/requests/*`
- view and approve fulfillment for own requests only

Cannot:
- access `/facility/*` (invite-only facility portal)
- access agency operations routes
- message professionals directly in MVP
- submit requests without at least one selected professional (MVP)

## Public (unauthenticated)

Can:
- browse category directory and search (geo-filtered)
- view opt-in public professional profiles in supported regions

Cannot:
- see opt-out or ineligible professionals
- bypass geography filters
- access agency operations or internal availability

---

# UX Rules

The product has two UX modes that must feel cohesive:

## Public marketplace surfaces

- discoverable, trustworthy, healthcare-appropriate
- search-first with clear geography context
- professional cards and profiles optimized for selection, not hiring
- primary CTA: **Request Professional**
- transparent that fulfillment is agency-coordinated
- no gig-economy or consumer booking patterns

## Agency operations surfaces (SaaS)

- premium B2B healthcare operations product
- clean, professional, operational, fast
- status-driven fulfillment queues (routed requests, alternatives pending approval)
- spacious layouts, tables, badges, progress indicators

Shared traits:
- responsive
- accessible
- clear empty states (including “no professionals in your area”)
- low clutter

Avoid:
- “Book now” / instant confirmation UX
- playful consumer gig UI
- generic job-board patterns
- dense enterprise screens
- exposing internal agency notes on public pages
- direct chat between customer and professional in MVP

---

# Language Rules

Use operational healthcare staffing and marketplace routing language.

Preferred:
- Request Professional
- Staffing Request
- Fulfillment
- Suggested Alternative
- Workforce
- Healthcare Professional
- Customer / Facility
- Shift
- Assignment
- Availability (internal)
- Approximate Availability (public)
- Compliance
- Coordinator
- Category Directory
- Marketplace Visibility
- Routed Request
- Agency Confirmation
- Cancellation
- Operational Alert

Avoid:
- Booking / Book Now
- Hire / Direct Hire
- Instant Match
- Gig / Gig Worker
- Candidate
- Applicant
- Job Posting
- Open Marketplace
- Employee Marketplace
- Payroll Batch
- Invoice Batch

---

# Module Generation Workflow

When asked to generate module docs:

1. Read `modules/list.md`
2. Identify the requested module
3. Use this `docs.md` for global context
4. Generate:
   - `prd.md`
   - `test.md`
   - `tasks.md`
5. Keep the module scoped
6. Do not introduce future-module functionality unless required as a dependency
7. Ensure tests require actual Playwright/Vitest coverage
8. Ensure tasks are granular and implementation-ready
9. For marketplace modules, explicitly test geography fail-closed and opt-in visibility
10. Preserve agency-centric fulfillment in all customer-facing flows
11. For module 24 (Consumer Home Care): distinguish `consumer` from `facility_user`; care site without agency invite; routing still per professional owning agency

---

# Branching Rules

Each module should use a dedicated git branch.

Examples:
- module/auth
- module/agency-onboarding
- module/marketplace-eligibility-rules
- module/category-directory
- module/professional-public-profiles
- module/marketplace-search
- module/customer-requests
- module/agency-fulfillment-review
- module/alternative-suggestions
- module/consumer-home-care
- module/workforce
- module/facilities
- module/staffing-requests
- module/shifts
- module/matching-assignments
- module/healthcare-professional-portal
- module/facility-portal

Code Agent must not merge branches.

Only merge a module branch after:
- all tasks are PASSED
- automated tests pass
- build passes
- module is approved

---

# Definition of Done For Any Module

A module is complete only when:

- PRD requirements are implemented
- all tasks are PASSED
- required Playwright tests exist and pass
- required Vitest tests exist and pass where applicable
- lint passes
- typecheck passes
- build passes
- responsive behavior works
- authorization is enforced
- no cross-agency data leakage exists
- marketplace modules enforce opt-in visibility and geography restrictions
- public surfaces do not expose exact availability or internal agency data
- module boundaries are respected
- no unrelated future scope was added
