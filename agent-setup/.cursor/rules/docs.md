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

The product is a Healthcare Staffing Operations Platform.

Primary customer:
- Healthcare staffing agencies

Secondary users:
- Healthcare professionals invited by agencies
- Facilities/customers connected to agencies

The product helps staffing agencies:
- manage healthcare professional availability
- manage facilities/customers
- create and fulfill staffing requests
- coordinate shifts and assignments
- track compliance and credentials
- manage cancellations and operational exceptions
- notify users about urgent staffing events
- provide visibility to facilities

This product is NOT:
- a job board
- an ATS
- a generic HR system
- a payroll system
- a public staffing marketplace

The core product idea is:
> operational control center for healthcare staffing agencies.

---

# Product Philosophy

The platform should optimize for:

- operational speed
- staffing visibility
- fulfillment tracking
- availability coordination
- compliance awareness
- agency control
- invite-based participation
- real-world staffing workflows

Avoid:
- marketplace-first flows
- public healthcare professional signup
- generic job posting language
- complex enterprise setup
- payroll/invoicing scope in MVP
- speculative future features

---

# User Model

## Agency Users

Primary users and buyers.

Roles:
- agency_owner
- agency_admin
- staffing_coordinator
- recruiter
- compliance_manager

Agency owners can self-signup.

All other agency users are invited by the agency.

---

## Healthcare Professionals

Examples:
- RN
- CNA
- EMT
- LPN
- CNM
- CNS

Healthcare professionals are invite-only.

They cannot publicly self-signup.

They use the platform to:
- manage availability
- receive shift invites
- accept/decline shifts
- view upcoming shifts
- upload credentials
- communicate with agency coordinators

---

## Facility Users

Examples:
- hospitals
- clinics
- nursing homes
- assisted living facilities
- home healthcare organizations

Facility users are invite-only or request-access only in MVP.

They use the platform to:
- submit staffing requests
- track request fulfillment
- view assigned healthcare professionals
- communicate with agency coordinators

---

# Core Operational Loop

Every module should support this core product loop:

1. Agency creates workspace
2. Agency configures service area
3. Agency adds healthcare professionals
4. Agency adds facilities
5. Facility or agency creates staffing request
6. Agency coordinator reviews request
7. System suggests matching healthcare professionals
8. Coordinator invites/assigns professionals
9. Healthcare professional accepts/declines
10. Shift becomes confirmed
11. Facility sees fulfillment progress
12. Notifications/activity logs track key events

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
- staffing request flows
- shift assignment flows
- portals
- route protection
- role-based routing

Use Vitest for:
- validation schemas
- utility functions
- authorization helpers
- service-area calculations
- matching filters
- status transition logic

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
- “Implement onboarding”

Prefer granular tasks like:
- “Create workforce list route”
- “Create workforce table columns”
- “Implement professional location validation”
- “Add Playwright test for workforce add flow”

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
- facilities
- staffing_requests
- shifts
- shift_assignments
- credentials
- availability_blocks
- notifications
- activity_logs
- invites

Do not create new tables unless the module clearly requires them.

Use agency-scoped data rules:
- most operational data belongs to an agency
- users must not access data across agencies
- healthcare professionals belong to an agency
- facilities belong to an agency
- requests belong to an agency and facility

---

# Location and Service Area Rules

Agency service area is important.

Rules:
- agency selects service area during signup/onboarding
- Google Places autocomplete may be used for service area
- healthcare professional locations must be restricted to agency service area
- facility locations must be restricted to agency service area
- do not allow professionals or facilities outside agency coverage area

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
- one location per professional/facility is enough
- multiple service areas can be future scope

---

# Authorization Rules

All modules must respect role-based access.

## Agency Owner / Agency Admin

Can:
- manage agency settings
- manage onboarding
- manage team
- manage workforce
- manage facilities
- manage staffing requests
- manage shifts

## Staffing Coordinator

Can:
- manage staffing requests
- assign professionals
- manage shift coordination
- view workforce and facilities

## Recruiter

Can:
- manage healthcare professionals
- invite workforce
- view staffing needs

## Compliance Manager

Can:
- manage credentials
- view compliance status
- request credential updates

## Provider

Can:
- view own shift invites
- accept/decline shifts
- manage own availability
- upload own credentials

## Facility User

Can:
- create staffing requests
- view own facility requests
- view assigned professionals
- message agency coordinator

---

# UX Rules

The UI must feel like a premium B2B healthcare operations SaaS product.

Design traits:
- clean
- professional
- operational
- fast
- spacious
- status-driven
- low clutter
- responsive

Use:
- cards
- tables
- status badges
- progress indicators
- stepper/wizard patterns
- actionable empty states
- clear alerts

Avoid:
- playful consumer UI
- generic HR/job-board patterns
- dense enterprise screens
- unnecessary animations

---

# Language Rules

Use operational healthcare staffing language.

Preferred:
- Staffing Request
- Workforce
- Healthcare Professional
- Facility
- Shift
- Assignment
- Availability
- Compliance
- Fulfillment
- Coordinator
- Cancellation
- Operational Alert

Avoid:
- Candidate
- Applicant
- Job Posting
- Marketplace Listing
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

---

# Branching Rules

Each module should use a dedicated git branch.

Examples:
- module/auth
- module/agency-onboarding
- module/workforce
- module/facilities
- module/staffing-requests
- module/shifts
- module/matching-assignments
- module/provider-portal
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
- module boundaries are respected
- no unrelated future scope was added
