# Alternative Suggestions — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Alternative Suggestions |
| Branch | `module/alternative-suggestions` |
| Status | PENDING |
| Depends on | Agency Fulfillment Review (22), Customer Requests (20), Marketplace Eligibility Rules (15) |

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| ALT-001 | Migration: `suggested_alternatives` | PENDING |
| ALT-002 | `lib/fulfillment/alternative-status.ts` | PENDING |
| ALT-003 | `POST /api/staffing-requests/[id]/alternatives` | PENDING |
| ALT-004 | `DELETE .../alternatives/[altId]` withdraw | PENDING |
| ALT-005 | Agency alternative picker component | PENDING |
| ALT-006 | Suggest alternative modal on fulfillment page | PENDING |
| ALT-007 | `POST /api/customer/requests/[id]/alternatives/[altId]/approve` | PENDING |
| ALT-008 | `POST .../reject` | PENDING |
| ALT-009 | Customer comparison card UI | PENDING |
| ALT-010 | Update selections on approve | PENDING |
| ALT-011 | Notification hooks | PENDING |
| ALT-012 | lint, typecheck, build | PENDING |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| ALT-T001 | Vitest alternative-status | PENDING |
| ALT-T002 | API route tests | PENDING |
| ALT-T003 | E2E suggest/approve/reject/withdraw | PENDING |
| ALT-T004 | lint, typecheck, build, test | PENDING |

---

## 5. Acceptance Criteria

- Suggested Alternative flow end-to-end per PRD
- Agency-centric; customer explicit approval
- All ALT-T* pass
