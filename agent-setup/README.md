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

Test Agent:
- validates task
- marks:
  - `PASSED`
  OR
  - `FAILED_TEST`

---

## Step 4

If failed:
- Code Agent fixes only reported issues
- returns task to `READY_FOR_TEST`

---

## Step 5

When all tasks in a module pass:
- mark module `PASSED`
- activate next module

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

