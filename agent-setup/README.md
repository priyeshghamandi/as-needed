# Healthcare Staffing SaaS Agent Setup

Use this folder as the operating system for Cursor-based development.

## Files

- `docs/PRD.md` - Product source of truth
- `TASKS.md` - Granular implementation task tracker
- `agents/CODE_AGENT.md` - Instructions for the implementation agent
- `agents/TEST_AGENT.md` - Instructions for the QA/test agent
- `.cursor/rules/code-agent.mdc` - Optional Cursor rule version of code agent
- `.cursor/rules/test-agent.mdc` - Optional Cursor rule version of test agent

## Recommended Cursor Workflow

1. Start a new Cursor chat and paste: `Act as the Code Agent. Read agents/CODE_AGENT.md and start the next eligible task from TASKS.md.`
2. When the code agent marks a task as `READY_FOR_TEST`, start a new Cursor chat and paste: `Act as the Test Agent. Read agents/TEST_AGENT.md and test the current READY_FOR_TEST task.`
3. If the test agent marks the task `FAILED_TEST`, return to the Code Agent and ask it to fix only the listed issues.
4. Repeat until the test agent marks the task `PASSED`.
5. Then ask the Code Agent to move to the next `PENDING` task.

## Status Flow

`PENDING -> IN_PROGRESS -> READY_FOR_TEST -> PASSED`

If test fails:

`READY_FOR_TEST -> FAILED_TEST -> IN_PROGRESS -> READY_FOR_TEST`

## Important Principle

The agents must not invent product scope. The PRD and TASKS files are the source of truth.
