# Customer Requests — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Customer Requests |
| Branch | `module/customer-requests` |
| Status | COMPLETE |
| Depends on | Staffing Requests (6), Facilities (5), Public Marketplace (19), Request Routing (21) |

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| CRQ-001 | Migration: `source`, `fulfillment_status` on `staffing_requests` | DONE |
| CRQ-002 | Migration: `staffing_request_selections` | DONE |
| CRQ-003 | `lib/validations/customer-request.ts` | DONE |
| CRQ-004 | `lib/customer-requests/create-customer-request.ts` | DONE |
| CRQ-005 | `POST /api/customer/requests` | DONE |
| CRQ-006 | `GET /api/customer/requests` + `[id]` | DONE |
| CRQ-007 | `app/customer/requests/page.tsx` list | DONE |
| CRQ-008 | `app/customer/requests/new/page.tsx` form | DONE |
| CRQ-009 | Load cart from sessionStorage | DONE |
| CRQ-010 | Selected professionals review UI | DONE |
| CRQ-011 | `app/customer/requests/[id]/page.tsx` detail | DONE |
| CRQ-012 | Invoke `routeStaffingRequest` on success | DONE |
| CRQ-013 | Duplicate detection | DONE |
| CRQ-014 | Customer layout shell / nav link | DONE |
| CRQ-015 | lint, typecheck, build | DONE |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| CRQ-T001 | Vitest validation + create | DONE |
| CRQ-T002 | API tests | DONE |
| CRQ-T003 | E2E access + create + list | DONE |
| CRQ-T004 | lint, typecheck, build, test | DONE |
