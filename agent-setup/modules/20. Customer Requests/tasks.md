# Customer Requests — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Customer Requests |
| Branch | `module/customer-requests` |
| Status | PENDING |
| Depends on | Staffing Requests (6), Facilities (5), Public Marketplace (19), Request Routing (21) |

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| CRQ-001 | Migration: `source`, `fulfillment_status` on `staffing_requests` | PENDING |
| CRQ-002 | Migration: `staffing_request_selections` | PENDING |
| CRQ-003 | `lib/validations/customer-request.ts` | PENDING |
| CRQ-004 | `lib/customer-requests/create-customer-request.ts` | PENDING |
| CRQ-005 | `POST /api/customer/requests` | PENDING |
| CRQ-006 | `GET /api/customer/requests` + `[id]` | PENDING |
| CRQ-007 | `app/customer/requests/page.tsx` list | PENDING |
| CRQ-008 | `app/customer/requests/new/page.tsx` form | PENDING |
| CRQ-009 | Load cart from sessionStorage | PENDING |
| CRQ-010 | Selected professionals review UI | PENDING |
| CRQ-011 | `app/customer/requests/[id]/page.tsx` detail | PENDING |
| CRQ-012 | Invoke `routeStaffingRequest` on success | PENDING |
| CRQ-013 | Duplicate detection | PENDING |
| CRQ-014 | Customer layout shell / nav link | PENDING |
| CRQ-015 | lint, typecheck, build | PENDING |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| CRQ-T001 | Vitest validation + create | PENDING |
| CRQ-T002 | API tests | PENDING |
| CRQ-T003 | E2E access + create + list | PENDING |
| CRQ-T004 | lint, typecheck, build, test | PENDING |
