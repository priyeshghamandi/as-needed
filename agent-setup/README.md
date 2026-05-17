# Healthcare Staffing SaaS Autonomous Engineering System

This repository uses a module-based autonomous engineering workflow designed for Cursor agents.

The system is optimized for:
- structured AI-assisted engineering
- isolated module development
- autonomous implementation/testing loops
- scalable product architecture
- production-quality delivery

---

# Product Overview

This product is a Healthcare Staffing Operations Platform.

Primary customer:
- Staffing agencies

Secondary users:
- Healthcare professionals
- Facilities/customers

The platform helps agencies:
- manage workforce availability
- fulfill staffing requests
- coordinate shifts
- manage compliance
- track operational workflows
- manage staffing exceptions

This is NOT:
- a job board
- an ATS
- a payroll platform
- a marketplace

---

# Autonomous Engineering Architecture

The project is organized into isolated modules.

Each module contains:
- requirements
- implementation tasks
- testing rules

Example:

```text
modules/
  list.md

  1. Auth/
    prd.md
    tasks.md
    test.md

  2. Agency Onboarding/
    prd.md
    tasks.md
    test.md
```

---

# Core System Files

## Module Registry

```text
modules/list.md
```

Defines:
- all modules
- module order
- module status
- active module

---

## Module PRD

```text
modules/<module>/prd.md
```

Defines:
- workflows
- requirements
- architecture
- routes
- APIs
- UX expectations
- operational behavior

---

## Module Tasks

```text
modules/<module>/tasks.md
```

Defines:
- granular implementation tasks
- task status
- implementation notes
- testing handoffs

---

## Module Tests

```text
modules/<module>/test.md
```

Defines:
- validation requirements
- acceptance criteria
- QA expectations
- edge cases

---

# Cursor Rules

Cursor agents are controlled using:

```text
.cursor/rules/code-agent.mdc
.cursor/rules/test-agent.mdc
```

These files define:
- agent behavior
- coding rules
- testing rules
- architecture boundaries
- operational constraints

These rules should be configured as:

```text
Always Apply
```

inside Cursor.

---

# Agent Workflow

## Code Agent

Responsible for:
- implementation
- database work
- UI work
- API work
- task updates

The Code Agent:
- reads the active module files
- works only on the current task
- marks tasks `READY_FOR_TEST`

The Code Agent MUST NOT:
- redesign unrelated systems
- invent product scope
- modify future modules
- mark tasks `PASSED`

---

## Test Agent

Responsible for:
- QA validation
- acceptance verification
- responsiveness checks
- build validation
- operational correctness

The Test Agent:
- tests only `READY_FOR_TEST` tasks
- marks tasks `PASSED` or `FAILED_TEST`

The Test Agent MUST NOT:
- implement production code
- redesign workflows
- expand scope

---

# Task Lifecycle

## Standard Flow

```text
PENDING
→ IN_PROGRESS
→ READY_FOR_TEST
→ PASSED
```

## Failed Test Flow

```text
READY_FOR_TEST
→ FAILED_TEST
→ READY_FOR_TEST
→ PASSED
```

---

# Module Lifecycle

## Standard Flow

```text
PENDING
→ IN_PROGRESS
→ PASSED
```

Only ONE module should be:

```text
IN_PROGRESS
```

at a time unless explicitly coordinated.

---

# Verification Strategy

Formal test sign-off (all T* tasks) is deferred to the end of each phase, not run after every module. This keeps momentum while ensuring correctness at meaningful integration points.

## After every module (mandatory)

Run immediately after marking a module `READY_FOR_TEST`:

```bash
npm run typecheck
npm run build
```

Then manually walk the golden path for that module (the single most common user flow, end-to-end). If it breaks, fix before moving on. This takes ~5 minutes and catches the majority of regressions.

## At module seams (mandatory)

Before starting a module that depends on a prior one, verify the contract between them. Examples:

- Before Staffing Requests (6): confirm Facilities (5) CRUD persists correctly
- Before Shifts (7): confirm Staffing Requests (6) creates and status-transitions correctly
- Before Matching (8): confirm Shifts (7) and Workforce (4) data is queryable as expected

A bug in a dependency found at the seam is easy to fix. The same bug found two modules later is not.

## Auth and authorization (never defer)

Before starting any module that sits behind role-based access control, verify:

- role-based redirects work correctly
- agency-scoped access is enforced (cross-agency requests return 403)
- invite flows work end-to-end

These bugs propagate silently into every module built on top of them.

## End of each phase (full T* pass)

Run the full test suite for all modules completed in that phase:

| Phase end | Modules to fully test |
|---|---|
| Phase 1 | Auth (T001–T026), Onboarding (T001–T020), Ops Dashboard (T*) |
| Phase 2 | Workforce, Facilities, Staffing Requests, Shifts, Matching (T* for each) |
| Phase 3 | HP Portal, Facility Portal (T* for each) |
| Phase 4 | Compliance, Notifications, Activity Logs, Settings (T* for each) |

Defer edge cases, error states, and responsiveness checks to this phase-end pass. They do not block module-to-module progress.

---

# Branch Strategy

Each module should use its own git branch.

Examples:

```text
module/auth
module/agency-onboarding
module/workforce
module/facilities
module/staffing-requests
```

Recommended workflow:

```bash
git checkout develop
git checkout -b module/auth
```

Only merge a module branch when:
- all module tasks pass
- build passes
- test agent approves
- no blocking issues remain

---

# Recommended Development Flow

## Step 1

Set active module in:

```text
modules/list.md
```

Example:

```text
Auth → IN_PROGRESS
```

---

## Step 2

Code Agent:
- reads active module files
- picks first `PENDING` task
- implements task
- marks task `READY_FOR_TEST`

---

## Step 3

After all implementation tasks in a module are `READY_FOR_TEST`:

1. Run `npm run typecheck` — must pass with no errors
2. Run `npm run build` — must pass with no errors
3. Walk the golden path manually (the primary user flow for that module)
4. If any step fails, fix before proceeding

---

## Step 4

If typecheck, build, or golden path fail:
- Code Agent fixes only the reported issues
- Re-runs verification

---

## Step 5

Mark module `PASSED` and activate the next module.

Full T* test suite tasks are deferred to the end of the current phase (see Verification Strategy).

---

## Step 6 (end of phase)

When all modules in a phase are `PASSED`:
- Run the full T* test suite for every module in that phase
- Fix any failures before starting the next phase
- Mark failed tasks `FAILED_TEST`, fix, re-verify, mark `PASSED`

---

# Technology Stack

## Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react
- React Hook Form
- Zod

---

## Backend

- PostgreSQL
- Drizzle ORM
- Auth.js

---

# Engineering Principles

## Modular Architecture

Modules must remain isolated.

Avoid:
- cross-module implementation
- speculative future architecture
- unnecessary abstractions

---

## Production Quality

All implementations must:
- pass lint
- pass typecheck
- pass build
- be responsive
- follow operational UX patterns

---

## Operational UX

The UI should feel like:
> a premium healthcare operations SaaS platform

Avoid:
- consumer app styling
- generic HR/job board patterns
- cluttered admin interfaces

---

# Shared System Files

Recommended shared docs:

```text
docs/architecture.md
docs/design-system.md
```

These define:
- app structure
- coding standards
- UI standards
- shared patterns
- naming conventions

---

# Important Rule

The source of truth is ALWAYS:

1. active module `prd.md`
2. active module `tasks.md`
3. active module `test.md`

Agents must not invent product scope outside those files.

