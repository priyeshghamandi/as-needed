# Alternative Suggestions — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Alternative Suggestions |
| Branch | `module/alternative-suggestions` |
| Status | COMPLETE |
| Depends on | Agency Fulfillment Review (22), Customer Requests (20), Marketplace Eligibility Rules (15) |

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| ALT-001 | Migration: `suggested_alternatives` | COMPLETE |
| ALT-002 | `lib/fulfillment/alternative-status.ts` | COMPLETE |
| ALT-003 | `POST /api/staffing-requests/[id]/alternatives` | COMPLETE |
| ALT-004 | `DELETE .../alternatives/[altId]` withdraw | COMPLETE |
| ALT-005 | Agency alternative picker component | COMPLETE |
| ALT-006 | Suggest alternative modal on fulfillment page | COMPLETE |
| ALT-007 | `POST /api/customer/requests/[id]/alternatives/[altId]/approve` | COMPLETE |
| ALT-008 | `POST .../reject` | COMPLETE |
| ALT-009 | Customer comparison card UI | COMPLETE |
| ALT-010 | Update selections on approve | COMPLETE |
| ALT-011 | Notification hooks | COMPLETE |
| ALT-012 | lint, typecheck, build | COMPLETE |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| ALT-T001 | Vitest alternative-status | COMPLETE |
| ALT-T002 | API route tests | COMPLETE |
| ALT-T003 | E2E suggest/approve/reject/withdraw | COMPLETE |
| ALT-T004 | lint, typecheck, build, test | COMPLETE |

---

## 5. Acceptance Criteria

- Suggested Alternative flow end-to-end per PRD
- Agency-centric; customer explicit approval
- All ALT-T* pass
